-- AO Houston spatial feature store v1.
-- Supabase/PostgreSQL migration. Review extension availability before applying.
-- This creates an isolated evidence/geometry schema; it does not write world state.

begin;
set local search_path = extensions, public, pg_catalog;

create schema if not exists extensions;
create extension if not exists postgis with schema extensions;

create schema if not exists ao_spatial;
revoke all on schema ao_spatial from public, anon, authenticated;
grant usage on schema ao_spatial to service_role;

create table ao_spatial.spatial_profiles (
    profile_key text not null,
    profile_version integer not null check (profile_version > 0),
    profile_state text not null check (
        profile_state in ('draft', 'validated', 'approved', 'retired')
    ),
    horizontal_working_crs text not null,
    horizontal_unit text not null,
    metres_per_unit_numerator bigint not null check (metres_per_unit_numerator > 0),
    metres_per_unit_denominator bigint not null check (metres_per_unit_denominator > 0),
    origin_easting numeric,
    origin_northing numeric,
    ao_axis_x text not null default 'east' check (ao_axis_x = 'east'),
    ao_axis_y text not null default 'south' check (ao_axis_y = 'south'),
    ao_axis_z text not null default 'up' check (ao_axis_z = 'up'),
    ao_subunits_per_metre integer not null default 1000 check (ao_subunits_per_metre > 0),
    surface_cell_size_mm integer not null default 1000 check (surface_cell_size_mm > 0),
    chunk_size_cells integer not null default 64 check (chunk_size_cells > 0),
    rounding_rule text not null check (
        rounding_rule = 'decimal_round_half_away_from_zero'
    ),
    source_to_working_crs_pipeline text,
    working_crs_to_ao_pipeline text not null,
    vertical_crs text,
    vertical_unit text,
    horizontal_accuracy_budget_m numeric check (
        horizontal_accuracy_budget_m is null or horizontal_accuracy_budget_m >= 0
    ),
    approval_record jsonb not null default '{}'::jsonb
        check (jsonb_typeof(approval_record) = 'object'),
    created_at timestamptz not null default now(),
    primary key (profile_key, profile_version),
    check (
        profile_state <> 'approved'
        or (
            origin_easting is not null
            and origin_northing is not null
            and source_to_working_crs_pipeline is not null
            and approval_record ? 'kernel_approval_id'
        )
    )
);

comment on table ao_spatial.spatial_profiles is
'Versioned coordinate contracts. Changing origin, CRS, axis, unit or scale requires a new profile version and migration plan.';

create or replace function ao_spatial.guard_approved_profile_update()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
    if old.profile_state = 'retired' then
        raise exception 'retired spatial profiles are immutable';
    end if;
    if old.profile_state = 'approved' then
        if new.profile_state not in ('approved', 'retired')
           or (to_jsonb(new) - 'profile_state') is distinct from
              (to_jsonb(old) - 'profile_state') then
            raise exception 'approved spatial profiles are immutable; create a new version';
        end if;
    end if;
    return new;
end;
$$;

create trigger spatial_profiles_immutable_after_approval
before update on ao_spatial.spatial_profiles
for each row execute function ao_spatial.guard_approved_profile_update();

create table ao_spatial.source_datasets (
    source_dataset_id uuid primary key default gen_random_uuid(),
    dataset_key text not null,
    publisher text not null,
    dataset_title text not null,
    source_uri text not null,
    source_layer text,
    source_version text,
    source_crs text not null,
    source_vertical_crs text,
    licence_terms text,
    attribution text,
    retrieval_metadata jsonb not null default '{}'::jsonb
        check (jsonb_typeof(retrieval_metadata) = 'object'),
    coverage_geom geometry(Geometry),
    coverage_crs text,
    known_omissions text,
    created_at timestamptz not null default now(),
    unique (dataset_key, source_version)
);

create index source_datasets_coverage_gix
    on ao_spatial.source_datasets using gist (coverage_geom);

comment on table ao_spatial.source_datasets is
'Source register and provenance. Coverage geometry is in coverage_crs, not AO local coordinates.';

create table ao_spatial.import_runs (
    import_run_id uuid primary key default gen_random_uuid(),
    source_dataset_id uuid not null
        references ao_spatial.source_datasets(source_dataset_id),
    profile_key text not null,
    profile_version integer not null,
    run_state text not null default 'created' check (
        run_state in ('created', 'acquired', 'validated', 'staged', 'rejected', 'failed')
    ),
    source_snapshot_sha256 char(64) check (
        source_snapshot_sha256 is null
        or source_snapshot_sha256 ~ '^[0-9a-f]{64}$'
    ),
    target_area_ao geometry(Geometry, 0),
    started_at timestamptz not null default now(),
    completed_at timestamptz,
    feature_counts jsonb not null default '{}'::jsonb
        check (jsonb_typeof(feature_counts) = 'object'),
    validation_report jsonb not null default '{}'::jsonb
        check (jsonb_typeof(validation_report) = 'object'),
    kernel_approval_id text,
    foreign key (profile_key, profile_version)
        references ao_spatial.spatial_profiles(profile_key, profile_version),
    unique (import_run_id, source_dataset_id),
    check (completed_at is null or completed_at >= started_at)
);

create index import_runs_target_area_gix
    on ao_spatial.import_runs using gist (target_area_ao);

comment on table ao_spatial.import_runs is
'Tracks reproducible source acquisition and validation. A staged run is not canonical world state.';

create table ao_spatial.source_features (
    source_feature_id uuid primary key default gen_random_uuid(),
    import_run_id uuid not null,
    source_dataset_id uuid not null,
    source_feature_key text not null,
    source_crs text not null,
    source_geom geometry(Geometry),
    raw_attributes jsonb not null default '{}'::jsonb
        check (jsonb_typeof(raw_attributes) = 'object'),
    source_feature_sha256 char(64) check (
        source_feature_sha256 is null
        or source_feature_sha256 ~ '^[0-9a-f]{64}$'
    ),
    geometry_status text not null default 'unreviewed' check (
        geometry_status in ('unreviewed', 'valid', 'invalid', 'missing')
    ),
    captured_at timestamptz not null default now(),
    foreign key (import_run_id, source_dataset_id)
        references ao_spatial.import_runs(import_run_id, source_dataset_id),
    unique (import_run_id, source_feature_key)
);

create index source_features_geom_gix
    on ao_spatial.source_features using gist (source_geom);
create index source_features_run_idx
    on ao_spatial.source_features (import_run_id);

comment on table ao_spatial.source_features is
'Immutable source snapshot records. Preserve original geometry and attributes even when invalid or incomplete.';

create or replace function ao_spatial.reject_source_feature_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
    raise exception 'ao_spatial.source_features is append-only; create a new import run';
end;
$$;

create trigger source_features_no_update
before update or delete on ao_spatial.source_features
for each row execute function ao_spatial.reject_source_feature_mutation();

create table ao_spatial.canonical_features (
    canonical_feature_id uuid primary key default gen_random_uuid(),
    source_feature_id uuid not null
        references ao_spatial.source_features(source_feature_id),
    profile_key text not null,
    profile_version integer not null,
    feature_kind text not null check (
        feature_kind in (
            'building_footprint', 'parcel', 'road_centerline', 'road_surface',
            'sidewalk', 'bridge', 'waterbody', 'terrain', 'entrance',
            'tunnel_path', 'address_point', 'other'
        )
    ),
    canonical_geom geometry(Geometry, 0) not null,
    feature_status text not null default 'derived_candidate' check (
        feature_status in (
            'source_verified', 'derived_candidate', 'needs_review',
            'accepted_for_staging', 'rejected'
        )
    ),
    transform_version text not null,
    positional_accuracy_m numeric check (
        positional_accuracy_m is null or positional_accuracy_m >= 0
    ),
    derivation_metadata jsonb not null default '{}'::jsonb
        check (jsonb_typeof(derivation_metadata) = 'object'),
    created_at timestamptz not null default now(),
    foreign key (profile_key, profile_version)
        references ao_spatial.spatial_profiles(profile_key, profile_version),
    unique (source_feature_id, profile_key, profile_version, feature_kind)
);

create index canonical_features_geom_gix
    on ao_spatial.canonical_features using gist (canonical_geom);
create index canonical_features_kind_status_idx
    on ao_spatial.canonical_features (feature_kind, feature_status);
create index canonical_features_profile_idx
    on ao_spatial.canonical_features (profile_key, profile_version);

comment on column ao_spatial.canonical_features.canonical_geom is
'AO local engineering coordinates in integer millimetres, SRID 0 by design; never label this geometry as EPSG:2278 or longitude/latitude.';
comment on table ao_spatial.canonical_features is
'Normalized projected geometry and evidence status. This is not the AO world-state/entity table; Kernel approval is a separate step.';

create or replace function ao_spatial.guard_canonical_feature_update()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
    if new.source_feature_id is distinct from old.source_feature_id
       or new.profile_key is distinct from old.profile_key
       or new.profile_version is distinct from old.profile_version
       or new.feature_kind is distinct from old.feature_kind
       or new.canonical_geom is distinct from old.canonical_geom
       or new.transform_version is distinct from old.transform_version then
        raise exception 'canonical feature identity/geometry is immutable; create a new version';
    end if;
    return new;
end;
$$;

create trigger canonical_features_identity_immutable
before update on ao_spatial.canonical_features
for each row execute function ao_spatial.guard_canonical_feature_update();

alter table ao_spatial.spatial_profiles enable row level security;
alter table ao_spatial.source_datasets enable row level security;
alter table ao_spatial.import_runs enable row level security;
alter table ao_spatial.source_features enable row level security;
alter table ao_spatial.canonical_features enable row level security;

alter table ao_spatial.spatial_profiles force row level security;
alter table ao_spatial.source_datasets force row level security;
alter table ao_spatial.import_runs force row level security;
alter table ao_spatial.source_features force row level security;
alter table ao_spatial.canonical_features force row level security;

create policy spatial_profiles_service_role
    on ao_spatial.spatial_profiles for all to service_role
    using (true) with check (true);
create policy source_datasets_service_role
    on ao_spatial.source_datasets for all to service_role
    using (true) with check (true);
create policy import_runs_service_role
    on ao_spatial.import_runs for all to service_role
    using (true) with check (true);
create policy source_features_service_role
    on ao_spatial.source_features for all to service_role
    using (true) with check (true);
create policy canonical_features_service_role
    on ao_spatial.canonical_features for all to service_role
    using (true) with check (true);

revoke all on all tables in schema ao_spatial from public, anon, authenticated;
grant select, insert, update on ao_spatial.spatial_profiles to service_role;
grant select, insert, update on ao_spatial.source_datasets to service_role;
grant select, insert, update on ao_spatial.import_runs to service_role;
grant select, insert on ao_spatial.source_features to service_role;
grant select, insert, update on ao_spatial.canonical_features to service_role;

commit;

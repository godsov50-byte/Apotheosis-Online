-- AO Houston street registry extension.
-- Apply after 00100 spatial features, 00200 spatial scaffold, and 00300 deterministic registry.
-- Stores sourced road evidence; it does not create Kernel world entities or routing authority.
begin;
create table ao_spatial.street_segment_records (
 street_segment_id uuid primary key default gen_random_uuid(),
 source_feature_id uuid not null unique references ao_spatial.source_features(source_feature_id),
 spatial_object_id uuid unique references ao_spatial.spatial_objects(spatial_object_id),
 identity_key text not null unique,
 identity_namespace text not null,
 source_record_key text not null,
 source_global_id text not null,
 source_object_id text not null,
 source_centerline_id text,
 created_at timestamptz not null default now(),
 unique(identity_namespace,source_record_key),
 unique(identity_namespace,source_global_id)
);
create index street_segment_records_centerline_idx on ao_spatial.street_segment_records(source_centerline_id);
comment on table ao_spatial.street_segment_records is
'Permanent source-based identity for one road-centerline feature. Optional spatial_object_id links a later Kernel-approved spatial object; source evidence is not world state.';

create table ao_spatial.street_segment_revisions (
 street_segment_revision_id uuid primary key default gen_random_uuid(),
 street_segment_id uuid not null references ao_spatial.street_segment_records(street_segment_id),
 revision_number bigint not null check(revision_number>0),
 source_feature_id uuid not null references ao_spatial.source_features(source_feature_id),
 display_name text,
 normalized_name text,
 raw_properties jsonb not null check(jsonb_typeof(raw_properties)='object'),
 property_provenance jsonb not null check(jsonb_typeof(property_provenance)='object'),
 geometry_status text not null check(geometry_status in ('present','missing','invalid')),
 content_sha256 char(64) not null check(content_sha256 ~ '^[0-9a-f]{64}$'),
 source_manifest jsonb not null check(jsonb_typeof(source_manifest)='object'),
 created_at timestamptz not null default now(),
 unique(street_segment_id,revision_number)
);
create index street_segment_revisions_latest_idx on ao_spatial.street_segment_revisions(street_segment_id,revision_number desc);
comment on table ao_spatial.street_segment_revisions is
'Append-only source/property snapshots. Null source values remain null; changed observations create new revisions.';

create table ao_spatial.street_name_observations (
 street_name_observation_id uuid primary key default gen_random_uuid(),
 street_segment_revision_id uuid not null references ao_spatial.street_segment_revisions(street_segment_revision_id),
 observed_name text not null,
 normalized_name text not null,
 name_role text not null default 'source_reported'
   check(name_role in ('source_reported','verified_alias','historical_alias','admin_alias')),
 evidence_manifest jsonb not null check(jsonb_typeof(evidence_manifest)='object'),
 created_at timestamptz not null default now()
);
create index street_name_observations_lookup_idx on ao_spatial.street_name_observations(normalized_name);
comment on table ao_spatial.street_name_observations is
'Versioned name observations and aliases. Names are not identity; the same name can label disconnected road segments.';

create view ao_spatial.street_name_groups_current as
select normalized_name,min(observed_name) as display_name,
 count(distinct r.street_segment_id) as segment_count,
 array_agg(distinct r.identity_key order by r.identity_key) as segment_identity_keys
from ao_spatial.street_name_observations n
join ao_spatial.street_segment_revisions v using(street_segment_revision_id)
join ao_spatial.street_segment_records r using(street_segment_id)
where n.name_role in ('source_reported','verified_alias','admin_alias')
group by normalized_name;
comment on view ao_spatial.street_name_groups_current is
'Derived name-search grouping only, not a physical corridor identity or route edge.';

create or replace function ao_spatial.reject_street_history_mutation()
returns trigger language plpgsql set search_path=pg_catalog as $$
begin raise exception 'AO street history is append-only; create a new revision or observation'; end;
$$;
create trigger street_segment_revisions_append_only before update or delete
on ao_spatial.street_segment_revisions for each row execute function ao_spatial.reject_street_history_mutation();
create trigger street_name_observations_append_only before update or delete
on ao_spatial.street_name_observations for each row execute function ao_spatial.reject_street_history_mutation();

alter table ao_spatial.street_segment_records enable row level security;
alter table ao_spatial.street_segment_revisions enable row level security;
alter table ao_spatial.street_name_observations enable row level security;
alter table ao_spatial.street_segment_records force row level security;
alter table ao_spatial.street_segment_revisions force row level security;
alter table ao_spatial.street_name_observations force row level security;
create policy street_segment_records_service_role on ao_spatial.street_segment_records for all to service_role using(true) with check(true);
create policy street_segment_revisions_service_role on ao_spatial.street_segment_revisions for all to service_role using(true) with check(true);
create policy street_name_observations_service_role on ao_spatial.street_name_observations for all to service_role using(true) with check(true);
revoke all on ao_spatial.street_segment_records,ao_spatial.street_segment_revisions,ao_spatial.street_name_observations from public,anon,authenticated;
grant select,insert,update on ao_spatial.street_segment_records to service_role;
grant select,insert on ao_spatial.street_segment_revisions to service_role;
grant select,insert on ao_spatial.street_name_observations to service_role;
grant select on ao_spatial.street_name_groups_current to service_role;
commit;

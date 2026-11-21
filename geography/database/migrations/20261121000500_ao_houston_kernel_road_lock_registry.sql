-- AO Houston Kernel-authorized immutable road lock registry.
-- Apply after migrations 00100-00400. Artifact only; not deployed by this change.
-- Locked geometry is copied from the exact immutable source feature snapshot.
begin;

create table ao_spatial.road_lock_proposals (
  road_lock_proposal_id uuid primary key default gen_random_uuid(),
  street_segment_id uuid not null references ao_spatial.street_segment_records(street_segment_id),
  street_segment_revision_id uuid not null references ao_spatial.street_segment_revisions(street_segment_revision_id),
  source_feature_id uuid not null references ao_spatial.source_features(source_feature_id),
  proposed_by text not null,
  proposal_reason text not null,
  evidence_manifest jsonb not null check (jsonb_typeof(evidence_manifest)='object'),
  created_at timestamptz not null default now(),
  unique (road_lock_proposal_id, street_segment_id, street_segment_revision_id, source_feature_id)
);
comment on table ao_spatial.road_lock_proposals is
'Append-only request to lock one exact source-backed street revision. A proposal does not lock or authorize geometry.';

create table ao_spatial.road_lock_decisions (
  road_lock_decision_id uuid primary key default gen_random_uuid(),
  road_lock_proposal_id uuid not null references ao_spatial.road_lock_proposals(road_lock_proposal_id),
  decision text not null check (decision in ('approved','rejected','needs_more_evidence')),
  sovereign_approval_id text,
  kernel_decision_id text,
  decided_by text not null,
  decision_notes text,
  decided_at timestamptz not null default now(),
  check (decision <> 'approved' or
    (sovereign_approval_id is not null and kernel_decision_id is not null)),
  unique (road_lock_decision_id, road_lock_proposal_id)
);
comment on table ao_spatial.road_lock_decisions is
'Append-only Sovereign/Kernel decision ledger. Only an approved decision with both approval identifiers can authorize a lock.';

create table ao_spatial.locked_road_records (
  locked_road_record_id uuid primary key default gen_random_uuid(),
  road_lock_proposal_id uuid not null,
  road_lock_decision_id uuid not null,
  street_segment_id uuid not null,
  street_segment_revision_id uuid not null,
  source_feature_id uuid not null,
  locked_geometry extensions.geometry(Geometry,4326) not null,
  geometry_sha256 char(64) not null check (geometry_sha256 ~ '^[0-9a-f]{64}$'),
  source_snapshot_sha256 char(64),
  coordinate_order text not null default 'longitude_latitude'
    check (coordinate_order='longitude_latitude'),
  lock_version bigint not null default 1 check (lock_version>0),
  locked_at timestamptz not null default now(),
  foreign key (road_lock_proposal_id,street_segment_id,street_segment_revision_id,source_feature_id)
    references ao_spatial.road_lock_proposals
      (road_lock_proposal_id,street_segment_id,street_segment_revision_id,source_feature_id),
  foreign key (road_lock_decision_id,road_lock_proposal_id)
    references ao_spatial.road_lock_decisions(road_lock_decision_id,road_lock_proposal_id),
  foreign key (street_segment_id) references ao_spatial.street_segment_records(street_segment_id),
  foreign key (street_segment_revision_id) references ao_spatial.street_segment_revisions(street_segment_revision_id),
  foreign key (source_feature_id) references ao_spatial.source_features(source_feature_id),
  unique (street_segment_id,lock_version),
  unique (street_segment_revision_id)
);
create index locked_road_records_geom_gix
  on ao_spatial.locked_road_records using gist(locked_geometry);
create index locked_road_records_segment_idx
  on ao_spatial.locked_road_records(street_segment_id,lock_version desc);
comment on table ao_spatial.locked_road_records is
'Kernel-authorized immutable copy of one source centerline geometry. Read-only spatial truth for consumers; not a routable graph or lane surface.';

create or replace function ao_spatial.validate_locked_road_insert()
returns trigger language plpgsql set search_path=pg_catalog,extensions,ao_spatial as $$
declare
  v_decision ao_spatial.road_lock_decisions%rowtype;
  v_source_geom extensions.geometry;
begin
  select * into v_decision
  from ao_spatial.road_lock_decisions
  where road_lock_decision_id=new.road_lock_decision_id
    and road_lock_proposal_id=new.road_lock_proposal_id;
  if not found or v_decision.decision <> 'approved'
     or v_decision.sovereign_approval_id is null
     or v_decision.kernel_decision_id is null then
    raise exception 'A locked road requires an approved Sovereign/Kernel decision';
  end if;

  select source_geom into v_source_geom
  from ao_spatial.source_features where source_feature_id=new.source_feature_id;
  if not found or v_source_geom is null then
    raise exception 'A locked road requires a source feature with geometry';
  end if;
  if ST_SRID(new.locked_geometry) <> 4326
     or GeometryType(new.locked_geometry) not in ('LINESTRING','MULTILINESTRING')
     or not ST_IsValid(new.locked_geometry)
     or ST_NPoints(new.locked_geometry) < 2 then
    raise exception 'Locked road geometry must be valid WGS84 line geometry';
  end if;
  if ST_SRID(v_source_geom) <> 4326
     or ST_AsEWKB(new.locked_geometry) is distinct from ST_AsEWKB(v_source_geom) then
    raise exception 'Locked geometry must exactly match its immutable WGS84 source snapshot';
  end if;
  if not exists (
    select 1 from ao_spatial.street_segment_revisions r
    where r.street_segment_revision_id=new.street_segment_revision_id
      and r.street_segment_id=new.street_segment_id
      and r.source_feature_id=new.source_feature_id
  ) then
    raise exception 'Road lock must target the matching segment revision and source feature';
  end if;
  return new;
end;
$$;
create trigger locked_road_records_validate_insert
before insert on ao_spatial.locked_road_records
for each row execute function ao_spatial.validate_locked_road_insert();

create or replace function ao_spatial.reject_locked_road_mutation()
returns trigger language plpgsql set search_path=pg_catalog as $$
begin
  raise exception 'Locked road records are immutable; submit an append-only correction proposal';
end;
$$;
create trigger locked_road_records_immutable
before update or delete on ao_spatial.locked_road_records
for each row execute function ao_spatial.reject_locked_road_mutation();

create table ao_spatial.road_image_references (
  road_image_reference_id uuid primary key default gen_random_uuid(),
  locked_road_record_id uuid not null references ao_spatial.locked_road_records(locked_road_record_id),
  image_type text not null check (image_type in ('street_level','aerial','satellite','other','unresolved')),
  reference_status text not null check (reference_status in ('candidate','verified','rejected')),
  reference_uri text,
  provider text,
  captured_at timestamptz,
  viewpoint extensions.geometry(Point,4326),
  licence_or_usage text,
  content_sha256 char(64) check (content_sha256 is null or content_sha256 ~ '^[0-9a-f]{64}$'),
  verification_note text,
  created_at timestamptz not null default now(),
  check (reference_status <> 'verified' or
    (reference_uri is not null and provider is not null and licence_or_usage is not null)),
  check (viewpoint is null or ST_SRID(viewpoint)=4326)
);
create index road_image_references_record_idx
  on ao_spatial.road_image_references(locked_road_record_id,reference_status,image_type);
comment on table ao_spatial.road_image_references is
'Exact source image references associated with a locked road. The record stores references and provenance, never fabricated or regenerated substitutes.';

create or replace function ao_spatial.reject_road_lock_history_mutation()
returns trigger language plpgsql set search_path=pg_catalog as $$
begin
  raise exception 'Road lock decisions and image references are append-only';
end;
$$;
create trigger road_lock_proposals_append_only before update or delete
  on ao_spatial.road_lock_proposals for each row execute function ao_spatial.reject_road_lock_history_mutation();
create trigger road_lock_decisions_append_only before update or delete
  on ao_spatial.road_lock_decisions for each row execute function ao_spatial.reject_road_lock_history_mutation();
create trigger road_image_references_append_only before update or delete
  on ao_spatial.road_image_references for each row execute function ao_spatial.reject_road_lock_history_mutation();

alter table ao_spatial.road_lock_proposals enable row level security;
alter table ao_spatial.road_lock_decisions enable row level security;
alter table ao_spatial.locked_road_records enable row level security;
alter table ao_spatial.road_image_references enable row level security;
alter table ao_spatial.road_lock_proposals force row level security;
alter table ao_spatial.road_lock_decisions force row level security;
alter table ao_spatial.locked_road_records force row level security;
alter table ao_spatial.road_image_references force row level security;

create policy road_lock_proposals_service_role on ao_spatial.road_lock_proposals
  for all to service_role using(true) with check(true);
create policy road_lock_decisions_service_role on ao_spatial.road_lock_decisions
  for all to service_role using(true) with check(true);
create policy locked_road_records_service_role on ao_spatial.locked_road_records
  for all to service_role using(true) with check(true);
create policy road_image_references_service_role on ao_spatial.road_image_references
  for all to service_role using(true) with check(true);

revoke all on ao_spatial.road_lock_proposals,ao_spatial.road_lock_decisions,
  ao_spatial.locked_road_records,ao_spatial.road_image_references
  from public,anon,authenticated;
grant select,insert on ao_spatial.road_lock_proposals to service_role;
grant select,insert on ao_spatial.road_lock_decisions to service_role;
grant select,insert on ao_spatial.locked_road_records to service_role;
grant select,insert on ao_spatial.road_image_references to service_role;

commit;

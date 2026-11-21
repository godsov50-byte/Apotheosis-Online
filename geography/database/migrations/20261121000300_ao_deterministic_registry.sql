-- AO deterministic identity, revision, visual-reference and correction ledger.
-- Migration artifact only; apply after the 00100 and 00200 spatial migrations.
-- This is an evidence/admin registry, not a replacement for Kernel or WorldHeart.
begin;
create table ao_spatial.object_identities (
 identity_id uuid primary key default gen_random_uuid(),
 spatial_object_id uuid not null references ao_spatial.spatial_objects(spatial_object_id),
 identity_namespace text not null,
 source_record_key text not null,
 identity_key text not null unique,
 identity_role text not null default 'primary' check(identity_role in ('primary','source_alias','legacy_alias')),
 created_at timestamptz not null default now(),
 unique(identity_namespace,source_record_key),
 unique(spatial_object_id,identity_namespace,source_record_key)
);
create index object_identities_object_idx on ao_spatial.object_identities(spatial_object_id);
comment on table ao_spatial.object_identities is 'Permanent source identities and aliases. Names and coordinates are mutable attributes, never object identity.';
create table ao_spatial.object_revisions (
 object_revision_id uuid primary key default gen_random_uuid(),
 spatial_object_id uuid not null references ao_spatial.spatial_objects(spatial_object_id),
 revision_number bigint not null check(revision_number>0),
 record_snapshot jsonb not null check(jsonb_typeof(record_snapshot)='object'),
 content_sha256 char(64) not null check(content_sha256 ~ '^[0-9a-f]{64}$'),
 source_manifest jsonb not null default '{}'::jsonb check(jsonb_typeof(source_manifest)='object'),
 coordinate_profile_key text,
 coordinate_profile_version integer,
 created_at timestamptz not null default now(),
 unique(spatial_object_id,revision_number),
 foreign key(coordinate_profile_key,coordinate_profile_version) references ao_spatial.spatial_profiles(profile_key,profile_version),
 check((coordinate_profile_key is null and coordinate_profile_version is null) or (coordinate_profile_key is not null and coordinate_profile_version is not null))
);
create index object_revisions_latest_idx on ao_spatial.object_revisions(spatial_object_id,revision_number desc);
comment on table ao_spatial.object_revisions is 'Append-only snapshots with content digests and provenance. Committed world events remain in WorldHeart.';
create table ao_spatial.visual_references (
 visual_reference_id uuid primary key default gen_random_uuid(),
 spatial_object_id uuid not null references ao_spatial.spatial_objects(spatial_object_id),
 object_revision_id uuid references ao_spatial.object_revisions(object_revision_id),
 visual_slot text not null,
 reference_uri text not null,
 content_sha256 char(64) check(content_sha256 is null or content_sha256 ~ '^[0-9a-f]{64}$'),
 reference_kind text not null check(reference_kind in ('approved_original','approved_reference','generated_candidate','archive')),
 provenance jsonb not null default '{}'::jsonb check(jsonb_typeof(provenance)='object'),
 created_at timestamptz not null default now()
);
create index visual_references_object_slot_idx on ao_spatial.visual_references(spatial_object_id,visual_slot,created_at desc);
comment on table ao_spatial.visual_references is 'Stable references to approved originals and visual candidates. Exact reuse retrieves stored assets, not regenerated approximations.';
create table ao_spatial.generation_manifests (
 generation_manifest_id uuid primary key default gen_random_uuid(),
 artifact_kind text not null,
 source_object_ids uuid[] not null check(cardinality(source_object_ids)>0),
 source_revision_ids uuid[] not null default '{}',
 rule_version text not null,
 prompt_template_version text not null,
 deterministic_seed text not null,
 output_uri text,
 output_sha256 char(64) check(output_sha256 is null or output_sha256 ~ '^[0-9a-f]{64}$'),
 generation_parameters jsonb not null default '{}'::jsonb check(jsonb_typeof(generation_parameters)='object'),
 created_at timestamptz not null default now()
);
create index generation_manifests_kind_idx on ao_spatial.generation_manifests(artifact_kind,created_at desc);
comment on table ao_spatial.generation_manifests is 'Stores source IDs/revisions, rule/template versions, seed and output digest. A seed alone cannot guarantee identical output across model versions.';
create table ao_spatial.correction_proposals (
 correction_proposal_id uuid primary key default gen_random_uuid(),
 spatial_object_id uuid not null references ao_spatial.spatial_objects(spatial_object_id),
 target_revision_id uuid not null references ao_spatial.object_revisions(object_revision_id),
 property_path text not null,
 observed_value jsonb not null,
 proposed_value jsonb not null,
 evidence_manifest jsonb not null check(jsonb_typeof(evidence_manifest)='object'),
 discrepancy_kind text not null check(discrepancy_kind in ('coordinate','geometry','identity','attribute','visual_reference','lore','other')),
 created_by text not null,
 created_at timestamptz not null default now()
);
create index correction_proposals_object_idx on ao_spatial.correction_proposals(spatial_object_id,created_at desc);
create table ao_spatial.correction_decisions (
 correction_decision_id uuid primary key default gen_random_uuid(),
 correction_proposal_id uuid not null references ao_spatial.correction_proposals(correction_proposal_id),
 decision text not null check(decision in ('approved','rejected','needs_more_evidence')),
 decided_by text not null,
 kernel_approval_id text,
 decision_notes text,
 decided_at timestamptz not null default now(),
 check(decision<>'approved' or kernel_approval_id is not null)
);
create index correction_decisions_proposal_idx on ao_spatial.correction_decisions(correction_proposal_id,decided_at desc);
comment on table ao_spatial.correction_proposals is 'Evidence-backed proposed corrections only; creating a proposal never mutates the target.';
comment on table ao_spatial.correction_decisions is 'Append-only decisions. Approved changes still require Kernel application and WorldHeart commit.';
create or replace function ao_spatial.reject_registry_history_mutation()
returns trigger language plpgsql set search_path=pg_catalog as $$
begin raise exception 'AO registry history is append-only; create a new revision or decision'; end;
$$;
create trigger object_identities_immutable before update or delete on ao_spatial.object_identities for each row execute function ao_spatial.reject_registry_history_mutation();
create trigger object_revisions_append_only before update or delete on ao_spatial.object_revisions for each row execute function ao_spatial.reject_registry_history_mutation();
create trigger visual_references_append_only before update or delete on ao_spatial.visual_references for each row execute function ao_spatial.reject_registry_history_mutation();
create trigger generation_manifests_append_only before update or delete on ao_spatial.generation_manifests for each row execute function ao_spatial.reject_registry_history_mutation();
create trigger correction_proposals_append_only before update or delete on ao_spatial.correction_proposals for each row execute function ao_spatial.reject_registry_history_mutation();
create trigger correction_decisions_append_only before update or delete on ao_spatial.correction_decisions for each row execute function ao_spatial.reject_registry_history_mutation();
alter table ao_spatial.object_identities enable row level security;
alter table ao_spatial.object_revisions enable row level security;
alter table ao_spatial.visual_references enable row level security;
alter table ao_spatial.generation_manifests enable row level security;
alter table ao_spatial.correction_proposals enable row level security;
alter table ao_spatial.correction_decisions enable row level security;
alter table ao_spatial.object_identities force row level security;
alter table ao_spatial.object_revisions force row level security;
alter table ao_spatial.visual_references force row level security;
alter table ao_spatial.generation_manifests force row level security;
alter table ao_spatial.correction_proposals force row level security;
alter table ao_spatial.correction_decisions force row level security;
create policy object_identities_service_role on ao_spatial.object_identities for all to service_role using(true) with check(true);
create policy object_revisions_service_role on ao_spatial.object_revisions for all to service_role using(true) with check(true);
create policy visual_references_service_role on ao_spatial.visual_references for all to service_role using(true) with check(true);
create policy generation_manifests_service_role on ao_spatial.generation_manifests for all to service_role using(true) with check(true);
create policy correction_proposals_service_role on ao_spatial.correction_proposals for all to service_role using(true) with check(true);
create policy correction_decisions_service_role on ao_spatial.correction_decisions for all to service_role using(true) with check(true);
revoke all on ao_spatial.object_identities,ao_spatial.object_revisions,ao_spatial.visual_references,ao_spatial.generation_manifests,ao_spatial.correction_proposals,ao_spatial.correction_decisions from public,anon,authenticated;
grant select,insert on ao_spatial.object_identities to service_role;
grant select,insert on ao_spatial.object_revisions to service_role;
grant select,insert on ao_spatial.visual_references to service_role;
grant select,insert on ao_spatial.generation_manifests to service_role;
grant select,insert on ao_spatial.correction_proposals to service_role;
grant select,insert on ao_spatial.correction_decisions to service_role;
commit;

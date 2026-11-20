-- AO geographic registry foundation
-- Persistence only: the AO Kernel remains the authority for validation and approval.
-- S2 identifiers are stored as text to preserve the full unsigned 64-bit value.

begin;

create schema if not exists ao_geo;
revoke all on schema ao_geo from public, anon, authenticated;
grant usage on schema ao_geo to service_role;

create table if not exists ao_geo.registry_versions (
  id uuid primary key default gen_random_uuid(),
  schema_version text not null,
  authority text not null default 'S2 Geometry',
  coordinate_model text not null,
  area_model jsonb not null,
  content_sha256 text,
  record_count integer not null check (record_count >= 0),
  status text not null default 'staged'
    check (status in ('staged', 'validated', 'approved', 'superseded', 'rejected')),
  source_label text not null,
  created_at timestamptz not null default now(),
  validated_at timestamptz,
  approved_at timestamptz,
  approved_by text,
  notes text,
  constraint registry_versions_hash_format
    check (content_sha256 is null or content_sha256 ~ '^[0-9a-f]{64}$')
);

create table if not exists ao_geo.cells (
  cell_id text primary key
    check (cell_id ~ '^[0-9A-F]{16}$'),
  s2_token text not null,
  face smallint not null check (face between 0 and 5),
  level smallint not null check (level between 0 and 30),
  parent_cell_id text references ao_geo.cells(cell_id),
  center jsonb not null,
  boundary jsonb not null,
  area jsonb not null,
  first_seen_in_version uuid not null references ao_geo.registry_versions(id),
  created_at timestamptz not null default now(),
  constraint cells_parent_level check (
    (level = 0 and parent_cell_id is null) or
    (level > 0 and parent_cell_id is not null)
  ),
  constraint cells_not_own_parent check (parent_cell_id is null or parent_cell_id <> cell_id)
);

create index if not exists cells_parent_idx on ao_geo.cells(parent_cell_id);
create index if not exists cells_face_level_idx on ao_geo.cells(face, level);
create index if not exists cells_first_seen_idx on ao_geo.cells(first_seen_in_version);

create table if not exists ao_geo.cell_children (
  parent_cell_id text not null references ao_geo.cells(cell_id),
  child_cell_id text not null unique references ao_geo.cells(cell_id),
  registry_version_id uuid not null references ao_geo.registry_versions(id),
  primary key (parent_cell_id, child_cell_id),
  constraint cell_children_not_self check (parent_cell_id <> child_cell_id)
);

create table if not exists ao_geo.cell_neighbors (
  cell_id text not null references ao_geo.cells(cell_id),
  neighbor_cell_id text not null references ao_geo.cells(cell_id),
  relation text not null check (relation in ('edge', 'vertex_only')),
  registry_version_id uuid not null references ao_geo.registry_versions(id),
  primary key (cell_id, neighbor_cell_id),
  constraint cell_neighbors_not_self check (cell_id <> neighbor_cell_id)
);

create index if not exists cell_neighbors_reverse_idx
  on ao_geo.cell_neighbors(neighbor_cell_id, cell_id);
create index if not exists cell_neighbors_relation_idx
  on ao_geo.cell_neighbors(relation);

create table if not exists ao_geo.cell_metadata_versions (
  id bigint generated always as identity primary key,
  cell_id text not null references ao_geo.cells(cell_id),
  version_no integer not null check (version_no > 0),
  display_name text,
  classification text,
  metadata jsonb not null default '{}'::jsonb,
  registry_version_id uuid not null references ao_geo.registry_versions(id),
  recorded_at timestamptz not null default now(),
  recorded_by text,
  unique (cell_id, version_no)
);

create index if not exists cell_metadata_cell_version_idx
  on ao_geo.cell_metadata_versions(cell_id, version_no desc);

-- All registry tables are private to trusted backend access. No browser roles
-- receive policies or write grants. The service role is used only by the
-- trusted AO ingestion service after Kernel validation/approval.
alter table ao_geo.registry_versions enable row level security;
alter table ao_geo.cells enable row level security;
alter table ao_geo.cell_children enable row level security;
alter table ao_geo.cell_neighbors enable row level security;
alter table ao_geo.cell_metadata_versions enable row level security;

revoke all on all tables in schema ao_geo from public, anon, authenticated;
grant select, insert, update on all tables in schema ao_geo to service_role;
grant usage, select on all sequences in schema ao_geo to service_role;

commit;

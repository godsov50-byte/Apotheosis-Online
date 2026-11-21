-- AO Spatial Addressing v1 — additive persistence schema proposal.
-- Apply only after the AO Kernel/WorldHeart service adapter and deployment
-- environment have been reviewed. This migration does not create or modify
-- existing live-world/entity tables.

create table if not exists public.ao_spatial_regions (
  world_id text not null,
  region_id text not null,
  coordinate_system text not null default 'local-equirectangular-wgs84',
  origin_lat double precision not null check (origin_lat between -90 and 90),
  origin_lon double precision not null check (origin_lon between -180 and 180),
  bounds_wgs84 jsonb,
  max_radius_km double precision not null default 250 check (max_radius_km > 0),
  grid_config jsonb not null default '{"chunkSizeM":1024,"tileSizeM":64,"cellSizeM":1}'::jsonb,
  source_status text not null default 'proposed'
    check (source_status in ('proposed','verified','deprecated')),
  provenance jsonb not null default '{}'::jsonb,
  schema_version integer not null default 1 check (schema_version = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (world_id, region_id)
);

create table if not exists public.ao_spatial_chunks (
  world_id text not null,
  chunk_id text not null,
  region_id text not null,
  space_id text not null,
  layer text not null check (layer in ('ground','interior','underground','aerial','water','subsurface','instance')),
  grid_config jsonb not null,
  chunk_state jsonb not null default '{}'::jsonb,
  tile_ids jsonb not null default '[]'::jsonb check (jsonb_typeof(tile_ids) = 'array'),
  entity_ids jsonb not null default '[]'::jsonb check (jsonb_typeof(entity_ids) = 'array'),
  source text not null default 'kernel',
  load_state text not null default 'known'
    check (load_state in ('known','loaded','dirty','unavailable')),
  revision bigint not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (world_id, chunk_id)
);

create index if not exists ao_spatial_chunks_region_idx
  on public.ao_spatial_chunks (world_id, region_id, space_id, layer);

create table if not exists public.ao_spatial_entity_addresses (
  world_id text not null,
  entity_id text not null,
  region_id text not null,
  space_id text not null,
  chunk_id text not null,
  tile_id text not null,
  cell_id text not null,
  layer text not null check (layer in ('ground','interior','underground','aerial','water','subsurface','instance')),
  instance_id text,
  address_key text not null,
  address jsonb not null,
  address_version bigint not null default 1 check (address_version > 0),
  updated_at timestamptz not null default now(),
  primary key (world_id, entity_id)
);

create index if not exists ao_spatial_entity_chunk_idx
  on public.ao_spatial_entity_addresses (world_id, chunk_id, layer);

create index if not exists ao_spatial_entity_instance_idx
  on public.ao_spatial_entity_addresses (world_id, instance_id)
  where instance_id is not null;

create table if not exists public.ao_spatial_transition_ledger (
  transition_id uuid primary key default gen_random_uuid(),
  world_id text not null,
  entity_id text not null,
  transition_kind text not null
    check (transition_kind in (
      'walk','run','ride','enter','exit','stairs','climb',
      'takeoff','fly','land','teleport','instance-enter',
      'instance-exit','spawn','despawn','admin-relocate'
    )),
  origin_address_key text not null,
  destination_address_key text not null,
  origin_address jsonb not null,
  destination_address jsonb not null,
  occurred_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  committed_at timestamptz not null default now(),
  schema_version integer not null default 1 check (schema_version = 1)
);

create index if not exists ao_spatial_transition_entity_time_idx
  on public.ao_spatial_transition_ledger (world_id, entity_id, occurred_at desc);

create index if not exists ao_spatial_transition_destination_idx
  on public.ao_spatial_transition_ledger (world_id, destination_address_key);

-- The committed transition ledger is append-only, including for privileged
-- application roles. Corrections are compensating events, never row edits.
create or replace function public.ao_reject_spatial_ledger_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'AO spatial transition ledger is append-only; write a compensating event';
end;
$$;

drop trigger if exists ao_spatial_ledger_no_update_delete
  on public.ao_spatial_transition_ledger;

create trigger ao_spatial_ledger_no_update_delete
before update or delete on public.ao_spatial_transition_ledger
for each row execute function public.ao_reject_spatial_ledger_mutation();

alter table public.ao_spatial_regions enable row level security;
alter table public.ao_spatial_chunks enable row level security;
alter table public.ao_spatial_entity_addresses enable row level security;
alter table public.ao_spatial_transition_ledger enable row level security;

-- No browser/client role may read or write authoritative spatial state.
-- The trusted Kernel service adapter uses the server-side service role.
drop policy if exists ao_spatial_regions_client_deny on public.ao_spatial_regions;
create policy ao_spatial_regions_client_deny on public.ao_spatial_regions
  for all to anon, authenticated using (false) with check (false);

drop policy if exists ao_spatial_chunks_client_deny on public.ao_spatial_chunks;
create policy ao_spatial_chunks_client_deny on public.ao_spatial_chunks
  for all to anon, authenticated using (false) with check (false);

drop policy if exists ao_spatial_addresses_client_deny on public.ao_spatial_entity_addresses;
create policy ao_spatial_addresses_client_deny on public.ao_spatial_entity_addresses
  for all to anon, authenticated using (false) with check (false);

drop policy if exists ao_spatial_ledger_client_deny on public.ao_spatial_transition_ledger;
create policy ao_spatial_ledger_client_deny on public.ao_spatial_transition_ledger
  for all to anon, authenticated using (false) with check (false);

revoke all on public.ao_spatial_regions from anon, authenticated;
revoke all on public.ao_spatial_chunks from anon, authenticated;
revoke all on public.ao_spatial_entity_addresses from anon, authenticated;
revoke all on public.ao_spatial_transition_ledger from anon, authenticated;
revoke update, delete, truncate on public.ao_spatial_transition_ledger from anon, authenticated;

comment on table public.ao_spatial_regions is
  'AO region-local coordinate frames and grid configuration; region bounds/provenance must be approved.';
comment on table public.ao_spatial_chunks is
  'Persistent chunk metadata/state. Runtime unloading must not delete committed chunk records.';
comment on table public.ao_spatial_entity_addresses is
  'Current derived spatial address per entity; updated only by trusted AO Kernel service.';
comment on table public.ao_spatial_transition_ledger is
  'Append-only committed movement and spatial transition history; corrections use compensating events.';

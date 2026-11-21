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

revoke all on function public.ao_reject_spatial_ledger_mutation() from public, anon, authenticated;

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


-- One trusted RPC commits the append-only event, current entity address, and
-- destination chunk in a single database transaction. The caller must be the
-- server-side AO Kernel/WorldHeart service adapter, never a browser client.
create or replace function public.ao_commit_spatial_transition(
  p_event jsonb,
  p_destination_address jsonb,
  p_destination_chunk jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_world_id text;
  v_entity_id text;
  v_transition_id uuid;
  v_from jsonb;
  v_to jsonb;
  v_origin_key text;
  v_destination_key text;
  v_chunk_id text;
begin
  if jsonb_typeof(p_event) <> 'object'
     or jsonb_typeof(p_destination_address) <> 'object'
     or jsonb_typeof(p_destination_chunk) <> 'object' then
    raise exception 'Spatial transition, address and chunk must be JSON objects';
  end if;

  if (p_event->>'schemaVersion')::integer is distinct from 1
     or (p_destination_address->>'schemaVersion')::integer is distinct from 1 then
    raise exception 'Unsupported AO spatial schema version';
  end if;

  v_world_id := p_event->>'worldId';
  v_entity_id := p_event->>'entityId';
  v_from := p_event->'from';
  v_to := p_event->'to';

  if v_world_id is null or v_entity_id is null or
     jsonb_typeof(v_from) is distinct from 'object'
     or jsonb_typeof(v_to) is distinct from 'object' then
    raise exception 'Transition is missing world, entity, origin or destination';
  end if;

  if v_to is distinct from p_destination_address then
    raise exception 'Destination address does not match transition payload';
  end if;

  if v_from->>'worldId' is distinct from v_world_id
     or v_to->>'worldId' is distinct from v_world_id then
    raise exception 'Transition address belongs to another world';
  end if;

  v_origin_key := concat_ws('|',
    v_from->>'worldId', v_from->>'spaceId', v_from->>'layer',
    coalesce(nullif(v_from->>'instanceId', ''), '-'),
    v_from->>'chunkId', v_from->>'tileId', v_from->>'cellId'
  );
  v_destination_key := concat_ws('|',
    v_to->>'worldId', v_to->>'spaceId', v_to->>'layer',
    coalesce(nullif(v_to->>'instanceId', ''), '-'),
    v_to->>'chunkId', v_to->>'tileId', v_to->>'cellId'
  );

  if p_event->>'originAddressKey' is distinct from v_origin_key
     or p_event->>'destinationAddressKey' is distinct from v_destination_key then
    raise exception 'Transition address keys do not match address payloads';
  end if;

  v_chunk_id := p_destination_chunk->>'id';
  if v_chunk_id is null
     or v_chunk_id is distinct from p_destination_address->>'chunkId'
     or p_destination_chunk->>'worldId' is distinct from v_world_id
     or p_destination_chunk->>'regionId' is distinct from p_destination_address->>'regionId'
     or p_destination_chunk->>'layer' is distinct from p_destination_address->>'layer' then
    raise exception 'Destination chunk does not match destination address';
  end if;

  insert into public.ao_spatial_transition_ledger (
    world_id, entity_id, transition_kind,
    origin_address_key, destination_address_key,
    origin_address, destination_address, occurred_at, metadata, schema_version
  ) values (
    v_world_id, v_entity_id, p_event->>'kind',
    v_origin_key, v_destination_key,
    v_from, v_to, (p_event->>'occurredAt')::timestamptz,
    coalesce(p_event->'metadata', '{}'::jsonb), 1
  )
  returning transition_id into v_transition_id;

  insert into public.ao_spatial_chunks (
    world_id, chunk_id, region_id, space_id, layer,
    grid_config, chunk_state, tile_ids, entity_ids,
    source, load_state, revision, updated_at
  ) values (
    v_world_id, v_chunk_id,
    p_destination_chunk->>'regionId',
    p_destination_chunk->>'spaceId',
    p_destination_chunk->>'layer',
    coalesce(p_destination_chunk->'grid', '{}'::jsonb),
    jsonb_build_object(
      'status', coalesce(p_destination_chunk->>'status', 'known'),
      'source', coalesce(p_destination_chunk->>'source', 'kernel')
    ),
    coalesce(p_destination_chunk->'tileIds', '[]'::jsonb),
    coalesce(p_destination_chunk->'entityIds', '[]'::jsonb),
    coalesce(p_destination_chunk->>'source', 'kernel'),
    coalesce(p_destination_chunk->>'status', 'known'),
    1,
    now()
  )
  on conflict (world_id, chunk_id) do update set
    grid_config = excluded.grid_config,
    chunk_state = excluded.chunk_state,
    tile_ids = excluded.tile_ids,
    entity_ids = excluded.entity_ids,
    source = excluded.source,
    load_state = excluded.load_state,
    revision = public.ao_spatial_chunks.revision + 1,
    updated_at = now();

  insert into public.ao_spatial_entity_addresses (
    world_id, entity_id, region_id, space_id, chunk_id,
    tile_id, cell_id, layer, instance_id, address_key, address,
    address_version, updated_at
  ) values (
    v_world_id, v_entity_id,
    p_destination_address->>'regionId',
    p_destination_address->>'spaceId',
    p_destination_address->>'chunkId',
    p_destination_address->>'tileId',
    p_destination_address->>'cellId',
    p_destination_address->>'layer',
    p_destination_address->>'instanceId',
    v_destination_key,
    p_destination_address,
    1,
    now()
  )
  on conflict (world_id, entity_id) do update set
    region_id = excluded.region_id,
    space_id = excluded.space_id,
    chunk_id = excluded.chunk_id,
    tile_id = excluded.tile_id,
    cell_id = excluded.cell_id,
    layer = excluded.layer,
    instance_id = excluded.instance_id,
    address_key = excluded.address_key,
    address = excluded.address,
    address_version = public.ao_spatial_entity_addresses.address_version + 1,
    updated_at = now();

  return v_transition_id;
end;
$$;

revoke all on function public.ao_commit_spatial_transition(jsonb, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.ao_commit_spatial_transition(jsonb, jsonb, jsonb)
  to service_role;

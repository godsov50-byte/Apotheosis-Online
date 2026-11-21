create extension if not exists pgcrypto;
create table if not exists public.ao_builder_worlds (
 id uuid primary key default gen_random_uuid(), world_key text not null unique, name text not null,
 description text not null default '', map_config jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.ao_builder_members (
 world_id uuid not null references public.ao_builder_worlds(id) on delete cascade, user_id uuid not null,
 role text not null check(role in ('owner','builder','viewer')), joined_at timestamptz not null default now(),
 primary key(world_id,user_id)
);
create table if not exists public.ao_builder_invites (
 id uuid primary key default gen_random_uuid(), world_id uuid not null references public.ao_builder_worlds(id) on delete cascade,
 token_hash text not null unique, role text not null check(role in ('builder','viewer','owner')),
 max_uses integer not null default 1 check(max_uses>0), uses integer not null default 0 check(uses>=0 and uses<=max_uses),
 expires_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.ao_builder_entities (
 id uuid primary key default gen_random_uuid(), world_id uuid not null references public.ao_builder_worlds(id) on delete cascade,
 entity_key text not null, entity_type text not null check(entity_type in ('location','building','npc','item','road','terrain','prop')),
 name text not null, description text not null default '', parent_id uuid references public.ao_builder_entities(id) on delete set null,
 position jsonb not null default '{"x":0,"y":0,"z":0}'::jsonb, properties jsonb not null default '{}'::jsonb,
 state jsonb not null default '{}'::jsonb, version integer not null default 1 check(version>0),
 created_by uuid, updated_by uuid, archived boolean not null default false, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), unique(world_id,entity_key)
);
create index if not exists ao_builder_entities_world_type on public.ao_builder_entities(world_id,entity_type,archived);
create index if not exists ao_builder_entities_parent on public.ao_builder_entities(parent_id);
create table if not exists public.ao_builder_events (
 id uuid primary key default gen_random_uuid(), world_id uuid not null references public.ao_builder_worlds(id) on delete cascade,
 actor_user_id uuid, entity_id uuid references public.ao_builder_entities(id) on delete set null,
 action text not null, payload jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create index if not exists ao_builder_events_world_created on public.ao_builder_events(world_id,created_at desc);
alter table public.ao_builder_worlds enable row level security;
alter table public.ao_builder_members enable row level security;
alter table public.ao_builder_invites enable row level security;
alter table public.ao_builder_entities enable row level security;
alter table public.ao_builder_events enable row level security;
create policy ao_builder_worlds_client_deny on public.ao_builder_worlds for all to anon,authenticated using(false) with check(false);
create policy ao_builder_members_client_deny on public.ao_builder_members for all to anon,authenticated using(false) with check(false);
create policy ao_builder_invites_client_deny on public.ao_builder_invites for all to anon,authenticated using(false) with check(false);
create policy ao_builder_entities_client_deny on public.ao_builder_entities for all to anon,authenticated using(false) with check(false);
create policy ao_builder_events_client_deny on public.ao_builder_events for all to anon,authenticated using(false) with check(false);
insert into public.ao_builder_worlds(world_key,name,description,map_config) values
('ao-shared-builder','AO Shared Builder','Private collaborative world-building sandbox for invited AO creators.',
 '{"grid":{"width":48,"height":48,"cell_size":1},"start":{"x":24,"z":24},"layers":["terrain","locations","buildings","interiors","npcs","items"],"regions":[{"key":"starter-plaza","name":"Starter Plaza","bounds":{"x":0,"z":0,"width":48,"depth":48}}]}'::jsonb)
on conflict(world_key) do nothing;
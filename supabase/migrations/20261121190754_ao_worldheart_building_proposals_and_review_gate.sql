-- AO experimental building proposals and explicit human review gate.
-- This extends only grand-meridian-experiment; it does not alter a live AO world.
alter table public.exp_envoys drop constraint if exists exp_envoys_envoy_status_check;
alter table public.exp_envoys add constraint exp_envoys_envoy_status_check
  check (envoy_status = any (array['test','active','inactive','retired','experimental']::text[]));

create table if not exists public.exp_world_approvers (
  world_id uuid not null references public.exp_worlds(id) on delete restrict,
  auth_user_id uuid not null references auth.users(id) on delete restrict,
  role text not null default 'owner' check (role = 'owner'),
  created_at timestamptz not null default now(),
  primary key (world_id, auth_user_id)
);
alter table public.exp_world_approvers enable row level security;
drop policy if exists exp_world_approvers_deny_client on public.exp_world_approvers;
create policy exp_world_approvers_deny_client on public.exp_world_approvers
  for all to anon, authenticated using (false) with check (false);
revoke all on public.exp_world_approvers from anon, authenticated;
grant all on public.exp_world_approvers to service_role;

create table if not exists public.exp_world_proposals (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.exp_worlds(id) on delete restrict,
  proposer_auth_user_id uuid not null references auth.users(id) on delete restrict,
  proposer_envoy_id uuid null references public.exp_envoys(id) on delete restrict,
  proposal_type text not null check (proposal_type = any (array[
    'building.create','building.update','building.entrance.create',
    'building.room.create','building.door.create','building.stair.create',
    'building.element.create','npc.assign']::text[])),
  target_entity_key text null,
  target_entity_id uuid null references public.exp_entities(id) on delete restrict,
  idempotency_key text not null,
  expected_world_revision bigint not null check (expected_world_revision >= 0),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  status text not null default 'pending' check (status = any (array['pending','approved','rejected','committed','stale']::text[])),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz null,
  reviewer_auth_user_id uuid null references auth.users(id) on delete restrict,
  review_note text null,
  committed_event_id uuid null references public.exp_event_ledger(id) on delete restrict,
  unique (world_id, idempotency_key)
);
create index if not exists exp_world_proposals_pending_idx on public.exp_world_proposals(world_id,status,created_at desc);
create index if not exists exp_world_proposals_proposer_idx on public.exp_world_proposals(world_id,proposer_auth_user_id,created_at desc);
alter table public.exp_world_proposals enable row level security;
drop policy if exists exp_world_proposals_deny_client on public.exp_world_proposals;
create policy exp_world_proposals_deny_client on public.exp_world_proposals for all to anon,authenticated using(false) with check(false);
revoke all on public.exp_world_proposals from anon,authenticated;
grant all on public.exp_world_proposals to service_role;

create or replace function public.exp_claim_world_owner(p_auth_user_id uuid) returns jsonb
language plpgsql security definer set search_path to 'pg_catalog','public' as $function$
declare v_world_id uuid;
begin
 if p_auth_user_id is null or not exists(select 1 from auth.users where id=p_auth_user_id) then raise exception 'AUTH_USER_NOT_FOUND'; end if;
 select id into v_world_id from public.exp_worlds where world_key='grand-meridian-experiment' and status='experimental' for update;
 if v_world_id is null then raise exception 'EXPERIMENT_WORLD_UNAVAILABLE'; end if;
 if exists(select 1 from public.exp_world_approvers where world_id=v_world_id and role='owner') then raise exception 'WORLD_OWNER_ALREADY_CLAIMED'; end if;
 insert into public.exp_world_approvers(world_id,auth_user_id,role) values(v_world_id,p_auth_user_id,'owner');
 return jsonb_build_object('claimed',true,'world_id',v_world_id,'role','owner');
end; $function$;

create or replace function public.exp_submit_world_proposal(
 p_auth_user_id uuid,p_proposal_type text,p_target_entity_key text,p_idempotency_key text,
 p_expected_world_revision bigint,p_payload jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path to 'pg_catalog','public' as $function$
declare v_world_id uuid; v_revision bigint; v_target_id uuid; v_envoy_id uuid;
 v_existing public.exp_world_proposals%rowtype; v_proposal public.exp_world_proposals%rowtype;
 v_payload jsonb:=coalesce(p_payload,'{}'::jsonb);
begin
 if p_auth_user_id is null or not exists(select 1 from auth.users where id=p_auth_user_id) then raise exception 'AUTH_USER_NOT_FOUND'; end if;
 if p_proposal_type not in ('building.create','building.update','building.entrance.create','building.room.create','building.door.create','building.stair.create','building.element.create','npc.assign') then raise exception 'PROPOSAL_TYPE_NOT_ALLOWED'; end if;
 if p_idempotency_key is null or length(p_idempotency_key)<16 or length(p_idempotency_key)>128 then raise exception 'INVALID_IDEMPOTENCY_KEY'; end if;
 if jsonb_typeof(v_payload)<>'object' or octet_length(v_payload::text)>32768 then raise exception 'INVALID_OR_OVERSIZED_PROPOSAL'; end if;
 select id into v_world_id from public.exp_worlds where world_key='grand-meridian-experiment' and status='experimental';
 if v_world_id is null then raise exception 'EXPERIMENT_WORLD_UNAVAILABLE'; end if;
 select revision into v_revision from public.exp_world_state where world_id=v_world_id;
 if v_revision is null then raise exception 'WORLD_STATE_UNAVAILABLE'; end if;
 if p_expected_world_revision is null or p_expected_world_revision<0 then raise exception 'EXPECTED_WORLD_REVISION_REQUIRED'; end if;
 if p_target_entity_key is not null then
  select id into v_target_id from public.exp_entities where world_id=v_world_id and entity_key=p_target_entity_key;
  if v_target_id is null then raise exception 'TARGET_ENTITY_NOT_FOUND'; end if;
 end if;
 select id into v_envoy_id from public.exp_envoys where world_id=v_world_id and auth_user_id=p_auth_user_id order by created_at desc limit 1;
 select * into v_existing from public.exp_world_proposals where world_id=v_world_id and idempotency_key=p_idempotency_key;
 if found then
  if v_existing.proposer_auth_user_id<>p_auth_user_id or v_existing.proposal_type<>p_proposal_type
   or v_existing.target_entity_key is distinct from p_target_entity_key
   or v_existing.expected_world_revision<>p_expected_world_revision or v_existing.payload<>v_payload then
   raise exception 'IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PROPOSAL';
  end if;
  return jsonb_build_object('proposal_id',v_existing.id,'status',v_existing.status,'duplicate',true);
 end if;
 insert into public.exp_world_proposals(world_id,proposer_auth_user_id,proposer_envoy_id,proposal_type,target_entity_key,target_entity_id,idempotency_key,expected_world_revision,payload)
 values(v_world_id,p_auth_user_id,v_envoy_id,p_proposal_type,p_target_entity_key,v_target_id,p_idempotency_key,p_expected_world_revision,v_payload)
 returning * into v_proposal;
 return jsonb_build_object('proposal_id',v_proposal.id,'status',v_proposal.status,'duplicate',false,'submitted_world_revision',v_revision,'expected_world_revision',p_expected_world_revision);
end; $function$;

create or replace function public.exp_review_and_commit_world_proposal(
 p_reviewer_auth_user_id uuid,p_proposal_id uuid,p_decision text,p_review_note text default null
) returns jsonb language plpgsql security definer set search_path to 'pg_catalog','public' as $function$
declare
 v_world_id uuid; v_proposal public.exp_world_proposals%rowtype; v_target public.exp_entities%rowtype;
 v_created public.exp_entities%rowtype; v_entity_id uuid; v_event_id uuid; v_seq bigint; v_revision bigint;
 v_entity_key text; v_display_name text; v_position jsonb; v_properties jsonb; v_current_state jsonb;
 v_entity_type text; v_event_type text; v_actor_envoy_id uuid; v_expected_version bigint; v_building_key text;
begin
 if p_decision not in ('approve','reject') then raise exception 'INVALID_REVIEW_DECISION'; end if;
 if p_review_note is not null and length(p_review_note)>1000 then raise exception 'REVIEW_NOTE_TOO_LONG'; end if;
 select id into v_world_id from public.exp_worlds where world_key='grand-meridian-experiment' and status='experimental';
 if v_world_id is null then raise exception 'EXPERIMENT_WORLD_UNAVAILABLE'; end if;
 if not exists(select 1 from public.exp_world_approvers where world_id=v_world_id and auth_user_id=p_reviewer_auth_user_id and role='owner') then raise exception 'WORLD_OWNER_REQUIRED'; end if;
 select * into v_proposal from public.exp_world_proposals where id=p_proposal_id and world_id=v_world_id for update;
 if not found then raise exception 'PROPOSAL_NOT_FOUND'; end if;
 if v_proposal.status<>'pending' then raise exception 'PROPOSAL_NOT_PENDING'; end if;
 if p_decision='reject' then
  update public.exp_world_proposals set status='rejected',reviewed_at=now(),reviewer_auth_user_id=p_reviewer_auth_user_id,review_note=nullif(trim(coalesce(p_review_note,'')),'') where id=v_proposal.id;
  return jsonb_build_object('proposal_id',v_proposal.id,'status','rejected');
 end if;
 perform 1 from public.exp_world_state where world_id=v_world_id for update;
 select revision into v_revision from public.exp_world_state where world_id=v_world_id;
 if v_revision<>v_proposal.expected_world_revision then
  update public.exp_world_proposals set status='stale',reviewed_at=now(),reviewer_auth_user_id=p_reviewer_auth_user_id,review_note='World revision changed after proposal submission.' where id=v_proposal.id;
  return jsonb_build_object('proposal_id',v_proposal.id,'status','stale','current_world_revision',v_revision);
 end if;
 if v_proposal.target_entity_id is not null then
  select * into v_target from public.exp_entities where id=v_proposal.target_entity_id and world_id=v_world_id for update;
  if not found then raise exception 'TARGET_ENTITY_NOT_FOUND'; end if;
 end if;
 v_entity_id:=v_proposal.target_entity_id; v_event_type:='building_proposal_committed';
 if v_proposal.proposal_type='building.create' then
  v_entity_key:=nullif(trim(v_proposal.payload->>'entity_key'),''); v_display_name:=nullif(trim(v_proposal.payload->>'display_name'),'');
  v_position:=v_proposal.payload->'position'; v_properties:=coalesce(v_proposal.payload->'properties','{}'::jsonb);
  v_current_state:=coalesce(v_proposal.payload->'current_state','{}'::jsonb);
  if v_entity_key is null or v_display_name is null or jsonb_typeof(v_position)<>'object' or jsonb_typeof(v_properties)<>'object' then raise exception 'INVALID_BUILDING_CREATE_PAYLOAD'; end if;
  insert into public.exp_entities(world_id,entity_key,entity_type,display_name,position,properties,current_state,state_version)
  values(v_world_id,v_entity_key,'building',v_display_name,v_position,v_properties,v_current_state,0) returning * into v_created;
  v_entity_id:=v_created.id; v_event_type:='building_created';
 elsif v_proposal.proposal_type='building.update' then
  if v_target.entity_type<>'building' then raise exception 'TARGET_IS_NOT_BUILDING'; end if;
  v_expected_version:=(v_proposal.payload->>'expected_state_version')::bigint;
  if v_expected_version is null then raise exception 'EXPECTED_ENTITY_VERSION_REQUIRED'; end if;
  update public.exp_entities set display_name=coalesce(nullif(trim(v_proposal.payload->>'display_name'),''),display_name),
   position=coalesce(v_proposal.payload->'position',position),properties=properties||coalesce(v_proposal.payload->'properties','{}'::jsonb),
   current_state=current_state||coalesce(v_proposal.payload->'current_state','{}'::jsonb),state_version=state_version+1,updated_at=now()
   where id=v_target.id and world_id=v_world_id and state_version=v_expected_version returning * into v_created;
  if not found then raise exception 'ENTITY_VERSION_CONFLICT'; end if;
  v_entity_id:=v_created.id; v_event_type:='building_updated';
 elsif v_proposal.proposal_type in ('building.entrance.create','building.room.create','building.door.create','building.stair.create','building.element.create') then
  if v_target.entity_type<>'building' then raise exception 'TARGET_IS_NOT_BUILDING'; end if;
  v_entity_key:=nullif(trim(v_proposal.payload->>'entity_key'),''); v_display_name:=nullif(trim(v_proposal.payload->>'display_name'),'');
  v_position:=v_proposal.payload->'position';
  v_properties:=coalesce(v_proposal.payload->'properties','{}'::jsonb)||jsonb_build_object('building_entity_key',v_target.entity_key);
  v_current_state:=coalesce(v_proposal.payload->'current_state','{}'::jsonb);
  if v_entity_key is null or v_display_name is null or jsonb_typeof(v_position)<>'object' then raise exception 'INVALID_BUILDING_ELEMENT_PAYLOAD'; end if;
  v_entity_type:=case v_proposal.proposal_type when 'building.entrance.create' then 'entrance' when 'building.room.create' then 'interior_space' when 'building.door.create' then 'door' when 'building.stair.create' then 'stairway' else coalesce(v_proposal.payload->>'entity_type','architectural_feature') end;
  if v_proposal.proposal_type='building.element.create' and v_entity_type not in ('architectural_feature','furnishing','fixture','decoration','elevated_platform') then raise exception 'BUILDING_ELEMENT_TYPE_NOT_ALLOWED'; end if;
  insert into public.exp_entities(world_id,entity_key,entity_type,display_name,position,properties,current_state,state_version)
  values(v_world_id,v_entity_key,v_entity_type,v_display_name,v_position,v_properties,v_current_state,0) returning * into v_created;
  v_entity_id:=v_created.id; v_event_type:='building_element_created';
 elsif v_proposal.proposal_type='npc.assign' then
  if v_target.entity_type<>'npc' then raise exception 'TARGET_IS_NOT_NPC'; end if;
  v_building_key:=nullif(trim(v_proposal.payload->>'building_entity_key'),'');
  if v_building_key is null or not exists(select 1 from public.exp_entities where world_id=v_world_id and entity_key=v_building_key and entity_type='building') then raise exception 'ASSIGNMENT_BUILDING_NOT_FOUND'; end if;
  update public.exp_entities set current_state=jsonb_set(current_state,'{building_assignment}',jsonb_build_object('building_entity_key',v_building_key,'room_id',v_proposal.payload->>'room_id','role',v_proposal.payload->>'role','assignment_status','assigned'),true),
   state_version=state_version+1,updated_at=now() where id=v_target.id and world_id=v_world_id returning * into v_created;
  v_entity_id:=v_created.id; v_event_type:='npc_building_assignment_committed';
 end if;
 select id into v_actor_envoy_id from public.exp_envoys where world_id=v_world_id and auth_user_id=v_proposal.proposer_auth_user_id order by created_at desc limit 1;
 select coalesce(max(sequence_no),0)+1 into v_seq from public.exp_event_ledger where world_id=v_world_id;
 insert into public.exp_event_ledger(world_id,sequence_no,event_type,actor_envoy_id,subject_entity_id,idempotency_key,payload)
 values(v_world_id,v_seq,v_event_type,v_actor_envoy_id,v_entity_id,'proposal:'||v_proposal.id::text,
  jsonb_build_object('proposal_id',v_proposal.id,'proposal_type',v_proposal.proposal_type,'proposer_auth_user_id',v_proposal.proposer_auth_user_id,'reviewer_auth_user_id',p_reviewer_auth_user_id,'target_entity_key',v_proposal.target_entity_key,'payload',v_proposal.payload))
 returning id into v_event_id;
 update public.exp_world_state set revision=revision+1,updated_at=now() where world_id=v_world_id;
 update public.exp_world_proposals set status='committed',reviewed_at=now(),reviewer_auth_user_id=p_reviewer_auth_user_id,
  review_note=nullif(trim(coalesce(p_review_note,'')) ,''),committed_event_id=v_event_id where id=v_proposal.id;
 return jsonb_build_object('proposal_id',v_proposal.id,'status','committed','event_id',v_event_id,'event_sequence',v_seq,'entity_id',v_entity_id,'world_revision',v_revision+1);
end; $function$;

revoke all on function public.exp_claim_world_owner(uuid) from public,anon,authenticated;
revoke all on function public.exp_submit_world_proposal(uuid,text,text,text,bigint,jsonb) from public,anon,authenticated;
revoke all on function public.exp_review_and_commit_world_proposal(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.exp_claim_world_owner(uuid) to service_role;
grant execute on function public.exp_submit_world_proposal(uuid,text,text,text,bigint,jsonb) to service_role;
grant execute on function public.exp_review_and_commit_world_proposal(uuid,uuid,text,text) to service_role;

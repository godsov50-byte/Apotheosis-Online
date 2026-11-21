alter table public.ao_builder_members add column if not exists display_name text not null default 'Creator';
alter table public.ao_builder_members add column if not exists position jsonb not null default '{"x":24,"z":24,"layer":"ground"}'::jsonb;
create or replace function public.claim_ao_builder_invite(p_user_id uuid,p_token text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_world uuid;v_invite public.ao_builder_invites%rowtype;v_role text;
begin
 select id into v_world from public.ao_builder_worlds where world_key='ao-shared-builder';
 if v_world is null then raise exception 'BUILDER_WORLD_NOT_FOUND';end if;
 select role into v_role from public.ao_builder_members where world_id=v_world and user_id=p_user_id;
 if v_role is not null then return jsonb_build_object('ok',true,'role',v_role,'already_member',true);end if;
 select * into v_invite from public.ao_builder_invites where world_id=v_world and token_hash=encode(digest(p_token,'sha256'),'hex') for update;
 if not found then raise exception 'INVITE_INVALID';end if;
 if v_invite.expires_at is not null and v_invite.expires_at<=now() then raise exception 'INVITE_EXPIRED';end if;
 if v_invite.uses>=v_invite.max_uses then raise exception 'INVITE_USED_UP';end if;
 insert into public.ao_builder_members(world_id,user_id,role) values(v_world,p_user_id,v_invite.role);
 update public.ao_builder_invites set uses=uses+1 where id=v_invite.id;
 return jsonb_build_object('ok',true,'role',v_invite.role,'already_member',false);
end $$;
revoke all on function public.claim_ao_builder_invite(uuid,text) from public,anon,authenticated;
grant execute on function public.claim_ao_builder_invite(uuid,text) to service_role;
create or replace function public.ao_builder_create_entity(p_user_id uuid,p_entity_key text,p_entity_type text,p_name text,p_description text,p_parent_id uuid,p_position jsonb,p_properties jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_world uuid;v_role text;v_entity public.ao_builder_entities%rowtype;
begin
 select id into v_world from public.ao_builder_worlds where world_key='ao-shared-builder';
 select role into v_role from public.ao_builder_members where world_id=v_world and user_id=p_user_id;
 if coalesce(v_role,'') not in ('owner','builder') then raise exception 'WRITE_FORBIDDEN';end if;
 if p_entity_type not in ('location','building','npc','item','road','terrain','prop') then raise exception 'INVALID_ENTITY_TYPE';end if;
 if p_name is null or length(trim(p_name))=0 or length(p_name)>120 then raise exception 'INVALID_NAME';end if;
 if p_parent_id is not null and not exists(select 1 from public.ao_builder_entities where id=p_parent_id and world_id=v_world) then raise exception 'INVALID_PARENT';end if;
 if (select count(*) from public.ao_builder_entities where world_id=v_world and not archived)>=1000 then raise exception 'ENTITY_LIMIT_REACHED';end if;
 insert into public.ao_builder_entities(world_id,entity_key,entity_type,name,description,parent_id,position,properties,created_by,updated_by)
 values(v_world,p_entity_key,p_entity_type,trim(p_name),coalesce(p_description,''),p_parent_id,coalesce(p_position,'{"x":24,"y":0,"z":24}'::jsonb),coalesce(p_properties,'{}'::jsonb),p_user_id,p_user_id) returning * into v_entity;
 insert into public.ao_builder_events(world_id,actor_user_id,entity_id,action,payload) values(v_world,p_user_id,v_entity.id,'entity_created',jsonb_build_object('entity_key',p_entity_key,'entity_type',p_entity_type,'name',p_name));
 return to_jsonb(v_entity);
end $$;
create or replace function public.ao_builder_update_entity(p_user_id uuid,p_entity_id uuid,p_expected_version integer,p_name text,p_description text,p_parent_id uuid,p_position jsonb,p_properties jsonb,p_state jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_world uuid;v_role text;v_entity public.ao_builder_entities%rowtype;
begin
 select id into v_world from public.ao_builder_worlds where world_key='ao-shared-builder';
 select role into v_role from public.ao_builder_members where world_id=v_world and user_id=p_user_id;
 if coalesce(v_role,'') not in ('owner','builder') then raise exception 'WRITE_FORBIDDEN';end if;
 if p_parent_id is not null and not exists(select 1 from public.ao_builder_entities where id=p_parent_id and world_id=v_world) then raise exception 'INVALID_PARENT';end if;
 update public.ao_builder_entities set name=trim(p_name),description=coalesce(p_description,''),parent_id=p_parent_id,position=coalesce(p_position,position),properties=coalesce(p_properties,properties),state=coalesce(p_state,state),version=version+1,updated_by=p_user_id,updated_at=now()
 where id=p_entity_id and world_id=v_world and version=p_expected_version and not archived returning * into v_entity;
 if not found then raise exception 'VERSION_CONFLICT_OR_NOT_FOUND';end if;
 insert into public.ao_builder_events(world_id,actor_user_id,entity_id,action,payload) values(v_world,p_user_id,v_entity.id,'entity_updated',jsonb_build_object('version',v_entity.version,'name',v_entity.name));
 return to_jsonb(v_entity);
end $$;
create or replace function public.ao_builder_travel(p_user_id uuid,p_target_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_world uuid;v_target public.ao_builder_entities%rowtype;v_member public.ao_builder_members%rowtype;v_role text;
begin
 select id into v_world from public.ao_builder_worlds where world_key='ao-shared-builder';
 select role into v_role from public.ao_builder_members where world_id=v_world and user_id=p_user_id;
 if v_role is null then raise exception 'NOT_A_MEMBER';end if;
 select * into v_target from public.ao_builder_entities where id=p_target_id and world_id=v_world and not archived;
 if not found or v_target.entity_type not in ('location','building') then raise exception 'TRAVEL_TARGET_INVALID';end if;
 update public.ao_builder_members set position=v_target.position where world_id=v_world and user_id=p_user_id returning * into v_member;
 insert into public.ao_builder_events(world_id,actor_user_id,entity_id,action,payload) values(v_world,p_user_id,v_target.id,'travel',jsonb_build_object('destination',v_target.name,'position',v_target.position));
 return jsonb_build_object('destination',to_jsonb(v_target),'position',v_member.position);
end $$;
create or replace function public.ao_builder_make_invite(p_user_id uuid,p_role text,p_max_uses integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_world uuid;v_role text;v_token text;v_expires timestamptz;v_id uuid;
begin
 select id into v_world from public.ao_builder_worlds where world_key='ao-shared-builder';
 select role into v_role from public.ao_builder_members where world_id=v_world and user_id=p_user_id;
 if coalesce(v_role,'')<>'owner' then raise exception 'OWNER_ONLY';end if;
 if p_role not in ('builder','viewer') or p_max_uses not between 1 and 10 then raise exception 'INVALID_INVITE_SETTINGS';end if;
 v_token:=encode(gen_random_bytes(24),'hex');v_expires:=now()+interval '30 days';
 insert into public.ao_builder_invites(world_id,token_hash,role,max_uses,expires_at) values(v_world,encode(digest(v_token,'sha256'),'hex'),p_role,p_max_uses,v_expires) returning id into v_id;
 insert into public.ao_builder_events(world_id,actor_user_id,action,payload) values(v_world,p_user_id,'invite_created',jsonb_build_object('role',p_role,'uses',p_max_uses));
 return jsonb_build_object('invite_code',v_token,'role',p_role,'max_uses',p_max_uses,'expires_at',v_expires);
end $$;
create or replace function public.ao_builder_step(p_user_id uuid,p_dx integer,p_dz integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_world uuid;v_member public.ao_builder_members%rowtype;v_role text;v_pos jsonb;v_x numeric;v_z numeric;
begin
 if p_dx not in (-1,0,1) or p_dz not in (-1,0,1) or (p_dx=0 and p_dz=0) or (p_dx<>0 and p_dz<>0) then raise exception 'INVALID_STEP';end if;
 select id into v_world from public.ao_builder_worlds where world_key='ao-shared-builder';
 select role into v_role from public.ao_builder_members where world_id=v_world and user_id=p_user_id;
 if v_role is null then raise exception 'NOT_A_MEMBER';end if;
 select * into v_member from public.ao_builder_members where world_id=v_world and user_id=p_user_id;
 v_x:=coalesce((v_member.position->>'x')::numeric,24)+p_dx;v_z:=coalesce((v_member.position->>'z')::numeric,24)+p_dz;
 if v_x<0 or v_x>47 or v_z<0 or v_z>47 then raise exception 'OUT_OF_BOUNDS';end if;
 v_pos:=jsonb_build_object('x',v_x,'z',v_z,'layer',coalesce(v_member.position->>'layer','ground'));
 update public.ao_builder_members set position=v_pos where world_id=v_world and user_id=p_user_id;
 insert into public.ao_builder_events(world_id,actor_user_id,action,payload) values(v_world,p_user_id,'step',v_pos);
 return v_pos;
end $$;
revoke all on function public.ao_builder_create_entity(uuid,text,text,text,text,uuid,jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.ao_builder_update_entity(uuid,uuid,integer,text,text,uuid,jsonb,jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.ao_builder_travel(uuid,uuid) from public,anon,authenticated;
revoke all on function public.ao_builder_make_invite(uuid,text,integer) from public,anon,authenticated;
revoke all on function public.ao_builder_step(uuid,integer,integer) from public,anon,authenticated;
grant execute on function public.ao_builder_create_entity(uuid,text,text,text,text,uuid,jsonb,jsonb) to service_role;
grant execute on function public.ao_builder_update_entity(uuid,uuid,integer,text,text,uuid,jsonb,jsonb,jsonb) to service_role;
grant execute on function public.ao_builder_travel(uuid,uuid) to service_role;
grant execute on function public.ao_builder_make_invite(uuid,text,integer) to service_role;
grant execute on function public.ao_builder_step(uuid,integer,integer) to service_role;
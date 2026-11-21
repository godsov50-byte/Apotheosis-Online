create or replace function public.ao_builder_parent_guard()
returns trigger language plpgsql set search_path=public as $$
declare v_parent_type text;v_parent_world uuid;v_x numeric;v_z numeric;v_cycle boolean:=false;
begin
 if coalesce(NEW.position->>'x','') !~ '^-?[0-9]+$' or coalesce(NEW.position->>'z','') !~ '^-?[0-9]+$' then raise exception 'INVALID_POSITION';end if;
 v_x:=(NEW.position->>'x')::numeric;v_z:=(NEW.position->>'z')::numeric;
 if v_x<0 or v_x>47 or v_z<0 or v_z>47 then raise exception 'OUT_OF_BOUNDS';end if;
 if NEW.parent_id is not null then
  select entity_type,world_id into v_parent_type,v_parent_world from public.ao_builder_entities where id=NEW.parent_id;
  if v_parent_world is null or v_parent_world<>NEW.world_id then raise exception 'PARENT_WORLD_MISMATCH';end if;
  if (NEW.entity_type='building' and v_parent_type<>'location')
   or (NEW.entity_type='npc' and v_parent_type not in ('location','building'))
   or (NEW.entity_type='item' and v_parent_type not in ('location','building','npc'))
   or (NEW.entity_type in ('road','terrain') and v_parent_type<>'location')
   or (NEW.entity_type='prop' and v_parent_type not in ('location','building')) then raise exception 'INVALID_PARENT_TYPE';end if;
  if NEW.id is not null then
   with recursive ancestors(id) as (select NEW.parent_id union all select e.parent_id from public.ao_builder_entities e join ancestors a on e.id=a.id where e.parent_id is not null)
   select exists(select 1 from ancestors where id=NEW.id) into v_cycle;
   if v_cycle then raise exception 'PARENT_CYCLE';end if;
  end if;
 end if;
 return NEW;
end $$;
drop trigger if exists ao_builder_parent_guard on public.ao_builder_entities;
create trigger ao_builder_parent_guard before insert or update of parent_id,position,entity_type,world_id on public.ao_builder_entities for each row execute function public.ao_builder_parent_guard();
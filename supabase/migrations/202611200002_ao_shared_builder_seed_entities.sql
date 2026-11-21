with w as (select id from public.ao_builder_worlds where world_key='ao-shared-builder'),
seed as (select * from (values
('loc-starter-plaza','location','Starter Plaza','The central gathering space of the shared sandbox.',null,'{"x":24,"y":0,"z":24}'::jsonb,'{"location_type":"plaza","radius":8}'::jsonb,'{"status":"open"}'::jsonb),
('loc-ashwood-lane','location','Ashwood Lane','A quiet street leading out from the plaza.',null,'{"x":24,"y":0,"z":12}'::jsonb,'{"location_type":"street","length":20,"width":4}'::jsonb,'{"status":"open"}'::jsonb),
('bldg-wayfarer-inn','building','Wayfarer Inn','A modest inn with a common room and upstairs guest rooms.','loc-starter-plaza','{"x":29,"y":0,"z":25}'::jsonb,'{"building_type":"inn","footprint":{"width":6,"depth":5},"floors":[{"floor":0,"name":"Ground Floor","rooms":[{"name":"Common Room","x":1,"z":1,"width":4,"depth":3},{"name":"Kitchen","x":1,"z":4,"width":2,"depth":1},{"name":"Front Entry","x":4,"z":4,"width":1,"depth":1}]},{"floor":1,"name":"Upper Floor","rooms":[{"name":"Guest Room 1","x":1,"z":1,"width":2,"depth":2},{"name":"Guest Room 2","x":3,"z":1,"width":2,"depth":2}]}]}'::jsonb,'{"construction":"complete"}'::jsonb),
('bldg-old-temple','building','Old Temple','A stone temple whose halls are open for exploration.','loc-ashwood-lane','{"x":19,"y":0,"z":10}'::jsonb,'{"building_type":"temple","footprint":{"width":8,"depth":8},"floors":[{"floor":0,"name":"Temple Level","rooms":[{"name":"Entrance Hall","x":1,"z":1,"width":3,"depth":5},{"name":"Western Chamber","x":4,"z":1,"width":3,"depth":3},{"name":"Sanctuary","x":4,"z":4,"width":3,"depth":3}]}]}'::jsonb,'{"construction":"complete"}'::jsonb),
('npc-innkeeper','npc','Mara, the Innkeeper','A friendly innkeeper who keeps a careful eye on the plaza.','bldg-wayfarer-inn','{"x":28,"y":0,"z":26}'::jsonb,'{"role":"innkeeper","species":"human","personality":["welcoming","observant"],"dialogue":["Welcome to the Wayfarer Inn.","The plaza is a good place to start exploring."]}'::jsonb,'{"activity":"working","inventory":["itm-brass-key"]}'::jsonb),
('itm-brass-key','item','Brass Room Key','A simple brass key, worn smooth at the handle.','bldg-wayfarer-inn','{"x":27,"y":0,"z":26}'::jsonb,'{"item_type":"key","rarity":"common","weight":0.1,"stackable":false}'::jsonb,'{"condition":"usable","owned_by":"npc-innkeeper"}'::jsonb),
('itm-sunstone','item','Sunstone','A small amber stone that catches the light.','loc-starter-plaza','{"x":24,"y":0,"z":27}'::jsonb,'{"item_type":"material","rarity":"uncommon","weight":0.2,"stackable":true,"quantity":3}'::jsonb,'{"condition":"unidentified"}'::jsonb)
) as v(entity_key,entity_type,name,description,parent_key,position,properties,state)),
pl as(select s.*,p.id parent_id from seed s left join public.ao_builder_entities p on p.entity_key=s.parent_key and p.world_id=(select id from w)),
ins as(insert into public.ao_builder_entities(world_id,entity_key,entity_type,name,description,parent_id,position,properties,state)
select (select id from w),entity_key,entity_type,name,description,parent_id,position,properties,state from pl
where not exists(select 1 from public.ao_builder_entities e where e.world_id=(select id from w) and e.entity_key=pl.entity_key) returning entity_key)
select entity_key from ins;
update public.ao_builder_entities child set parent_id=parent.id from public.ao_builder_entities parent
where child.world_id=parent.world_id and ((child.entity_key='bldg-wayfarer-inn' and parent.entity_key='loc-starter-plaza')
or(child.entity_key='bldg-old-temple' and parent.entity_key='loc-ashwood-lane')
or(child.entity_key='npc-innkeeper' and parent.entity_key='bldg-wayfarer-inn')
or(child.entity_key='itm-brass-key' and parent.entity_key='bldg-wayfarer-inn')
or(child.entity_key='itm-sunstone' and parent.entity_key='loc-starter-plaza'));
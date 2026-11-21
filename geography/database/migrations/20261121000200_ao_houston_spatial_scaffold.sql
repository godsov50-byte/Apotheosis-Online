-- AO Houston spatial graph and admin-development scaffold.
-- Adds empty, editable spatial structures. It does not populate businesses,
-- rooms, entrances, tunnel links, dungeons, NPCs, or world-state entities.
-- Apply only after the base ao_spatial migration has been reviewed and applied.

begin;

create table ao_spatial.spatial_objects (
    spatial_object_id uuid primary key default gen_random_uuid(),
    profile_key text not null,
    profile_version integer not null,
    object_kind text not null check (
        object_kind in (
            'road_segment', 'intersection', 'sidewalk', 'crossing', 'bridge',
            'waterway', 'drainage_channel', 'storm_drain', 'culvert',
            'parcel', 'building', 'building_entrance', 'loading_entrance',
            'garage_entrance', 'lobby', 'floor', 'unit', 'room', 'corridor',
            'stairwell', 'elevator', 'public_space', 'tunnel_segment',
            'underground_access', 'dungeon_site', 'dungeon_room',
            'business_premises', 'other'
        )
    ),
    record_origin text not null check (
        record_origin in ('imported', 'admin_created', 'derived')
    ),
    canonical_feature_id uuid
        references ao_spatial.canonical_features(canonical_feature_id),
    parent_spatial_object_id uuid
        references ao_spatial.spatial_objects(spatial_object_id),
    display_label text,
    address_text text,
    local_geom extensions.geometry(Geometry, 0),
    vertical_level numeric,
    development_state text not null default 'spatial_only' check (
        development_state in (
            'spatial_only', 'needs_admin', 'in_progress',
            'developed', 'not_applicable', 'blocked'
        )
    ),
    access_class text not null default 'unknown' check (
        access_class in (
            'unknown', 'public', 'restricted', 'private',
            'service_only', 'concealed', 'closed'
        )
    ),
    provenance jsonb not null default '{}'::jsonb
        check (jsonb_typeof(provenance) = 'object'),
    admin_notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    foreign key (profile_key, profile_version)
        references ao_spatial.spatial_profiles(profile_key, profile_version),
    check (
        canonical_feature_id is not null
        or local_geom is not null
        or object_kind in ('unit', 'floor', 'room', 'corridor', 'stairwell', 'elevator')
    ),
    check (
        record_origin <> 'imported'
        or canonical_feature_id is not null
    )
);

create unique index spatial_objects_canonical_feature_uq
    on ao_spatial.spatial_objects (canonical_feature_id)
    where canonical_feature_id is not null;
create index spatial_objects_parent_idx
    on ao_spatial.spatial_objects (parent_spatial_object_id);
create index spatial_objects_kind_development_idx
    on ao_spatial.spatial_objects (object_kind, development_state);
create index spatial_objects_geom_gix
    on ao_spatial.spatial_objects using gist (local_geom);

comment on table ao_spatial.spatial_objects is
'Admin-facing spatial scaffold. Imported objects link to canonical GIS evidence; admin-created interiors and fictional spaces can be added incrementally. Not an AO world-entity table.';

create table ao_spatial.spatial_connections (
    spatial_connection_id uuid primary key default gen_random_uuid(),
    from_spatial_object_id uuid not null
        references ao_spatial.spatial_objects(spatial_object_id),
    to_spatial_object_id uuid not null
        references ao_spatial.spatial_objects(spatial_object_id),
    connection_kind text not null check (
        connection_kind in (
            'road_junction', 'road_to_sidewalk', 'sidewalk_access',
            'building_entrance', 'interior_transition', 'floor_transition',
            'stair_transition', 'elevator_transition', 'loading_access',
            'tunnel_access', 'tunnel_link', 'bridge_crossing',
            'culvert_flow', 'waterway_flow', 'drainage_flow',
            'dungeon_entrance', 'concealed_passage', 'other'
        )
    ),
    directionality text not null default 'bidirectional' check (
        directionality in ('bidirectional', 'from_to', 'to_from')
    ),
    traversal_modes text[] not null default array['pedestrian']::text[],
    connection_state text not null default 'proposed' check (
        connection_state in ('proposed', 'verified', 'restricted', 'blocked', 'inactive')
    ),
    access_requirements jsonb not null default '{}'::jsonb
        check (jsonb_typeof(access_requirements) = 'object'),
    physical_constraints jsonb not null default '{}'::jsonb
        check (jsonb_typeof(physical_constraints) = 'object'),
    provenance jsonb not null default '{}'::jsonb
        check (jsonb_typeof(provenance) = 'object'),
    admin_notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (from_spatial_object_id <> to_spatial_object_id),
    unique (
        from_spatial_object_id, to_spatial_object_id,
        connection_kind, directionality
    )
);

create index spatial_connections_from_idx
    on ao_spatial.spatial_connections (from_spatial_object_id, connection_state);
create index spatial_connections_to_idx
    on ao_spatial.spatial_connections (to_spatial_object_id, connection_state);

comment on table ao_spatial.spatial_connections is
'Typed traversable or physical relationships between spatial objects. A connection does not itself grant access; Kernel rules evaluate permissions and conditions.';

create table ao_spatial.admin_development_queue (
    development_item_id uuid primary key default gen_random_uuid(),
    spatial_object_id uuid not null
        references ao_spatial.spatial_objects(spatial_object_id),
    work_type text not null check (
        work_type in (
            'verify_location', 'add_entrances', 'develop_interior',
            'add_floors_rooms', 'add_businesses', 'add_residents',
            'connect_transport', 'connect_underground',
            'develop_dungeon', 'review_access', 'other'
        )
    ),
    queue_state text not null default 'unassigned' check (
        queue_state in (
            'unassigned', 'assigned', 'in_progress',
            'awaiting_review', 'completed', 'blocked', 'cancelled'
        )
    ),
    assigned_admin_id text,
    priority smallint not null default 0,
    checklist jsonb not null default '[]'::jsonb
        check (jsonb_typeof(checklist) = 'array'),
    completion_notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    completed_at timestamptz
);

create index admin_development_queue_state_idx
    on ao_spatial.admin_development_queue (queue_state, priority desc, created_at);
create index admin_development_queue_object_idx
    on ao_spatial.admin_development_queue (spatial_object_id);

comment on table ao_spatial.admin_development_queue is
'Work queue for admins to flesh out one imported or authored place at a time. Queue items do not create world state until separately approved by the Kernel.';

alter table ao_spatial.spatial_objects enable row level security;
alter table ao_spatial.spatial_connections enable row level security;
alter table ao_spatial.admin_development_queue enable row level security;

alter table ao_spatial.spatial_objects force row level security;
alter table ao_spatial.spatial_connections force row level security;
alter table ao_spatial.admin_development_queue force row level security;

create policy spatial_objects_service_role
    on ao_spatial.spatial_objects for all to service_role
    using (true) with check (true);
create policy spatial_connections_service_role
    on ao_spatial.spatial_connections for all to service_role
    using (true) with check (true);
create policy admin_development_queue_service_role
    on ao_spatial.admin_development_queue for all to service_role
    using (true) with check (true);

revoke all on ao_spatial.spatial_objects,
              ao_spatial.spatial_connections,
              ao_spatial.admin_development_queue
    from public, anon, authenticated;
grant select, insert, update on ao_spatial.spatial_objects to service_role;
grant select, insert, update on ao_spatial.spatial_connections to service_role;
grant select, insert, update on ao_spatial.admin_development_queue to service_role;

commit;

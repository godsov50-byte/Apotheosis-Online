# Houston Admin Place Development — Empty Spatial Scaffold

**Status:** schema and workflow design added on the spatial feature branch.
**Purpose:** establish geographic space and connectivity first; let admins develop locations incrementally.
**Not included:** bulk creation of businesses, room layouts, residents, dungeon contents, ownership, inventories, or live AO entities.

## 1. The principle

AO does not need every Houston building, shop, room, tunnel interior, or dungeon fully authored before the world can exist.

The import/build process should establish:
- the geographic footprint or path where a feature exists;
- its stable spatial identity;
- its relationship to other spatial features when that relationship is supported;
- a development state indicating whether an admin still needs to flesh it out.

An admin then selects one place and adds detail over time. The foundation remains useful even when a building has no interior yet or a business has not been created.

## 2. What gets established automatically

| Foundation feature | What is stored initially | What is deliberately left empty |
|---|---|---|
| Road | Geometry, source identity, junction candidates | AO traffic rules, local hazards, patrols |
| Sidewalk/crossing | Geometry and supported road relationship | Pedestrian clutter, encounters |
| Parcel | Boundary and source provenance | Owner, tenants, use |
| Building | Footprint, address if sourced, source link | Doors, floors, rooms, occupants |
| Waterway/channel | Geometry, flow/topology evidence | Local access, boats, encounters |
| Tunnel segment | Path geometry and source link | Interior details, access policy unless sourced |
| Building entrance | Only when source evidence or admin authors it | Destination details not yet surveyed |
| Dungeon site | Only an AO-authored placeholder or approved discovered site | Rooms, traps, creatures, treasure |

Do not manufacture an entrance just because a road is nearby. Do not assume every building has a basement, tunnel, or public lobby. A missing detail stays missing until sourced or authored.

## 3. Spatial object and connection model

The additive migration introduces three admin-facing tables in `ao_spatial`:

### `spatial_objects`

A stable spatial identity for an imported feature or an admin-created place/space. Examples include road segment, building, entrance, floor, room, tunnel segment, dungeon site, or business premises.

Key fields:
- `object_kind`: what kind of physical or spatial object this is;
- `record_origin`: imported, admin-created, or derived;
- `canonical_feature_id`: link to verified/normalized GIS evidence when available;
- `parent_spatial_object_id`: containment, such as room → floor → building;
- `local_geom`: optional AO-local geometry for admin-authored geometry;
- `development_state`: spatial-only, needs-admin, in-progress, developed, not-applicable, or blocked;
- `access_class`: unknown, public, restricted, private, service-only, concealed, or closed;
- `provenance`: evidence and authorship metadata.

A building can exist as a footprint record without having any floors or rooms yet. A floor or room can be added later as an admin-created child object.

### `spatial_connections`

A typed relationship between two spatial objects. Examples:
- road junction;
- road-to-sidewalk;
- sidewalk-to-building entrance;
- entrance-to-lobby;
- lobby-to-stair/elevator;
- tunnel access or tunnel link;
- waterway/culvert/drainage flow;
- dungeon entrance or concealed passage.

A connection records directionality, traversal modes, state, access requirements, physical constraints, and provenance. A connection is not an automatic permission grant: Kernel rules still decide whether a character can traverse it.

### `admin_development_queue`

A work item for one place at a time. Work types include verify location, add entrances, develop interior, add floors/rooms, add businesses/residents, connect underground, develop dungeon, or review access.

This makes the admin workflow incremental and trackable without requiring the whole city to be fleshed out first.

## 4. Example: building developed one step at a time

Initial imported record:

```text
Building footprint
  spatial identity: HOU-<generated-id>
  source evidence: linked canonical building feature
  development state: needs_admin
  entrances: none recorded
  floors: none authored
  businesses: none authored
  residents: none authored
  tunnel links: none recorded
```

An admin opens the building and adds only what they have verified or want to author:

```text
Building
  ├── Entrance (street-facing)
  │     └── Lobby
  │           ├── Stairwell
  │           └── Elevator
  ├── Floor 1
  │     └── Unit 101
  │           └── Business premises (optional)
  └── Underground access (only if verified/authored)
        └── Tunnel segment
```

This is a possible authored structure, not an assumption about every Houston building. The admin can save a partial structure and return later.

## 5. Admin workflow

1. Open the Houston map or search for a spatial object.
2. Select a building, parcel, road segment, tunnel segment, or other place.
3. Review its source, geometry quality, provenance, and existing connections.
4. Choose a development task.
5. Add only the entrances, child spaces, businesses, or connections that are known or intentionally authored.
6. Save as in-progress.
7. Submit for review where the change affects shared navigation, access, or world truth.
8. Kernel validates and commits approved world-state changes through WorldHeart.

Suggested statuses:
- **Spatial only:** location exists, no detailed content required yet.
- **Needs admin:** a development task is waiting.
- **In progress:** an admin is working on it.
- **Awaiting review:** proposed changes need approval.
- **Developed:** the admin considers this place sufficiently fleshed out for its intended use.
- **Blocked:** source ambiguity, access issue, or missing dependency prevents development.

The first three/four states are workflow metadata. They do not imply the place is empty in the real world; they indicate AO content has not yet been authored or verified.

## 6. Commerce stays separate from physical space

A business is not synonymous with a building. The building is a spatial object; business premises are an optional child space; the business itself is a separate economic/world entity created by an admin or simulation.

That later business entity can refer to:
- its premises spatial object;
- operating hours;
- owner/operator;
- employees;
- inventory;
- products/services;
- customer access;
- delivery access.

Do not generate placeholder businesses just because a building footprint exists. Empty space is enough until an admin or a trusted source supplies the business.

## 7. What this phase does not do

- Does not populate every Houston address or building interior.
- Does not invent entrances, floors, shops, residents, or dungeons.
- Does not automatically connect nearest geometry as a traversable route.
- Does not determine ownership, public access, or permission from proximity.
- Does not create or mutate AO live-world entities.
- Does not bypass the Kernel or WorldHeart.
- Does not expose service-role database credentials to an admin browser.

The admin UI should call a trusted backend/API. That backend validates admin permissions and routes consequential world-state changes through the Kernel. Direct browser writes to these tables are not authorized by this schema.

## 8. Release and verification gates

Before applying the migration:
- apply the base Houston spatial feature migration first;
- validate PostGIS extension schema and role grants in a disposable database;
- test foreign keys, RLS, geometry typmods, and append/update behavior;
- add an admin API with explicit authorization and audit history;
- add UI only after the API contract is defined.

The new migration is a schema artifact only. It has not been applied to Supabase, and no Houston feature rows or admin tasks have been inserted by this change.

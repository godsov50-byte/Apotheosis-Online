# AO Houston Entrance-to-Street Connectors

Adds explicit entrance-to-road connector records and routes through the connector's projected road point.

- Each entrance stores nearest road edge, projected point, offset distance, connector method and connector state.
- The door-to-road segment is drawn as a dashed line: amber means candidate; green means admin-confirmed.
- An admin must explicitly confirm the connector before walking-route preview is allowed.
- Route geometry now includes entrance → projected road point → road graph path, rather than routing from the entrance to an arbitrary nearest graph node.
- Blocked entrances cannot be connected or routed.
- Confirmation is an admin assertion only; it does not prove a sidewalk, legal crossing, accessible path, or physical door connection.
- Houston test workspace only; no live AO, Kernel, WorldHeart, Supabase or production writes.

/**
 * Lightweight projection of a Houston staging building entrance into an AO address box.
 * This is additive: source building/entrance records are never mutated.
 */
export function createAddressBox({ building, entrance, pedestrianAccess = null }) {
  if (!building?.id) throw new TypeError("building.id is required");
  if (!entrance?.id || !Array.isArray(entrance.position)) {
    throw new TypeError("entrance.id and entrance.position are required");
  }
  if (entrance.access === "Blocked / unusable") {
    throw new Error("A blocked entrance cannot become an address-box door");
  }

  let access = null;
  if (pedestrianAccess !== null) {
    const { accessPoint, edge } = pedestrianAccess;
    if (!accessPoint?.id || !edge?.id) {
      throw new TypeError("A pedestrian access point and edge are required");
    }
    if (
      edge.routingApproved !== true ||
      edge.status !== "accepted" ||
      edge.walkAccess !== true
    ) {
      throw new Error("Pedestrian connection is not explicitly approved for walking");
    }
    access = { accessPointId: accessPoint.id, edgeId: edge.id };
  }

  const suffix = `${building.id}:${entrance.id}`;
  return {
    id: `address-box:${suffix}`,
    buildingId: building.id,
    address: building.address ?? null,
    type: building.purpose ?? "building",
    footprint: building.footprint ?? null,
    properties: {
      name: building.name ?? null,
      floors: Number.isFinite(+building.floors) ? +building.floors : null,
      notes: building.notes ?? null
    },
    door: {
      id: `door:${suffix}`,
      entranceId: entrance.id,
      position: [...entrance.position],
      accessState: entrance.access ?? "Unspecified",
      pedestrianAccess: access
    }
  };
}

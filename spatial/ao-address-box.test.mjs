import test from "node:test";
import assert from "node:assert/strict";
import { createAddressBox } from "./ao-address-box.mjs";

const building = {
  id: "b-1", name: "Test Shop", purpose: "Shop", floors: 1,
  footprint: [[-95.1, 29.7], [-95.099, 29.7], [-95.099, 29.701], [-95.1, 29.7]]
};
const entrance = {
  id: "e-1", position: [-95.1, 29.7005],
  access: "Usable", connectorState: "Candidate — unverified"
};

test("projects a building entrance into one lightweight address box", () => {
  const box = createAddressBox({ building, entrance });
  assert.equal(box.buildingId, "b-1");
  assert.equal(box.door.entranceId, "e-1");
  assert.equal(box.door.pedestrianAccess, null);
  assert.equal(Object.keys(box).includes("floorPlans"), false);
});

test("does not mutate source building or entrance", () => {
  const before = structuredClone({ building, entrance });
  createAddressBox({ building, entrance });
  assert.deepEqual({ building, entrance }, before);
});

test("accepts an explicitly approved edge in pedestrian-graph output shape", () => {
  const box = createAddressBox({
    building, entrance,
    pedestrianAccess: {
      accessPoint: { id: "pa-1" },
      edge: {
        id: "walk-1", routingApproved: true, status: "verified",
        modes: ["walk"], from: "pa-1", to: "entrance-anchor"
      }
    }
  });
  assert.deepEqual(box.door.pedestrianAccess, {
    accessPointId: "pa-1", edgeId: "walk-1"
  });
});

test("accepts each status emitted by the pedestrian graph builder", () => {
  for (const status of ["source_verified", "accepted_for_staging", "verified"]) {
    assert.doesNotThrow(() => createAddressBox({
      building, entrance,
      pedestrianAccess: {
        accessPoint: { id: "pa-1" },
        edge: { id: `walk-${status}`, from: "pa-1", to: "entrance-anchor", routingApproved: true, status, modes: ["walk"] }
      }
    }));
  }
});

test("rejects edges without explicit walk mode or approval", () => {
  const edge = { id: "walk-1", routingApproved: true, status: "verified", modes: ["walk"] };
  for (const invalid of [
    { ...edge, routingApproved: false },
    { ...edge, status: "candidate" },
    { ...edge, modes: ["drive"] },
    { ...edge, modes: undefined }
  ]) {
    assert.throws(() => createAddressBox({
      building, entrance,
      pedestrianAccess: { accessPoint: { id: "pa-1" }, edge: invalid }
    }), /not explicitly approved/);
  }
});

test("rejects an access point not attached to the supplied edge", () => {
  assert.throws(() => createAddressBox({
    building, entrance,
    pedestrianAccess: {
      accessPoint: { id: "unrelated-node" },
      edge: {
        id: "walk-1", routingApproved: true, status: "verified",
        modes: ["walk"], from: "sidewalk-node", to: "entrance-anchor"
      }
    }
  }), /not explicitly approved/);
});

test("rejects blocked entrances", () => {
  assert.throws(() => createAddressBox({
    building, entrance: { ...entrance, access: "Blocked / unusable" }
  }), /blocked entrance/);
});

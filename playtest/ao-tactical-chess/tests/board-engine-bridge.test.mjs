import test from "node:test";
import assert from "node:assert/strict";
import {
  createBoardField,
  resolveBoardMove,
  resolveBoardAttack,
  resolveBoardTechnique,
  endBoardTurn,
  projectBoardUnits
} from "../engine/board-engine-bridge.mjs";

const unit = (id, side, x, y, overrides = {}) => ({
  id, side, x, y, name: id, cls: "Saber", pattern: "Knight", tier: 9,
  hp: 20, maxHp: 20, ac: 10, atk: 5, dmg: 6,
  ap: 8, apMax: 8, ea: 6, eaMax: 6, facing: side === "white" ? "N" : "S",
  affinity: "Unassigned", technique: "Test Technique", techniqueTier: 5, techniqueCost: 2, uses: 3, ...overrides
});

test("board records are projected into engine entities and cells", () => {
  const units = [unit("envoy", "white", 0, 7), unit("creature", "black", 7, 0)];
  const field = createBoardField(units, { turn: "white" });
  assert.equal(field.activeSide, "white");
  assert.equal(field.entities.envoy.hp.current, 20);
  assert.equal(field.entities.envoy.accuracy, 5);
  assert.deepEqual(field.cells["0,7,0"].entities, ["envoy"]);
  assert.equal(field.ledger.length, 2);
});

test("board field rejects duplicate identities and occupied starting cells", () => {
  assert.throws(() => createBoardField([unit("same", "white", 0, 0), unit("same", "black", 1, 1)]), /duplicate/);
  assert.throws(() => createBoardField([unit("a", "white", 0, 0), unit("b", "black", 0, 0)]), /occupied/);
});

test("engine bridge commits a legal chess jump and preserves repeat-action board behavior", () => {
  const original = [unit("knight", "white", 1, 7), unit("enemy", "black", 7, 0)];
  let field = createBoardField(original);
  let result = resolveBoardMove(field, {
    actorId: "knight",
    to: { x: 2, y: 5 },
    legalCells: [{ x: 2, y: 5 }],
    eventId: "move-one"
  });
  assert.equal(result.ok, true);
  field = result.field;
  assert.deepEqual(field.entities.knight.position, { x: 2, y: 5, z: 0 });
  assert.deepEqual(field.cells["2,5,0"].entities, ["knight"]);
  assert.deepEqual(field.cells["1,7,0"].entities, []);
  assert.equal(field.ledger.at(-1).type, "board_move_resolved");
  const second = resolveBoardMove(field, {
    actorId: "knight",
    to: { x: 4, y: 4 },
    legalCells: [{ x: 4, y: 4 }],
    eventId: "move-two"
  });
  assert.equal(second.ok, true);
  assert.deepEqual(second.field.entities.knight.position, { x: 4, y: 4, z: 0 });
});

test("engine rejects a forged UI candidate that is not legal for the unit chess motion", () => {
  const field = createBoardField([unit("knight", "white", 1, 7), unit("enemy", "black", 7, 0)]);
  const result = resolveBoardMove(field, {
    actorId: "knight",
    to: { x: 3, y: 3 },
    legalCells: [{ x: 3, y: 3 }]
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "illegal_chess_motion");
});

test("illegal board movement is rejected without mutating the input field", () => {
  const field = createBoardField([unit("envoy", "white", 0, 7), unit("enemy", "black", 7, 0)]);
  const before = structuredClone(field);
  const result = resolveBoardMove(field, {
    actorId: "envoy",
    to: { x: 3, y: 3 },
    legalCells: [{ x: 2, y: 5 }]
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "illegal_chess_motion");
  assert.deepEqual(field, before);
});

test("attacks resolve through engine AC and DR without spending prototype basic-attack resources", () => {
  const field = createBoardField([
    unit("attacker", "white", 0, 0, { atk: 5, ap: 8, ea: 6, pattern: "King" }),
    unit("defender", "black", 1, 0, { ac: 12, dr: 2, hp: 20 })
  ]);
  const result = resolveBoardAttack(field, {
    attackerId: "attacker", defenderId: "defender", roll: 10,
    damagePackets: [{ type: "physical", amount: 10 }],
    eventId: "attack-one"
  });
  assert.equal(result.ok, true);
  assert.equal(result.hit, true);
  assert.equal(result.damage, 8);
  assert.equal(result.field.entities.defender.hp.current, 12);
  assert.equal(result.field.entities.attacker.ap.current, 8);
  assert.equal(result.field.entities.attacker.ea.current, 6);
  assert.equal(result.field.ledger.at(-1).type, "attack_resolved");
});

test("technique use spends AP/EA, tracks uses, and resolves through the shared attack engine", () => {
  const units = [
    unit("envoy", "white", 0, 0, { pattern: "King", ap: 8, ea: 6, techniqueCost: 2, uses: 3 }),
    unit("creature", "black", 1, 0, { ac: 12, dr: 2, hp: 20 })
  ];
  const field = createBoardField(units);
  assert.equal(field.entities.envoy.tier, 9);
  assert.equal(field.entities.envoy.boardTechniqueTier, 5);
  const result = resolveBoardTechnique(field, {
    actorId: "envoy", defenderId: "creature", roll: 10,
    damagePackets: [{ type: "physical", amount: 14 }],
    eventId: "technique-one"
  });
  assert.equal(result.ok, true);
  assert.equal(result.hit, true);
  assert.equal(result.damage, 12);
  assert.equal(result.field.entities.envoy.ap.current, 6);
  assert.equal(result.field.entities.envoy.ea.current, 3);
  assert.equal(result.field.entities.creature.hp.current, 8);
  assert.equal(projectBoardUnits(units, result.field)[0].uses, 2);
  assert.ok(result.field.ledger.some(event => event.type === "technique_resolved"));
  assert.ok(result.field.ledger.some(event => event.type === "attack_resolved"));
});

test("technique transaction rejects insufficient resources without spending or changing the field", () => {
  const units = [
    unit("envoy", "white", 0, 0, { pattern: "King", ap: 1, ea: 6 }),
    unit("creature", "black", 1, 0)
  ];
  const field = createBoardField(units);
  const before = structuredClone(field);
  const result = resolveBoardTechnique(field, {
    actorId: "envoy", defenderId: "creature", roll: 10,
    damagePackets: [{ type: "physical", amount: 10 }]
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "insufficient_AP");
  assert.deepEqual(field, before);
});

test("technique use cap is enforced from the board unit's remaining uses", () => {
  const field = createBoardField([
    unit("envoy", "white", 0, 0, { pattern: "King", uses: 0 }),
    unit("creature", "black", 1, 0)
  ]);
  const result = resolveBoardTechnique(field, {
    actorId: "envoy", defenderId: "creature", roll: 10,
    damagePackets: [{ type: "physical", amount: 10 }]
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "uses_exhausted");
});

test("board attack rejects targets outside the attacker's chess motion", () => {
  const field = createBoardField([
    unit("attacker", "white", 0, 0, { pattern: "Knight" }),
    unit("defender", "black", 1, 0)
  ]);
  const result = resolveBoardAttack(field, {
    attackerId: "attacker", defenderId: "defender", roll: 20,
    damagePackets: [{ type: "physical", amount: 10 }]
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "illegal_attack_geometry");
});

test("successful knockback moves a surviving defender one cell away", () => {
  const field = createBoardField([
    unit("attacker", "white", 1, 1, { pattern: "King" }),
    unit("defender", "black", 2, 1, { ac: 1, hp: 20 })
  ]);
  const result = resolveBoardAttack(field, {
    attackerId: "attacker", defenderId: "defender", roll: 20,
    damagePackets: [{ type: "physical", amount: 2 }],
    knockback: true,
    eventId: "knockback-test"
  });
  assert.equal(result.ok, true);
  assert.equal(result.positionEffect, "knockback");
  assert.deepEqual(result.field.entities.defender.position, { x: 3, y: 1, z: 0 });
  assert.deepEqual(result.field.cells["3,1,0"].entities, ["defender"]);
});

test("defeated defenders are removed from cell occupancy and board projection", () => {
  const units = [
    unit("attacker", "white", 0, 0, { atk: 20, pattern: "King" }),
    unit("defender", "black", 1, 0, { ac: 1, hp: 4, maxHp: 4 })
  ];
  const field = createBoardField(units);
  const result = resolveBoardAttack(field, {
    attackerId: "attacker", defenderId: "defender", roll: 20,
    damagePackets: [{ type: "physical", amount: 10 }],
    eventId: "lethal"
  });
  assert.equal(result.defeated, true);
  assert.deepEqual(result.field.cells["1,0,0"].entities, ["attacker"]);
  assert.deepEqual(result.field.entities.attacker.position, { x: 1, y: 0, z: 0 });
  assert.deepEqual(projectBoardUnits(units, result.field).map(x => x.id), ["attacker"]);
  assert.equal(projectBoardUnits(units, result.field, { includeDefeated: true }).find(x => x.id === "defender").hp, 0);
});

test("turn handoff changes active side and advances round only after black returns to white", () => {
  let field = createBoardField([unit("a", "white", 0, 0)], { turn: "white", round: 1 });
  field = endBoardTurn(field, "black");
  assert.equal(field.round, 1);
  field = endBoardTurn(field, "white");
  assert.equal(field.round, 2);
  assert.equal(field.activeSide, "white");
});

import test from 'node:test';
import assert from 'node:assert/strict';
import * as Combat from '../engine/regular-combat.mjs';

test('zones support cell and radius queries', () => {
  const zone = Combat.createZone({ id: 'blast', center: { x: 2, y: 2 }, radius: 1 });
  assert.equal(Combat.zoneContains(zone, { x: 3, y: 2 }), true);
  assert.equal(Combat.zoneContains(zone, { x: 4, y: 2 }), false);
  assert.deepEqual(Combat.entitiesInZone({ a: { id: 'a', position: { x: 2, y: 2 } }, b: { id: 'b', position: { x: 8, y: 8 } } }, zone), ['a']);
});

test('terrain damage breaks cover and blocking when destroyed', () => {
  const wall = Combat.createDestructibleTerrain({ id: 'wall', hp: 5, blocked: true, cover: 2 });
  const result = Combat.damageTerrain(wall, 6);
  assert.equal(result.destroyedNow, true);
  assert.equal(result.terrain.hp, 0);
  assert.equal(result.terrain.blocked, false);
  assert.equal(result.terrain.cover, 0);
});

test('body injuries are localized; severe outcomes require explicit permissions', () => {
  let body = Combat.createBodyState();
  body = Combat.applyBodyEffect(body, 'leftArm', { type: 'sever', injury: 'deep cut' });
  assert.equal(body.leftArm.condition, 'injured');
  assert.equal(body.leftArm.severed, false);
  body = Combat.applyBodyEffect(body, 'leftArm', { type: 'sever' }, { allowSever: true });
  assert.equal(body.leftArm.condition, 'severed');
  assert.equal(body.leftArm.disabled, true);
  assert.equal(body.rightArm.condition, 'intact');
});

test('formation cohesion reports nearby living allies', () => {
  const units = {
    a: { id: 'a', side: 'blue', alive: true, position: { x: 2, y: 2 } },
    b: { id: 'b', side: 'blue', alive: true, position: { x: 3, y: 2 } },
    c: { id: 'c', side: 'blue', alive: false, position: { x: 2, y: 3 } },
    d: { id: 'd', side: 'red', alive: true, position: { x: 2, y: 1 } }
  };
  assert.deepEqual(Combat.formationCohesion(units, 'a').adjacentAllies, ['b']);
  assert.equal(Combat.formationCohesion(units, 'a').supported, true);
});

test('grapple initiation, pin, and break update both sides consistently', () => {
  const units = { a: { side: 'blue' }, b: { side: 'red' } };
  let state = Combat.grappleAction(units, 'a', 'b', 'initiate');
  assert.equal(state.a.grapple.role, 'grappler');
  assert.equal(state.b.grapple.role, 'grappled');
  state = Combat.grappleAction(state, 'a', 'b', 'pin');
  assert.equal(state.b.grapple.pinned, true);
  state = Combat.grappleAction(state, 'a', 'b', 'break');
  assert.equal(state.a.grapple, null);
  assert.equal(state.b.grapple, null);
});

test('simple projectile travels cell-by-cell, collides, or is intercepted', () => {
  const shot = Combat.launchSimpleProjectile({ id: 'arrow-1', sourceId: 'archer', targetId: 'target', from: { x: 0, y: 0 }, to: { x: 3, y: 0 }, range: 4, damage: 5 });
  const interceptUnits = [{ id: 'guard', alive: true, interceptionReady: true, position: { x: 1, y: 0 } }];
  const intercepted = Combat.advanceSimpleProjectile(shot, { units: interceptUnits, interceptorId: 'guard' });
  assert.equal(intercepted.projectile.state, 'intercepted');
  assert.equal(intercepted.updatedInterceptor.interceptionReady, false);
  const units = [{ id: 'target', alive: true, position: { x: 1, y: 0 } }];
  const hit = Combat.advanceSimpleProjectile(shot, { units });
  assert.equal(hit.event.type, 'hit');
  assert.equal(hit.event.targetId, 'target');
  assert.equal(hit.event.damage, 5);
  const blocked = Combat.advanceSimpleProjectile(shot, { blockers: [{ x: 1, y: 0 }] });
  assert.equal(blocked.event.type, 'blocked');
  assert.throws(() => Combat.launchSimpleProjectile({ id: 'long', sourceId: 'a', from: { x: 0, y: 0 }, to: { x: 5, y: 0 }, range: 2 }), /range exceeded/);
});

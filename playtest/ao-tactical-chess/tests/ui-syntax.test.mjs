import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('regular AO Chess board script parses', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match, 'first inline board script exists');
  assert.doesNotThrow(() => new vm.Script(match[1]), 'inline board JavaScript is syntactically valid');
});

test('board tokens use portrait/name surfaces and three identity color channels', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /token-portrait/);
  assert.match(html, /token-name/);
  assert.match(html, /identityColors/);
  assert.match(html, /classColors/);
  assert.match(html, /archetypeColors/);
  assert.match(html, /affinityColors/);
  assert.match(html, /portraitUrl/);
  assert.doesNotMatch(html, /classmark|hpmini/);
  assert.match(html, /Natural Affinity/);
  assert.match(html, /Chess Motion/);
});

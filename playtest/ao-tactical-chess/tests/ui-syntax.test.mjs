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

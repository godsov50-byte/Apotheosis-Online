import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {spawnSync} from "node:child_process";

test("AO Chess piece arena browser module parses",()=>{
  const html=fs.readFileSync(new URL("../piece-arena.html",import.meta.url),"utf8");
  const match=html.match(/<script type="module">([\s\S]*?)<\/script>/);
  assert.ok(match,"piece arena module script exists");
  const checked=spawnSync(process.execPath,["--check","--input-type=module"],{
    input:match[1],encoding:"utf8"
  });
  assert.equal(checked.status,0,checked.stderr||checked.stdout);
  assert.match(html,/Class Techniques/);
  assert.match(html,/Equipment/);
  assert.match(html,/creature response/i);
});

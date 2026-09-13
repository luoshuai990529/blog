import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
test('the rebuilt deck covers the source and keeps notes off stage',()=>{
  assert.match(execFileSync(process.execPath,['scripts/check-deck.mjs'],{encoding:'utf8'}),/all nonempty source lines mapped/);
});
test('source prose is preserved in speaker notes, with only note-rendering escapes and image relocation',()=>{
  const deck=readFileSync('slides.md','utf8');
  const notes=[...deck.matchAll(/<!--\n([\s\S]*?)\n-->/g)].map(m=>m[1]).join('\n').replaceAll('&lt;','<').replaceAll('&gt;','>');
  const source=readFileSync('../如何设计 KV Cache 友好的上下文.md','utf8');
  for(const line of source.split('\n')){
    if(!line.trim() || line.startsWith('!['))continue;
    assert.ok(notes.includes(line.trim()),`Missing source prose: ${line.slice(0,80)}`);
  }
});

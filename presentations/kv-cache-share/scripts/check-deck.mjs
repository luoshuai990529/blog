import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root = new URL('../', import.meta.url);
const deck = readFileSync(new URL('slides.md', root), 'utf8');
const sections = deck.replace(/^---\n[\s\S]*?\n---\n/, '').split(/\n---\n/);
const coverage = JSON.parse(readFileSync(new URL('scripts/source-coverage.json', root),'utf8'));
const source = readFileSync(new URL(coverage.source, root),'utf8').split(/\r?\n/);
const covered = new Set();
const errors=[];
for(const [i,slide] of sections.entries()){
  const notes=[...slide.matchAll(/<!--\n([\s\S]*?)\n-->/g)];
  const visible=slide.replace(/<!--[\s\S]*?-->/g,'');
  if(notes.length!==1 || !notes[0][1].includes('讲述提示')) errors.push(`Slide ${i+1}: missing speaker notes`);
  if(!/<h1>.+<\/h1>/.test(visible)) errors.push(`Slide ${i+1}: missing heading`);
  if(/原稿讲解|讲述提示|\/Users\/|ContextBuilder|SourceFooter/.test(visible)) errors.push(`Slide ${i+1}: old content or notes leaked`);
  for(const [a,b] of coverage.slides[i]?.sourceLines??[]){
    if(!notes[0]?.[1].includes(`L${a}–L${b}`)) errors.push(`Slide ${i+1}: source range not in notes`);
    for(let n=a;n<=b;n++){
      if(covered.has(n))errors.push(`Duplicate source line ${n}`);
      covered.add(n);
    }
  }
}
source.forEach((line,i)=>{if(line.trim()&&!covered.has(i+1))errors.push(`Unmapped source line ${i+1}`)});
if(sections.length!==coverage.slides.length)errors.push('Coverage slide count mismatch');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
else console.log(`Deck checked: ${sections.length} slides; notes on every slide; all nonempty source lines mapped.`);

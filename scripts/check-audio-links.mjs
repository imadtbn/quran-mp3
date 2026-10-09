import fs from 'node:fs/promises';

const source = await fs.readFile(new URL('../assets/js/data.js', import.meta.url), 'utf8');
const bases = [...source.matchAll(/base:'([^']+)'/g)].map(match => match[1]);
const uniqueBases = [...new Set(bases)];
const failures = [];
let checked = 0;

async function check(base, number) {
  const target = `${base}${String(number).padStart(3, '0')}.mp3`;
  try {
    let response = await fetch(target, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
    if (!response.ok && response.status !== 206) {
      response = await fetch(target, { headers: { Range: 'bytes=0-1' }, signal: AbortSignal.timeout(15000) });
    }
    if (!response.ok && response.status !== 206) failures.push(`${response.status} ${target}`);
  } catch (error) {
    failures.push(`ERROR ${target} ${error.message}`);
  } finally {
    checked += 1;
  }
}

const tasks = [];
for (const base of uniqueBases) for (let number = 1; number <= 114; number += 1) tasks.push(() => check(base, number));
const workers = Array.from({ length: 12 }, async () => { while (tasks.length) await tasks.shift()(); });
await Promise.all(workers);
console.log(`Checked ${checked} links across ${uniqueBases.length} sources`);
if (failures.length) { console.error(failures.slice(0, 40).join('\n')); console.error(`Failures: ${failures.length}`); process.exitCode = 1; }
else console.log('All audio links responded successfully.');

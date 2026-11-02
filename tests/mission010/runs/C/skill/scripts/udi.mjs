import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
const args=process.argv.slice(2);
appendFileSync(new URL('../../commands.jsonl',import.meta.url),JSON.stringify({args,time:new Date().toISOString()})+'\n');
const r=spawnSync(process.execPath,[new URL('../../../../../../packages/cli/dist/index.js',import.meta.url).pathname,...args],{stdio:'inherit'});
process.exit(r.status??1);

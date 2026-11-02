import { runRoot,evidenceRoot } from './config.mjs';
// Controller replay: capture outputs from logged commands, distinct from agent invocation evidence.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const cli=resolve('packages/cli/dist/index.js');
for(const arm of ['B','C']){
 const cwd=new URL(arm,runRoot).pathname;const commands=readFileSync(cwd+'/commands.jsonl','utf8').trim().split('\n').map(JSON.parse);
 const records=[];mkdirSync(new URL(`retrieval/${arm}`,evidenceRoot),{recursive:true});
 for(const [i,row] of commands.entries()){
 if(!['--version','--help','search','recommend','inspect'].includes(row.args[0]))throw Error('Unexpected logged command');
 const r=spawnSync(process.execPath,[cli,...row.args],{cwd,encoding:'utf8'});if(r.error||r.status!==0)throw Error(r.error?.message??r.stderr);
 const path=`retrieval/${arm}/${i}.txt`;writeFileSync(new URL(path,evidenceRoot),r.stdout);
 records.push({...row,replayArgs:[process.execPath,cli,...row.args],stdoutFile:path,stdoutBytes:Buffer.byteLength(r.stdout),stdoutSha256:createHash('sha256').update(r.stdout).digest('hex'),stderr:r.stderr});
 }
 writeFileSync(new URL(`retrieval/${arm}/index.json`,evidenceRoot),JSON.stringify({note:'Controller replay of original commands.jsonl after runs froze; does not prove these bytes were in original agent context. Original C packets/contract files and both agents decision reports supply additional consumption evidence.',records},null,2)+'\n');
}

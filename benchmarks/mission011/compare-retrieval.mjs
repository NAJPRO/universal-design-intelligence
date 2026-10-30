import { spawnSync } from 'node:child_process';
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const root=new URL('./',import.meta.url);const runtimes={before:new URL('baseline/udi.mjs',root).pathname,after:resolve('packages/cli/dist/index.js')};
const context=new URL('protocol/context.json',root).pathname;const records={};
const commands={v1:['recommend','--type','dashboard','--preserve-brand','--json'],v20:['recommend','--schema-version','2.0','--context',context,'--json'],v21:['recommend','--schema-version','2.1','--context',context,'--json']};
for(const id of ['CMP-OPERATIONAL-TABLE','CMP-FILTER-WORKSPACE','CMP-RECOVERABLE-FORM','COM-OPERATIONAL-MANAGEMENT'])commands[id]=['inspect',id,'--json'];
for(const [label,runtime]of Object.entries(runtimes)){
 mkdirSync(new URL(`evidence/retrieval/${label}/`,root),{recursive:true});records[label]={runtimeSha256:createHash('sha256').update(readFileSync(runtime)).digest('hex'),commands:{}};
 for(const [key,args]of Object.entries(commands)){
 const run=()=>{const r=spawnSync(process.execPath,[runtime,...args],{encoding:'utf8'});if(r.error||r.status!==0)throw Error(r.error?.message??r.stderr);return r.stdout;};
 const output=run();if(run()!==output)throw Error('Non-deterministic output');
 writeFileSync(new URL(`evidence/retrieval/${label}/${key}.json`,root),output);records[label].commands[key]={args,bytes:Buffer.byteLength(output),sha256:createHash('sha256').update(output).digest('hex')};
 }
}
for(const version of ['v1','v20'])if(records.before.commands[version].sha256!==records.after.commands[version].sha256)throw Error(`Legacy ${version} changed`);
writeFileSync(new URL('evidence/retrieval-comparison.json',root),JSON.stringify(records,null,2)+'\n');console.log('Deterministic before/after outputs retained; v1 and 2.0 byte-identical.');

import { evidenceRoot } from './config.mjs';
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const results={note:'Instrumentation injects entry logging into loaded JavaScript in memory; build/source files unchanged. Not used for timing. Counts cover a single warm API invocation after imports.',runs:{}};
for(const version of ['2.0','2.1']){
 const name=version==='2.0'?'recommendDesignV2':'recommendDesignV21';const file=version==='2.0'?'recommend-v2':'components';
 const script=`const {${name}}=await import('./packages/core/dist/${file}.js'); console.error('BEGIN'); const packet=${name}({schemaVersion:'2.0',applicationType:{value:'operations-workspace',status:'explicit'},tasks:{primary:{value:'manage products table',status:'explicit'}}}); console.log(JSON.stringify(packet));`;
 const r=spawnSync(process.execPath,['--no-warnings','--experimental-loader','./tests/mission010/trace-loader.mjs','--input-type=module','-e',script],{encoding:'utf8'});if(r.error||r.status!==0)throw Error(r.error?.message??r.stderr);
 if(!r.stderr.includes('BEGIN'))throw Error(JSON.stringify({status:r.status,stderr:r.stderr,stdout:r.stdout}));
 const events=r.stderr.split('BEGIN\n')[1].trim().split('\n').map(line=>JSON.parse(line));results.runs[version]={events,counts:Object.fromEntries(['index','legacy-validation','component-validation'].map(k=>[k,events.filter(e=>e.event===k).length]))};
}
writeFileSync(new URL('validation-trace.json',evidenceRoot),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));

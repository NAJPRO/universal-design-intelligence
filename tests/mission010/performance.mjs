import { evidenceRoot } from './config.mjs';
/** Warm API scaling and process-cold CLI timings. No runtime modifications. */
import { performance } from 'node:perf_hooks';
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { recommendDesignV2 } from '../../packages/core/dist/recommend-v2.js';
import { recommendDesignV21, professionalComponents } from '../../packages/core/dist/components.js';
import { defaultCatalogV2, KnowledgeIndexV2 } from '../../packages/core/dist/knowledge-v2.js';
import { normalizeContextV2 } from '../../packages/core/dist/context-v2.js';
import { validateCatalog } from '../../packages/knowledge/dist/index.js';
import { validateComponentCatalog } from '../../packages/knowledge/dist/components.js';
const context={schemaVersion:'2.0',applicationType:{value:'operations-workspace',status:'explicit'},tasks:{primary:{value:'manage products table',status:'explicit'},secondary:[{value:'filter products',status:'explicit'},{value:'edit product form',status:'explicit'}]},brand:{preserve:true}};
const hash=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const summary=xs=>({samplesMs:xs,medianMs:[...xs].sort((a,b)=>a-b)[Math.floor(xs.length/2)],minMs:Math.min(...xs),maxMs:Math.max(...xs)});
const results={environment:{node:process.version,platform:process.platform,arch:process.arch},protocol:'Warm API: 2 unmeasured calls then 9 alternating 2.0/2.1 pairs per size. Fixed component pack, expanded legacy rules only. Phase measurements standalone, not additive. Cold CLI: 9 alternating fresh processes, warm filesystem caches; no OS cache flush. Run without concurrent agents/build/tests.',context,scaling:[],cold:{},bundleSha256:hash(readFileSync(new URL('../../packages/cli/dist/index.js',import.meta.url),'utf8'))};
for(const factor of [1,4,16]){
 const catalog=structuredClone(defaultCatalogV2);
 for(let copy=1;copy<factor;copy++)for(const [i,rule] of defaultCatalogV2.rules.entries())catalog.rules.push({...structuredClone(rule),id:`UDI-Z${String.fromCharCode(65+Math.floor(copy/26))}${String.fromCharCode(65+copy%26)}-${String(i+1).padStart(3,'0')}`});
 validateCatalog(catalog);
 const funcs={'2.0':()=>recommendDesignV2(context,{},catalog),'2.1':()=>recommendDesignV21(context,{},catalog,professionalComponents)};
 const times={'2.0':[],'2.1':[]}; const outputs={};
 for(const fn of Object.values(funcs)){fn();fn();}
 for(let i=0;i<9;i++) for(const key of i%2?['2.1','2.0']:['2.0','2.1']){const t=performance.now();const packet=funcs[key]();times[key].push(performance.now()-t);const digest=hash(packet);if(outputs[key]&&outputs[key].sha256!==digest)throw Error('Nondeterminism');outputs[key]={sha256:digest,bytes:Buffer.byteLength(JSON.stringify(packet)+'\n'),ids:packet.entities.map(e=>e.id),coverage:packet.coverage};}
 const phases={};for(const [key,fn] of Object.entries({legacyValidation:()=>validateCatalog(catalog),componentValidation:()=>validateComponentCatalog(professionalComponents,catalog),indexIncludingValidation:()=>new KnowledgeIndexV2(normalizeContextV2(context),catalog)})){const xs=[];for(let i=0;i<9;i++){const t=performance.now();fn();xs.push(performance.now()-t);}phases[key]=summary(xs);}
 results.scaling.push({factor,rules:catalog.rules.length,totalLegacyEntities:catalog.rules.length+catalog.profiles.length+catalog.patterns.length+catalog.antiPatterns.length,timings:Object.fromEntries(Object.entries(times).map(([k,v])=>[k,summary(v)])),phases,outputs});
}
const brief=new URL('performance-context.json',evidenceRoot);writeFileSync(brief,JSON.stringify(context,null,2)+'\n');
for(let i=0;i<9;i++)for(const schema of i%2?['2.1','2.0']:['2.0','2.1']){const args=['packages/cli/dist/index.js','recommend','--schema-version',schema,'--context',brief.pathname,'--json'];const t=performance.now();const r=spawnSync(process.execPath,args,{encoding:'utf8'});if(r.error||r.status!==0)throw Error(r.error?.message??r.stderr);const row=results.cold[schema]??={args,samples:[],stdoutSha256:hash(r.stdout)};row.samples.push(performance.now()-t);if(row.stdoutSha256!==hash(r.stdout))throw Error('Cold nondeterminism');}
for(const row of Object.values(results.cold)){row.timing=summary(row.samples);delete row.samples;}
writeFileSync(new URL('performance.json',evidenceRoot),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({scaling:results.scaling.map(r=>({rules:r.rules,v20:r.timings['2.0'].medianMs,v21:r.timings['2.1'].medianMs,phases:Object.fromEntries(Object.entries(r.phases).map(([k,v])=>[k,v.medianMs]))})),cold:Object.fromEntries(Object.entries(results.cold).map(([k,v])=>[k,v.timing.medianMs]))},null,2));

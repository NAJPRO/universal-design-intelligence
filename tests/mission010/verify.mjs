import { runSet,evidenceRoot } from './config.mjs';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const root=new URL('./',import.meta.url);
const frozen=JSON.parse(await readFile(new URL('evidence/frozen-inputs.json',root),'utf8'));
const checks=[];
for(const [path,expected] of Object.entries(frozen))checks.push({check:`frozen:${path}`,passed:hash(await readFile(new URL(path,root)))===expected});
for(const arm of ['A','B','C']){
 const start=JSON.parse(await readFile(new URL(`${runSet}/${arm}/START.json`,root),'utf8'));
 for(const file of ['index.html','app.js','styles.css','tokens.css','data.js'])checks.push({check:`${arm}:identical-start:${file}`,passed:start[file]===frozen[`fixture/${file}`]});
 for(const file of ['tokens.css','data.js'])checks.push({check:`${arm}:preserved:${file}`,passed:hash(await readFile(new URL(`${runSet}/${arm}/${file}`,root)))===start[file]});
 for(const [path,expected] of Object.entries(start).filter(([p])=>p.startsWith('skill/')))checks.push({check:`${arm}:unchanged-skill:${path}`,passed:hash(await readFile(new URL(`${runSet}/${arm}/${path}`,root)))===expected});
}
const manifest={};
async function inventory(path=runSet+'/'){
 for(const entry of await readdir(new URL(path,root),{withFileTypes:true})){
 if(entry.name.startsWith('.chrome'))throw Error('Browser profile must be removed before freezing');
 const name=path+entry.name;if(entry.isDirectory())await inventory(name+'/');else manifest[name]=hash(await readFile(new URL(name,root)));
 }
}
await inventory();
await writeFile(new URL('integrity.json',evidenceRoot),JSON.stringify({checks,passed:checks.every(c=>c.passed),finalRunFiles:manifest},null,2)+'\n');
console.log(`${checks.filter(c=>c.passed).length}/${checks.length} integrity checks passed`);if(checks.some(c=>!c.passed))process.exitCode=1;

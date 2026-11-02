import { mkdirSync } from 'node:fs';
const simple=value=>{if(!/^[a-zA-Z0-9_-]+$/.test(value))throw Error('Benchmark directory names must be single alphanumeric/hyphen/underscore segments');return value;};
export const runSet=simple(process.env.UDI_BENCH_SET??'runs');
export const runRoot=new URL(`./${runSet}/`,import.meta.url);
export const evidenceRoot=new URL(`./${simple(process.env.UDI_BENCH_EVIDENCE??'evidence')}/`,import.meta.url);
mkdirSync(evidenceRoot,{recursive:true});

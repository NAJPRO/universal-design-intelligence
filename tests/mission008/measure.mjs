// Called by measure.py after a build. No subprocesses or network access.
import {performance} from 'node:perf_hooks';
import {readFileSync} from 'node:fs';
import {cpus,platform,arch} from 'node:os';
import * as core from '../../packages/core/dist/index.js';
const timing=run=>{const values=[];for(let i=0;i<10;i++)run();for(let i=0;i<100;i++){const start=performance.now();run();values.push(performance.now()-start);}values.sort((a,b)=>a-b);return {median:values[50],p95:values[94]};};
const result={node:process.version,platform:platform(),arch:arch(),cpu:cpus()[0]?.model,v1RankingMs:timing(()=>core.recommendDesign({type:'dashboard',framework:'react',audience:'enterprise operations teams'}))};
result.v1RssBytes=process.memoryUsage().rss;result.v1MaxRssKiB=process.resourceUsage().maxRSS;
if(core.recommendDesignV2){const context=JSON.parse(readFileSync('tests/mission008/commerce-admin.json','utf8'));result.v2RankingMs=timing(()=>core.recommendDesignV2(context));result.v2PacketBytes=Buffer.byteLength(JSON.stringify(core.recommendDesignV2(context))+'\n');}
result.rssBytes=process.memoryUsage().rss;result.maxRssKiB=process.resourceUsage().maxRSS;
console.log(JSON.stringify(result));

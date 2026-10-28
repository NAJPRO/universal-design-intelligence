"""Paired process-cold CLI timings. Use preserved before/after package trees, no concurrent test/build workload."""
import hashlib, json, pathlib, platform, random, statistics, subprocess, sys, tempfile, time
before, after = map(pathlib.Path, sys.argv[1:3])
root = pathlib.Path(__file__).resolve().parents[2]
cases = json.loads((root / 'tests/mission009/evaluation.json').read_text())
def run(args):
    started=time.perf_counter_ns()
    result=subprocess.run(args,capture_output=True,check=True)
    return (time.perf_counter_ns()-started)/1e6, result.stdout

def summary(samples):
    values=sorted(samples)
    return dict(samples=samples,medianMs=statistics.median(values),p95Ms=values[__import__('math').ceil(.95*len(values))-1],sdMs=statistics.pstdev(values),minMs=min(values),maxMs=max(values))

with tempfile.TemporaryDirectory(prefix='udi009-measure-') as temp:
    context=pathlib.Path(temp)/'context.json';context.write_text(json.dumps(cases[0]['context']))
    common={'version':['--version'],'search':['search','keyboard focus','--json'],'v1':['recommend','--type','dashboard','--json'], 'v20':['recommend','--schema-version','2.0','--context',str(context),'--json']}
    extra={'v21':['recommend','--schema-version','2.1','--context',str(context),'--json'],'inspect':['inspect','CMP-OPERATIONAL-TABLE','--json']}
    samples={key:{v:[] for v in ['before','after']} for key in common}
    hashes={};new={key:[] for key in extra};rng=random.Random(9009)
    for key,args in common.items():
        for variant,tree in [('before',before),('after',after)]:
            _,out=run(['node',str(tree/'dist/index.js'),*args]); hashes[(key,variant)]=hashlib.sha256(out).hexdigest()
    for block in range(3):
        for trial in range(6):
            order=list(common);rng.shuffle(order)
            for key in order:
                variants=[('before',before),('after',after)]
                if (trial+block)%2:variants.reverse()
                for variant,tree in variants:
                    elapsed,out=run(['node',str(tree/'dist/index.js'),*common[key]])
                    assert hashlib.sha256(out).hexdigest()==hashes[(key,variant)]
                    samples[key][variant].append(elapsed)
            for key,args in extra.items():
                elapsed,_=run(['node',str(after/'dist/index.js'),*args]);new[key].append(elapsed)
    assert all(hashes[(key,'before')]==hashes[(key,'after')] for key in common)
    def pack(tree):
        result=subprocess.run(['npm','pack','--dry-run','--ignore-scripts','--json','--cache',temp],cwd=tree,capture_output=True,check=True)
        data=json.loads(result.stdout)[0]
        return {key:data[key] for key in ['size','unpackedSize','entryCount']}
    control=[run(['node','--eval',''])[0] for _ in range(18)]
    result={'timestamp':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'platform':platform.platform(),'node':subprocess.check_output(['node','--version'],text=True).strip(),
      'protocol':'3 blocks x 6 alternating pairs per common command (18 each). Shuffled command order; stdout captured and hashes equal. Fresh processes with warm filesystem caches; no OS cache flush. Extra new commands measured 18 times on after only. One host, no concurrent build/tests.',
      'beforeBundleSha256':hashlib.sha256((before/'dist/index.js').read_bytes()).hexdigest(),'afterBundleSha256':hashlib.sha256((after/'dist/index.js').read_bytes()).hexdigest(),
      'bundleBytes':{'before':(before/'dist/index.js').stat().st_size,'after':(after/'dist/index.js').stat().st_size},
      'pack':{'before':pack(before),'after':pack(after)},'control':summary(control),
      'commands':{key:{'before':summary(data['before']),'after':summary(data['after']),'stdoutSha256':hashes[(key,'after')],'medianPairedDeltaMs':statistics.median([b-a for a,b in zip(data['before'],data['after'])])} for key,data in samples.items()},
      'newCommands':{key:summary(values) for key,values in new.items()}}
    print(json.dumps(result,indent=2))

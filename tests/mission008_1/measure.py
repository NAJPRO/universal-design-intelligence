"""Compare preserved pre/post bundles in alternating fresh processes, from repo root.
Usage: python3 tests/mission008_1/measure.py /tmp/udi-mission0081-... > artifact.json
Build each root/{before,after}/profile with profile-build.mjs first.
"""
import hashlib,json,math,platform,random,statistics,subprocess,sys,tempfile,time
from pathlib import Path
root=Path(sys.argv[1]).resolve()
context=str(Path('tests/mission008/commerce-admin.json').resolve())
guard=str(Path('tests/mission008_1/preload.cjs').resolve())
cases={'version':['--version'],'search':['search','keyboard focus','--json'],'recommend-v1':['recommend','--type','dashboard','--json'],'recommend-v2':['recommend','--schema-version','2.0','--context',context,'--json']}

def execute(variant,case,profile=False):
    command=['node']
    if profile: command+=['--require',guard]
    command+=[str(root/variant/('profile' if profile else 'dist')/'index.js'),*cases[case]]
    start=time.perf_counter_ns()
    result=subprocess.run(command,capture_output=True,check=True)
    elapsed=(time.perf_counter_ns()-start)/1e6
    if not profile and result.stderr: raise RuntimeError(result.stderr.decode())
    trace=None
    if profile:
        line=next(line for line in result.stderr.decode().splitlines() if line.startswith('UDI_PROFILE:'))
        trace=json.loads(line[len('UDI_PROFILE:'):])
    return elapsed,hashlib.sha256(result.stdout).hexdigest(),trace

def stats(values):
    values=sorted(values)
    return {'n':len(values),'min':values[0],'median':statistics.median(values),'p95':values[math.ceil(.95*len(values))-1],'max':values[-1],'stdev':statistics.pstdev(values)}

# Warm filesystem/JIT service effects before recording; every command still uses a fresh Node process.
for variant in ['before','after']:
    for case in cases: execute(variant,case)
rows=[]
for block in range(3):
    for trial in range(8):
        order=list(cases); random.Random(block*100+trial).shuffle(order)
        for case in order:
            variants=['before','after'] if (block+trial)%2==0 else ['after','before']
            for variant in variants:
                elapsed,digest,_=execute(variant,case)
                rows.append({'block':block,'trial':trial,'case':case,'variant':variant,'wallMs':elapsed,'stdoutSha256':digest})
summary={}
for case in cases:
    summary[case]={}
    hashes=set()
    for variant in ['before','after']:
        selected=[row for row in rows if row['case']==case and row['variant']==variant]
        hashes.update(row['stdoutSha256'] for row in selected)
        summary[case][variant]=stats([row['wallMs'] for row in selected])
        summary[case][variant]['blockMedians']=[statistics.median(row['wallMs'] for row in selected if row['block']==block) for block in range(3)]
    if len(hashes)!=1: raise AssertionError(f'Output changed for {case}')
    summary[case]['stdoutSha256']=hashes.pop()
    pairs=[]
    for block in range(3):
        for trial in range(8):
            pair={row['variant']:row['wallMs'] for row in rows if row['case']==case and row['block']==block and row['trial']==trial}
            pairs.append(pair['after']-pair['before'])
    summary[case]['pairedDeltaMs']=stats(pairs)
profiles=[]
for repeat in range(5):
    for case in cases:
        for variant in (['before','after'] if repeat%2==0 else ['after','before']):
            _,digest,trace=execute(variant,case,True)
            if digest!=summary[case]['stdoutSha256']: raise AssertionError('Profiling changed stdout')
            profiles.append({'case':case,'variant':variant,'repeat':repeat,**trace})
control=[]
for _ in range(24):
    start=time.perf_counter_ns(); subprocess.run(['node','-e',''],capture_output=True,check=True); control.append((time.perf_counter_ns()-start)/1e6)
packages={}
for variant in ['before','after']:
    with tempfile.TemporaryDirectory(prefix='udi-perf-cache-') as cache:
        result=subprocess.run(['npm','pack','--dry-run','--ignore-scripts','--json','--cache',cache],cwd=root/variant,capture_output=True,text=True,check=True)
        pack=json.loads(result.stdout)[0]
        packages[variant]={'compressedBytes':pack['size'],'unpackedBytes':pack['unpackedSize'],'files':[item['path'] for item in pack['files']],'bundleSha256':hashlib.sha256((root/variant/'dist/index.js').read_bytes()).hexdigest()}
print(json.dumps({'method':'3 blocks x 8 paired trials per command; fresh processes, warm filesystem; alternate order; no concurrent build/test workload','node':subprocess.check_output(['node','--version'],text=True).strip(),'platform':platform.platform(),'cpu':Path('/proc/cpuinfo').read_text().split('model name\t: ')[1].splitlines()[0] if Path('/proc/cpuinfo').exists() else platform.processor(),'nodeEmptyProcessMs':stats(control),'summary':summary,'packages':packages,'profiles':profiles,'samples':rows},indent=2))

"""Run from repository root after pnpm build; no dependency installation."""
import subprocess,json,time,statistics,tempfile
from pathlib import Path

def run(args,cwd=None):
    return subprocess.check_output(args,cwd=cwd,text=True,stderr=subprocess.PIPE)

values=[]
for _ in range(20):
    start=time.perf_counter()
    run(['node','packages/cli/dist/index.js','--version'])
    values.append((time.perf_counter()-start)*1000)
with tempfile.TemporaryDirectory(prefix='udi-measure-cache-') as cache:
    pack=json.loads(run(['npm','pack','--dry-run','--ignore-scripts','--json','--cache',cache],'packages/cli'))[0]
result=json.loads(run(['node','tests/mission008/measure.mjs']))
result.update({'samples':{'startup':20,'ranking':100},'package':{'compressedBytes':pack['size'],'unpackedBytes':pack['unpackedSize'],'bundleBytes':Path('packages/cli/dist/index.js').stat().st_size},'startupMs':{'median':statistics.median(values),'p95':sorted(values)[18]}})
print(json.dumps(result,indent=2))

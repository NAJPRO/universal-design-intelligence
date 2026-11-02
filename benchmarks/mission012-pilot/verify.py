from pathlib import Path
import hashlib,json
r=Path(__file__).resolve().parent;repo=r.parent.parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
frozen=json.loads((r/'evidence/frozen.json').read_text());checks=[{'path':k,'passed':(r/k).is_file() and sha(r/k)==v} for k,v in frozen.items()]
prior=json.loads((r/'evidence/prior-missions.json').read_text());actual={str(p.relative_to(repo)) for tree in ['tests/mission010','benchmarks/mission011'] for p in (repo/tree).rglob('*') if p.is_file()}
checks.append({'path':'Prior mission file sets','passed':actual==set(prior)})
checks.extend({'path':k,'passed':(repo/k).is_file() and sha(repo/k)==v} for k,v in prior.items())
for arm in 'ABC':
 for p in ['data.js','tokens.css','package.json','TASK.md','AGENTS.md']:
  checks.append({'path':f'runs/{arm}/{p}','passed':sha(r/'inputs'/arm/p)==sha(r/'runs'/arm/p)})
source=r/'evidence/final-sources.json'
if source.exists():checks.extend({'path':k,'passed':(r/k).is_file() and sha(r/k)==v} for k,v in json.loads(source.read_text()).items())
(r/'evidence/integrity.json').write_text(json.dumps({'passed':all(c['passed'] for c in checks),'checks':checks},indent=2)+'\n')
print(sum(c['passed'] for c in checks),'/',len(checks),'integrity checks pass')
if not all(c['passed'] for c in checks):raise SystemExit(1)

from pathlib import Path
import json,hashlib,difflib,shutil
r=Path(__file__).resolve().parent
if (r/'evidence/final-sources.json').exists():raise SystemExit('Final sources already frozen')
if not all((r/'evidence'/a/'execution.json').exists() for a in 'ABC'):raise SystemExit('Wait for all submissions before inspecting outputs')
summary={};hashes={}
for a in 'ABC':
 work=r/'runs'/a;ev=r/'evidence'/a;events=[]
 for l in (ev/'events.jsonl').read_text().splitlines():
  try:events.append(json.loads(l))
  except:pass
 commands=[e['item'] for e in events if e.get('type')=='item.completed' and e.get('item',{}).get('type')=='command_execution']
 (ev/'command-events.json').write_text(json.dumps(commands,indent=2)+'\n')
 summary[a]={'execution':json.loads((ev/'execution.json').read_text()),'usage':[e for e in events if e.get('type')=='turn.completed'],'errors':[e for e in events if e.get('type')=='error'],'commandCount':len(commands),'failedCommands':[c for c in commands if c.get('exit_code') not in [0,None]],'udiCommands':[]}
 if (work/'.udi-logs/commands.jsonl').exists():
  shutil.copyfile(work/'.udi-logs/commands.jsonl',ev/'udi-commands.jsonl');summary[a]['udiCommands']=[json.loads(l)['args'] for l in (ev/'udi-commands.jsonl').read_text().splitlines()]
 dest=r/'sources'/a;dest.mkdir(parents=True)
 patches=[]
 for p in work.rglob('*'):
  if not p.is_file() or any(s.startswith('.') for s in p.relative_to(work).parts):continue
  rel=p.relative_to(work);out=dest/rel;out.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,out);hashes[str(out.relative_to(r))]=hashlib.sha256(out.read_bytes()).hexdigest()
  orig=r/'inputs'/a/rel
  if p.suffix in ['.js','.html','.css','.md','.json']:
   old=orig.read_text().splitlines(keepends=True) if orig.exists() else []
   patches.extend(difflib.unified_diff(old,p.read_text().splitlines(keepends=True),fromfile='initial/'+str(rel),tofile='final/'+str(rel)))
 (ev/'source.patch').write_text(''.join(patches))
(r/'evidence/final-sources.json').write_text(json.dumps(hashes,indent=2)+'\n')
(r/'evidence/agent-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print({a:{'commands':s['commandCount'],'udiCalls':len(s['udiCommands']),'seconds':s['execution']['elapsedSeconds']} for a,s in summary.items()})

"""Freeze inputs once. Never replaces an existing experiment."""
from pathlib import Path
import hashlib,json,shutil
root=Path(__file__).resolve().parent;repo=root.parent.parent
if (root/'evidence/frozen.json').exists():raise SystemExit('Already frozen; use a new experiment directory, never overwrite.')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
prior={str(p.relative_to(repo)):sha(p) for tree in ['tests/mission010','benchmarks/mission011'] for p in (repo/tree).rglob('*') if p.is_file()}
(root/'evidence/prior-missions.json').write_text(json.dumps(prior,indent=2)+'\n')
for arm in ['A','B','C']:
 dest=root/'runs'/arm;shutil.copytree(root/'fixture',dest)
 base='This is an isolated implementation workspace. Follow TASK.md. Work only in /work; do not use Git or external services. Do not inspect authentication files. No other project skills apply.\n'
 if arm!='A':
  source=repo/('tests/mission010/protocol/enhanced-skill' if arm=='B' else 'skills/udi-design')
  skill=dest/'.agents/skills/udi-design';shutil.copytree(source,skill)
  runtime=dest/'.udi';(runtime/'bin').mkdir(parents=True);shutil.copyfile(repo/('benchmarks/mission011/baseline/udi.mjs' if arm=='B' else 'packages/cli/dist/index.js'),runtime/'bin/runtime.mjs')
  (runtime/'package.json').write_text('{"name":"udi-benchmark-runtime","version":"0.1.0","type":"module","private":true}\n')
  scripts=skill/'scripts';scripts.mkdir(exist_ok=True)
  (scripts/'udi.mjs').write_text('''import{spawnSync}from'node:child_process';import{appendFileSync,mkdirSync}from'node:fs';
const args=process.argv.slice(2);const r=spawnSync(process.execPath,['/work/.udi/bin/runtime.mjs',...args],{encoding:'utf8',maxBuffer:2000000});mkdirSync('/work/.udi-logs',{recursive:true});appendFileSync('/work/.udi-logs/commands.jsonl',JSON.stringify({time:new Date().toISOString(),args,status:r.status,stdout:r.stdout,stderr:r.stderr})+'\\n');process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');process.exit(r.status??1);
''')
  base+='\nAvailable skill (select when relevant):\n- udi-design: Helps AI coding agents design and improve responsive, accessible, polished web interfaces while respecting an existing stack, brand and design system. Entry: /work/.agents/skills/udi-design/SKILL.md. Local launcher: /work/.agents/skills/udi-design/scripts/udi.mjs.\n'
 (dest/'AGENTS.md').write_text(base)
 shutil.copyfile(root/'protocol/task.md',dest/'TASK.md')
 # Input snapshots independent of mutable generated work.
 shutil.copytree(dest,root/'inputs'/arm)
files={str(p.relative_to(root)):sha(p) for tree in ['protocol','inputs','fixture'] for p in (root/tree).rglob('*') if p.is_file()}
(root/'evidence/frozen.json').write_text(json.dumps(files,indent=2)+'\n')
print(f'Frozen {len(files)} inputs; protected {len(prior)} prior evidence files.')

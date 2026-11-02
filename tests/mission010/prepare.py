"""Create clean benchmark copies; refuse existing destinations. No Git operations."""
from pathlib import Path
import shutil, json, hashlib, argparse
parser=argparse.ArgumentParser()
parser.add_argument("--set",default="runs",help="New single directory name beside fixture; refuses existing arms")
args=parser.parse_args()
if not args.set.replace("-", "").replace("_", "").isalnum(): raise SystemExit("Use a simple directory name")
root=Path(__file__).resolve().parent
for arm in ('A','B','C'):
    dest=root/args.set/arm
    if dest.exists(): raise SystemExit(f'Refusing existing destination: {dest}')
for arm in ('A','B','C'):
    dest=root/args.set/arm
    shutil.copytree(root/'fixture',dest)
    if arm!='A':
        source=root/'protocol'/'legacy-skill' if arm=='B' else root/'protocol'/'enhanced-skill'
        shutil.copytree(source,dest/'skill')
        scripts=dest/'skill'/'scripts';scripts.mkdir(exist_ok=True)
        (scripts/'udi.mjs').write_text("import { spawnSync } from 'node:child_process';\nimport { appendFileSync } from 'node:fs';\nconst args=process.argv.slice(2);\nappendFileSync(new URL('../../commands.jsonl',import.meta.url),JSON.stringify({args,time:new Date().toISOString()})+'\\n');\nconst r=spawnSync(process.execPath,[new URL('../../../../../../packages/cli/dist/index.js',import.meta.url).pathname,...args],{stdio:'inherit'});\nif(r.error)console.error(r.error.message);\nprocess.exit(r.error?1:(r.status??1));\n")
    (dest/'START.json').write_text(json.dumps({str(p.relative_to(dest)):hashlib.sha256(p.read_bytes()).hexdigest() for p in dest.rglob('*') if p.is_file()},indent=2)+'\n')

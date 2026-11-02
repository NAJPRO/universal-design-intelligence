"""Run one isolated agent. Host credentials are bind-mounted, never copied/logged."""
from pathlib import Path
import os,json,subprocess,time,hashlib,sys
root=Path(__file__).resolve().parent;arm=sys.argv[1]
if arm not in ['A','B','C']:raise SystemExit('Expected A, B or C')
work=root/'runs'/arm;ev=root/'evidence'/arm;ev.mkdir(exist_ok=False)
settings=json.loads((root/'protocol/settings.json').read_text());toolchain=Path(subprocess.check_output(['which','node'],text=True).strip()).resolve().parent.parent
native=next(toolchain.glob('lib/node_modules/@openai/codex/node_modules/@openai/codex-linux-x64/vendor/*/bin/codex'))
agent_home=ev/'home';(agent_home/'.codex').mkdir(parents=True)
cmd=['bwrap','--unshare-user','--unshare-pid','--unshare-ipc','--die-with-parent','--new-session','--clearenv','--ro-bind','/usr','/usr','--symlink','usr/bin','/bin','--symlink','usr/lib','/lib','--symlink','usr/lib64','/lib64','--proc','/proc','--dev','/dev','--tmpfs','/tmp','--ro-bind',str(toolchain),'/toolchain','--ro-bind','/opt/google/chrome','/opt/google/chrome','--ro-bind','/etc/ssl','/etc/ssl','--ro-bind','/etc/fonts','/etc/fonts','--ro-bind','/etc/resolv.conf','/etc/resolv.conf','--ro-bind','/etc/hosts','/etc/hosts','--ro-bind','/etc/nsswitch.conf','/etc/nsswitch.conf','--bind',str(work),'/work','--bind',str(agent_home),'/home/agent','--ro-bind',str(Path.home()/'.codex/auth.json'),'/home/agent/.codex/auth.json','--setenv','HOME','/home/agent','--setenv','CODEX_HOME','/home/agent/.codex','--setenv','PATH','/toolchain/bin:/usr/bin:/bin','--setenv','SHELL','/bin/bash','--setenv','LANG','C.UTF-8','--setenv','TMPDIR','/tmp','--chdir','/work']
for p in ['data.js','tokens.css','package.json','TASK.md','AGENTS.md','tools']+(['.udi','.agents'] if arm!='A' else []):cmd+=['--ro-bind',str(work/p),'/work/'+p]
# Verify denied sibling/host reads before spending an agent invocation. The only project mount is /work.
probe=cmd+['/bin/bash','-c','test ! -e /work/../runs && test ! -e /home/audin && test ! -e /work/../benchmarks && test -r /work/data.js && echo isolated']
p=subprocess.run(probe,capture_output=True,text=True);(ev/'isolation.json').write_text(json.dumps({'command':probe,'code':p.returncode,'stdout':p.stdout,'stderr':p.stderr},indent=2)+'\n')
if p.returncode:raise SystemExit('Isolation probe failed; no agent started.')
cmd+=['/toolchain/'+str(native.relative_to(toolchain)),'exec','--ignore-user-config','--ignore-rules','--ephemeral','--skip-git-repo-check','--dangerously-bypass-approvals-and-sandbox','--model',settings['model'],'-c','model_reasoning_effort="'+settings['reasoningEffort']+'"','-c','web_search="disabled"','-c','features.multi_agent=false','--json','--output-last-message','/work/FINAL.md','Read AGENTS.md and TASK.md. Complete the implementation and verification independently within the stated budget.']
(ev/'invocation.json').write_text(json.dumps({'args':cmd,'settings':settings,'startInputManifestSha256':hashlib.sha256((root/'evidence/frozen.json').read_bytes()).hexdigest()},indent=2)+'\n')
start=time.time();timed_out=False
with (ev/'events.jsonl').open('w') as out,(ev/'stderr.log').open('w') as err:
 child=subprocess.Popen(cmd,stdout=out,stderr=err)
 try:code=child.wait(timeout=settings['budget']['hardWallSeconds'])
 except subprocess.TimeoutExpired:timed_out=True;child.terminate();code=child.wait(timeout=20)
result={'exitCode':code,'timedOut':timed_out,'startedEpoch':start,'elapsedSeconds':time.time()-start}
(ev/'execution.json').write_text(json.dumps(result,indent=2)+'\n');print(arm,result,flush=True)

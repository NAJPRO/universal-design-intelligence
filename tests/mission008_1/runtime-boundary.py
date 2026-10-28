"""Verify actual preserved before/after bundles only against temporary HOME/UDI_HOME.
Usage: python3 tests/mission008_1/runtime-boundary.py /tmp/udi-mission0081-...
"""
import hashlib,json,os,subprocess,sys,tempfile
from pathlib import Path
artifacts=Path(sys.argv[1]).resolve()
def inventory(root):
    return {str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(root.rglob('*')) if p.is_file()}
with tempfile.TemporaryDirectory(prefix='udi-actual-boundary-') as directory:
    root=Path(directory); home=root/'home'; store=root/'store'; project=root/'project'
    home.mkdir();project.mkdir();(project/'package.json').write_text('{"name":"boundary-fixture"}\n')
    env={**os.environ,'HOME':str(home),'USERPROFILE':str(home),'UDI_HOME':str(store)}
    def run(binary,args):
        return subprocess.run(['node',str(binary),*args],cwd=project,env=env,capture_output=True,text=True)
    before=artifacts/'before/dist/index.js';after=artifacts/'after/dist/index.js'
    for args in [['init','--global','--agent','codex'],['init','--agent','codex']]:
        result=run(before,args);assert result.returncode==0,result.stderr
    prior=inventory(root)
    refusals=[]
    for args in [['init','--global','--agent','codex','--force'],['init','--agent','codex','--install-runtime','--force']]:
        result=run(after,args)
        assert result.returncode==1 and 'Refusing to replace unowned file' in result.stderr,result.stderr
        assert inventory(root)==prior,'Existing runtime/skills/project mutated'
        refusals.append({'args':args,'status':result.returncode,'reason':'immutable same-version content refused before writes'})
    launcher=project/'.agents/skills/udi-design/scripts/udi.mjs'
    result=run(launcher,['--version']);assert result.returncode==0 and result.stdout.strip()=='0.1.0',result.stderr
    report=run(before,['doctor','--global','--json']);assert report.returncode==0,report.stderr
    parsed=json.loads(report.stdout);assert parsed['installationVerified'] is True
    assert inventory(root)==prior,'Verification changed files'
    print(json.dumps({'scope':'isolated temporary HOME, project and runtime store','runtimeVersion':'0.1.0','runtimeSha256':hashlib.sha256((store/'runtimes/0.1.0/bin/index.js').read_bytes()).hexdigest(),'sameVersionRefusals':refusals,'originalLauncherVersion':result.stdout.strip(),'originalDoctorInstallationVerified':parsed['installationVerified'],'allFilesUnchanged':True},indent=2))

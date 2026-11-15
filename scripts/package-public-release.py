from pathlib import Path
import json,shutil
root=Path(__file__).resolve().parent.parent
out=root/'_site';out.mkdir(exist_ok=True)
files=json.loads((root/'public-release-manifest.json').read_text())
for name in files:
 p=Path(name)
 if p.is_absolute() or '..' in p.parts or any(x in p.parts for x in ['server','outputs','tests','node_modules']) or p.suffix in ['.sqlite','.db','.sql','.py','.map','.env']:raise ValueError('Non-public path')
 source=root/p
 if not source.is_file():raise ValueError('Missing public file: '+name)
 dest=out/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,dest)
print('Packaged',len(files),'public files')

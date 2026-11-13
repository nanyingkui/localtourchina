"""Read-only public release snapshot exported from the operator's canonical product database."""
import json
from pathlib import Path
def records():
    return json.loads((Path(__file__).parent/'catalog.json').read_text())

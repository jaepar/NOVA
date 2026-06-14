import sys
import os
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault("SERVER_PORT", "8004")
os.environ.setdefault("BACKEND_BASE_URL", "http://localhost:8000")
os.environ.setdefault("OPENAI_API_KEY", "test-openai-key")
os.environ.setdefault("OPENAI_MODEL", "gpt-4.1-mini")
os.environ.setdefault("USE_LLM_INTENT_RESOLVER", "false")

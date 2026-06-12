import os
from pathlib import Path

from dotenv import load_dotenv


PROJECT_ROOT = Path(__file__).resolve().parents[1]


def load_project_env(env_path: Path | None = None) -> None:
    target_path = env_path or PROJECT_ROOT / ".env"
    load_dotenv(target_path, override=False)


load_project_env()


BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")
USE_LLM_INTENT_RESOLVER = os.getenv("USE_LLM_INTENT_RESOLVER", "false").lower() == "true"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

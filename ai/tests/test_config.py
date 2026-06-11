import os
from pathlib import Path

from app import config


def test_load_project_env_reads_dotenv_file(tmp_path):
    env_file = tmp_path / ".env"
    env_file.write_text(
        "OPENAI_API_KEY=test-key\nUSE_LLM_INTENT_RESOLVER=true\n",
        encoding="utf-8",
    )

    os.environ.pop("OPENAI_API_KEY", None)
    os.environ.pop("USE_LLM_INTENT_RESOLVER", None)

    config.load_project_env(env_file)

    assert os.getenv("OPENAI_API_KEY") == "test-key"
    assert os.getenv("USE_LLM_INTENT_RESOLVER") == "true"

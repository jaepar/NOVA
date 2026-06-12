import os
from dataclasses import dataclass


def _required_env(env_name: str) -> str:
    env_value = os.getenv(env_name)
    if env_value:
        return env_value
    raise ValueError(f"{env_name} environment variable is required")


def _required_env_any(
    env_names: tuple[str, ...],
) -> str:
    for env_name in env_names:
        env_value = os.getenv(env_name)
        if env_value:
            return env_value
    joined_names = " or ".join(env_names)
    raise ValueError(f"{joined_names} environment variable is required")


def _to_bool(value: str) -> bool:
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    server_port: int
    backend_base_url: str
    use_llm_intent_resolver: bool
    openai_api_key: str | None
    openai_model: str


def build_settings() -> Settings:
    return Settings(
        server_port=int(
            _required_env_any(
                ("AI_SERVER_PORT", "SERVER_PORT"),
            )
        ),
        backend_base_url=_required_env("BACKEND_BASE_URL"),
        use_llm_intent_resolver=_to_bool(
            _required_env(
                "USE_LLM_INTENT_RESOLVER",
            )
        ),
        openai_api_key=_required_env("OPENAI_API_KEY"),
        openai_model=_required_env("OPENAI_MODEL"),
    )


settings = build_settings()


SERVER_PORT = settings.server_port
BACKEND_BASE_URL = settings.backend_base_url
USE_LLM_INTENT_RESOLVER = settings.use_llm_intent_resolver
OPENAI_API_KEY = settings.openai_api_key
OPENAI_MODEL = settings.openai_model

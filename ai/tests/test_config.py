from app import config


def test_build_settings_uses_environment(monkeypatch):
    monkeypatch.setenv("SERVER_PORT", "8004")
    monkeypatch.setenv("BACKEND_BASE_URL", "http://override-backend:8000")
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setenv("OPENAI_MODEL", "gpt-4.1-mini")
    monkeypatch.setenv("USE_LLM_INTENT_RESOLVER", "true")

    settings = config.build_settings()

    assert settings.server_port == 8004
    assert settings.backend_base_url == "http://override-backend:8000"
    assert settings.use_llm_intent_resolver is True
    assert settings.openai_api_key == "test-key"
    assert settings.openai_model == "gpt-4.1-mini"


def test_build_settings_accepts_ai_server_port_alias(monkeypatch):
    monkeypatch.delenv("SERVER_PORT", raising=False)
    monkeypatch.setenv("AI_SERVER_PORT", "8004")
    monkeypatch.setenv("BACKEND_BASE_URL", "http://localhost:8000")
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setenv("OPENAI_MODEL", "gpt-4.1-mini")
    monkeypatch.setenv("USE_LLM_INTENT_RESOLVER", "false")

    settings = config.build_settings()

    assert settings.server_port == 8004


def test_build_settings_requires_environment(monkeypatch):
    monkeypatch.delenv("SERVER_PORT", raising=False)
    monkeypatch.delenv("AI_SERVER_PORT", raising=False)
    monkeypatch.setenv("BACKEND_BASE_URL", "http://backend.internal:8000")
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setenv("OPENAI_MODEL", "gpt-4.1-mini")
    monkeypatch.setenv("USE_LLM_INTENT_RESOLVER", "true")

    try:
        config.build_settings()
    except ValueError as exc:
        assert "SERVER_PORT" in str(exc)
    else:
        raise AssertionError("Expected missing SERVER_PORT to raise ValueError")

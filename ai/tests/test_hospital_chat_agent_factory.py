from unittest.mock import Mock, patch

from app.services.hospital_chat_agent_factory import create_hospital_chat_agent


def test_create_hospital_chat_agent_returns_none_when_llm_disabled():
    agent = create_hospital_chat_agent(
        use_llm=False,
        openai_api_key=None,
    )

    assert agent is None


def test_create_hospital_chat_agent_builds_agent_when_llm_enabled():
    with patch("app.services.hospital_chat_agent_factory.LangGraphHospitalAgent") as agent_cls:
        agent = create_hospital_chat_agent(
            use_llm=True,
            openai_api_key="test-key",
            openai_model="gpt-4.1-mini",
            backend_client=Mock(),
        )

    assert agent is not None
    agent_cls.assert_called_once()

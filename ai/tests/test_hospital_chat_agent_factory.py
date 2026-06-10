from unittest.mock import Mock, patch

from app.agent import create_hospital_chat_agent


def test_create_hospital_chat_agent_returns_none_when_llm_disabled():
    agent = create_hospital_chat_agent(
        use_llm=False,
        openai_api_key=None,
    )

    assert agent is None


def test_create_hospital_chat_agent_builds_agent_when_llm_enabled():
    with patch("app.agent.ChatOpenAI") as chat_openai_cls:
        llm = Mock()
        llm.bind_tools.return_value = Mock()
        chat_openai_cls.return_value = llm
        agent = create_hospital_chat_agent(
            use_llm=True,
            openai_api_key="test-key",
            openai_model="gpt-4.1-mini",
            backend_client=Mock(),
        )

    assert agent is not None
    chat_openai_cls.assert_called_once_with(
        api_key="test-key",
        model="gpt-4.1-mini",
        temperature=0,
    )

import json
from unittest.mock import Mock

import pytest

from app.services.llm_react_step_resolver import LlmReActStepResolver


def test_llm_react_step_resolver_returns_react_agent_step():
    llm_client = Mock()
    llm_client.generate_step.return_value = json.dumps(
        {
            "thought": "병원 목록을 먼저 조회해야 한다.",
            "next_action": "tool_call",
            "tool_name": "get_hospitals",
            "tool_input": {"department_type": "INTERNAL_MEDICINE"},
        }
    )
    resolver = LlmReActStepResolver(llm_client=llm_client)

    step = resolver.next_step(
        user_message="내일 오전 9시에 내과 예약해줘.",
        conversation_context={"messages": []},
        last_tool_result=None,
    )

    assert step.next_action == "tool_call"
    assert step.tool_name == "get_hospitals"
    assert step.tool_input == {"department_type": "INTERNAL_MEDICINE"}


def test_llm_react_step_resolver_raises_when_response_is_not_json():
    llm_client = Mock()
    llm_client.generate_step.return_value = "not-json"
    resolver = LlmReActStepResolver(llm_client=llm_client)

    with pytest.raises(ValueError, match="LLM ReAct step response must be valid JSON"):
        resolver.next_step(
            user_message="내일 오전 9시에 내과 예약해줘.",
            conversation_context={"messages": []},
            last_tool_result=None,
        )


def test_llm_react_step_resolver_normalizes_empty_tool_input_string():
    llm_client = Mock()
    llm_client.generate_step.return_value = json.dumps(
        {
            "thought": "가능한 병원을 먼저 조회한다.",
            "next_action": "tool_call",
            "tool_name": "get_hospitals",
            "tool_input": "",
        }
    )
    resolver = LlmReActStepResolver(llm_client=llm_client)

    step = resolver.next_step(
        user_message="가능한 병원 중에 찾아줘.",
        conversation_context={"messages": []},
        last_tool_result=None,
    )

    assert step.next_action == "tool_call"
    assert step.tool_name == "get_hospitals"
    assert step.tool_input == {}


def test_llm_react_step_resolver_drops_empty_tool_input_for_ask_user():
    llm_client = Mock()
    llm_client.generate_step.return_value = json.dumps(
        {
            "thought": "병원 선택을 먼저 물어본다.",
            "next_action": "ask_user",
            "message": "어느 병원으로 예약할까요?",
            "tool_input": "",
        }
    )
    resolver = LlmReActStepResolver(llm_client=llm_client)

    step = resolver.next_step(
        user_message="병원 예약해줘.",
        conversation_context={"messages": []},
        last_tool_result=None,
    )

    assert step.next_action == "ask_user"
    assert step.message == "어느 병원으로 예약할까요?"
    assert step.tool_input is None

import pytest
from pydantic import ValidationError

from app.models.react_agent import ReActAgentStep


def test_react_agent_step_allows_ask_user_action():
    step = ReActAgentStep(
        thought="아직 시간이 빠져 있다.",
        next_action="ask_user",
        message="원하시는 시간을 알려주세요.",
    )

    assert step.next_action == "ask_user"
    assert step.message == "원하시는 시간을 알려주세요."
    assert step.tool_name is None
    assert step.tool_input is None


def test_react_agent_step_allows_tool_call_action():
    step = ReActAgentStep(
        thought="병원 후보를 먼저 조회해야 한다.",
        next_action="tool_call",
        tool_name="get_hospitals",
        tool_input={"department_type": "INTERNAL_MEDICINE"},
    )

    assert step.next_action == "tool_call"
    assert step.tool_name == "get_hospitals"
    assert step.tool_input == {"department_type": "INTERNAL_MEDICINE"}
    assert step.message is None


def test_react_agent_step_allows_final_answer_action():
    step = ReActAgentStep(
        thought="사용자에게 대안을 제시할 수 있다.",
        next_action="final_answer",
        message="오전 9시는 어렵고 오전 9시 30분이 가능합니다.",
    )

    assert step.next_action == "final_answer"
    assert step.message == "오전 9시는 어렵고 오전 9시 30분이 가능합니다."


def test_react_agent_step_requires_tool_fields_for_tool_call():
    with pytest.raises(ValidationError):
        ReActAgentStep(
            thought="조회가 필요하다.",
            next_action="tool_call",
        )


def test_react_agent_step_requires_message_for_final_answer():
    with pytest.raises(ValidationError):
        ReActAgentStep(
            thought="사용자에게 안내해야 한다.",
            next_action="final_answer",
        )

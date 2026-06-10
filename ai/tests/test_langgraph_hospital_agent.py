from unittest.mock import Mock

from app.models.react_agent import ReActAgentStep
from app.models.react_tool import ReActToolResult
from app.services.langgraph_hospital_agent import LangGraphHospitalAgent


def test_langgraph_hospital_agent_executes_tool_then_returns_final_answer():
    step_resolver = Mock()
    step_resolver.next_step.side_effect = [
        ReActAgentStep(
            thought="병원 후보를 조회한다.",
            next_action="tool_call",
            tool_name="get_hospitals",
            tool_input={"department_type": "INTERNAL_MEDICINE"},
        ),
        ReActAgentStep(
            thought="조회 결과를 사용자에게 안내한다.",
            next_action="final_answer",
            message="서울하나내과가 가능합니다.",
        ),
    ]
    tool_executor = Mock()
    tool_executor.execute.return_value = ReActToolResult(
        tool_name="get_hospitals",
        success=True,
        payload={"data": {"items": [{"hospital_id": 1, "name": "서울하나내과"}]}},
        error=None,
    )
    agent = LangGraphHospitalAgent(
        step_resolver=step_resolver,
        tool_executor=tool_executor,
    )

    result = agent.run_turn(
        conversation_id="conv_test",
        user_message="내과 예약 가능한 병원 찾아줘.",
        conversation_messages=[],
        jsessionid="abc123",
        persisted_state={},
    )

    tool_executor.execute.assert_called_once_with(
        tool_name="get_hospitals",
        tool_input={"department_type": "INTERNAL_MEDICINE"},
        jsessionid="abc123",
    )
    assert result["message"] == "서울하나내과가 가능합니다."
    assert result["action"] == "final_answer"
    assert result["state"]["last_tool_result"]["tool_name"] == "get_hospitals"


def test_langgraph_hospital_agent_returns_ask_user():
    step_resolver = Mock()
    step_resolver.next_step.return_value = ReActAgentStep(
        thought="병원 선택이 필요하다.",
        next_action="ask_user",
        message="어느 병원으로 예약할까요?",
    )
    tool_executor = Mock()
    agent = LangGraphHospitalAgent(
        step_resolver=step_resolver,
        tool_executor=tool_executor,
    )

    result = agent.run_turn(
        conversation_id="conv_test",
        user_message="배가 아파서 예약해줘.",
        conversation_messages=[],
        jsessionid="abc123",
        persisted_state={},
    )

    tool_executor.execute.assert_not_called()
    assert result["message"] == "어느 병원으로 예약할까요?"
    assert result["action"] == "ask_user"

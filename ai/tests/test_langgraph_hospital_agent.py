from unittest.mock import Mock

from langchain_core.messages import AIMessage

from app.agent import LangGraphHospitalAgent


def test_langgraph_hospital_agent_executes_tool_then_returns_final_answer():
    llm = Mock()
    bound_llm = Mock()
    bound_llm.invoke.side_effect = [
        AIMessage(
            content="",
            tool_calls=[
                {
                    "name": "get_hospitals",
                    "args": {"department_type": "DENTAL"},
                    "id": "call_1",
                }
            ],
        ),
        AIMessage(content="미소가득치과가 가능합니다. [FINAL_ANSWER]"),
    ]
    llm.bind_tools.return_value = bound_llm
    backend_client = Mock()
    backend_client.get_hospitals.return_value = {
        "data": {"items": [{"hospital_id": 3, "name": "미소가득치과"}]}
    }
    agent = LangGraphHospitalAgent(
        llm=llm,
        backend_client=backend_client,
    )

    result = agent.run_turn(
        conversation_id="conv_test",
        user_message="이빨이 아픈데 치과 알려줘.",
        conversation_messages=[{"role": "user", "message": "이빨이 아픈데 치과 알려줘."}],
        jsessionid="abc123",
        persisted_state={},
    )

    backend_client.get_hospitals.assert_called_once_with(
        jsessionid="abc123",
        department_type="DENTAL",
    )
    assert result["message"] == "미소가득치과가 가능합니다."
    assert result["action"] == "final_answer"
    assert result["items"] == [{"hospital_id": 3, "name": "미소가득치과"}]


def test_langgraph_hospital_agent_retries_with_valid_department_enum_after_tool_error():
    llm = Mock()
    bound_llm = Mock()
    bound_llm.invoke.side_effect = [
        AIMessage(
            content="",
            tool_calls=[
                {
                    "name": "get_hospitals",
                    "args": {"department_type": "歯科"},
                    "id": "call_1",
                }
            ],
        ),
        AIMessage(
            content="",
            tool_calls=[
                {
                    "name": "get_hospitals",
                    "args": {"department_type": "DENTAL"},
                    "id": "call_2",
                }
            ],
        ),
        AIMessage(content="미소가득치과가 가능합니다. [FINAL_ANSWER]"),
    ]
    llm.bind_tools.return_value = bound_llm
    backend_client = Mock()
    backend_client.get_hospitals.return_value = {
        "data": {"items": [{"hospital_id": 3, "name": "미소가득치과"}]}
    }
    agent = LangGraphHospitalAgent(
        llm=llm,
        backend_client=backend_client,
    )

    agent.run_turn(
        conversation_id="conv_test",
        user_message="歯が痛いです。予約できる歯科はありますか？",
        conversation_messages=[
            {"role": "user", "message": "歯が痛いです。予約できる歯科はありますか？"}
        ],
        jsessionid="abc123",
        persisted_state={},
    )

    backend_client.get_hospitals.assert_called_once_with(
        jsessionid="abc123",
        department_type="DENTAL",
    )


def test_langgraph_hospital_agent_returns_ask_user_when_model_requests_more_input():
    llm = Mock()
    bound_llm = Mock()
    bound_llm.invoke.return_value = AIMessage(
        content="원하시는 시간을 알려주세요. [ASK_USER]"
    )
    llm.bind_tools.return_value = bound_llm
    agent = LangGraphHospitalAgent(
        llm=llm,
        backend_client=Mock(),
    )

    result = agent.run_turn(
        conversation_id="conv_test",
        user_message="치과 예약하고 싶어요.",
        conversation_messages=[{"role": "user", "message": "치과 예약하고 싶어요."}],
        jsessionid="abc123",
        persisted_state={},
    )

    assert result["message"] == "원하시는 시간을 알려주세요."
    assert result["action"] == "ask_user"


def test_langgraph_hospital_agent_uses_full_conversation_history_for_follow_up():
    llm = Mock()
    bound_llm = Mock()
    bound_llm.invoke.return_value = AIMessage(
        content="미소가득치과의 2026-06-13 14:00 확인 결과를 안내드릴게요. [FINAL_ANSWER]"
    )
    llm.bind_tools.return_value = bound_llm
    agent = LangGraphHospitalAgent(
        llm=llm,
        backend_client=Mock(),
    )

    conversation_messages = [
        {"role": "user", "message": "이빨이 아픈데 모레 예약 가능한 병원있나요?"},
        {"role": "assistant", "message": "미소가득치과가 가능합니다."},
        {"role": "user", "message": "14시 예약 할 수 있을까요?"},
    ]
    agent.run_turn(
        conversation_id="conv_test",
        user_message="14시 예약 할 수 있을까요?",
        conversation_messages=conversation_messages,
        jsessionid="abc123",
        persisted_state={},
    )

    messages = bound_llm.invoke.call_args.args[0]
    assert messages[1].content == "이빨이 아픈데 모레 예약 가능한 병원있나요?"
    assert messages[2].content == "미소가득치과가 가능합니다."
    assert messages[3].content == "14시 예약 할 수 있을까요?"

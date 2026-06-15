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


def test_langgraph_hospital_agent_includes_recent_structured_context_in_follow_up():
    llm = Mock()
    bound_llm = Mock()
    bound_llm.invoke.return_value = AIMessage(
        content="후속 예약 변경에 필요한 정보를 확인했습니다. [FINAL_ANSWER]"
    )
    llm.bind_tools.return_value = bound_llm
    agent = LangGraphHospitalAgent(
        llm=llm,
        backend_client=Mock(),
    )

    persisted_state = {
        "response_items": [
            {"reservation_id": 7, "hospital_id": 3, "hospital_name": "미소가득치과"}
        ],
        "recent_context": {
            "latest_reservations": [
                {
                    "reservation_id": 7,
                    "hospital_id": 3,
                    "hospital_name": "미소가득치과",
                    "reserved_at": "2026-06-13T14:00:00",
                }
            ]
        },
    }
    agent.run_turn(
        conversation_id="conv_test",
        user_message="그 예약 15시로 바꿔줘.",
        conversation_messages=[
            {"role": "user", "message": "예약 내역 보여줘."},
            {"role": "assistant", "message": "미소가득치과 예약이 있습니다."},
            {"role": "user", "message": "그 예약 15시로 바꿔줘."},
        ],
        jsessionid="abc123",
        persisted_state=persisted_state,
    )

    messages = bound_llm.invoke.call_args.args[0]
    assert "latest_reservations" in messages[1].content
    assert "reservation_id" in messages[1].content


def test_langgraph_hospital_agent_persists_recent_context_from_tool_results():
    llm = Mock()
    bound_llm = Mock()
    bound_llm.invoke.side_effect = [
        AIMessage(
            content="",
            tool_calls=[
                {
                    "name": "get_reservations",
                    "args": {},
                    "id": "call_1",
                }
            ],
        ),
        AIMessage(content="예약 내역을 확인했습니다. [FINAL_ANSWER]"),
    ]
    llm.bind_tools.return_value = bound_llm
    backend_client = Mock()
    backend_client.get_reservations.return_value = {
        "data": {
            "items": [
                {
                    "reservation_id": 11,
                    "hospital_id": 3,
                    "hospital_name": "미소가득치과",
                    "reserved_at": "2026-06-13T14:00:00",
                }
            ]
        }
    }
    agent = LangGraphHospitalAgent(
        llm=llm,
        backend_client=backend_client,
    )

    result = agent.run_turn(
        conversation_id="conv_test",
        user_message="예약 내역 보여줘.",
        conversation_messages=[{"role": "user", "message": "예약 내역 보여줘."}],
        jsessionid="abc123",
        persisted_state={},
    )

    assert "latest_reservations" in result["state"]["recent_context"]


def test_langgraph_hospital_agent_normalizes_change_action_and_uses_recent_reservation_context():
    llm = Mock()
    bound_llm = Mock()
    bound_llm.invoke.side_effect = [
        AIMessage(
            content="",
            tool_calls=[
                {
                    "name": "update_reservation",
                    "args": {
                        "reservation_id": 11,
                        "action": "change",
                        "reserved_at": "2026-06-13T15:00:00",
                    },
                    "id": "call_1",
                }
            ],
        ),
        AIMessage(content="예약 시간을 변경했습니다. [FINAL_ANSWER]"),
    ]
    llm.bind_tools.return_value = bound_llm
    backend_client = Mock()
    backend_client.update_reservation.return_value = {"data": None}
    agent = LangGraphHospitalAgent(
        llm=llm,
        backend_client=backend_client,
    )

    result = agent.run_turn(
        conversation_id="conv_test",
        user_message="그 예약 15시로 바꿔줘.",
        conversation_messages=[{"role": "user", "message": "그 예약 15시로 바꿔줘."}],
        jsessionid="abc123",
        persisted_state={
            "recent_context": {
                "latest_reservations": [
                    {
                        "reservation_id": 11,
                        "hospital_id": 3,
                        "hospital_name": "미소가득치과",
                        "reserved_at": "2026-06-13T14:00:00",
                        "status": "RESERVED",
                    }
                ],
                "latest_slot_query": {
                    "hospital_id": 3,
                    "date": "2026-06-13",
                },
                "latest_slots": [
                    {"available_at": "2026-06-13T15:00:00"},
                    {"available_at": "2026-06-13T16:00:00"},
                ],
            }
        },
    )

    backend_client.update_reservation.assert_called_once_with(
        jsessionid="abc123",
        reservation_id=11,
        action="CHANGE",
        reserved_at="2026-06-13T15:00:00",
    )
    assert result["message"] == "예약 시간을 변경했습니다."


def test_langgraph_hospital_agent_rejects_change_without_matching_slot_context():
    llm = Mock()
    bound_llm = Mock()
    bound_llm.invoke.side_effect = [
        AIMessage(
            content="",
            tool_calls=[
                {
                    "name": "update_reservation",
                    "args": {
                        "reservation_id": 11,
                        "action": "CHANGE",
                        "reserved_at": "2026-06-13T15:00:00",
                    },
                    "id": "call_1",
                }
            ],
        ),
        AIMessage(content="같은 병원의 해당 날짜 예약 가능 시간을 먼저 확인해야 합니다. [ASK_USER]"),
    ]
    llm.bind_tools.return_value = bound_llm
    backend_client = Mock()
    agent = LangGraphHospitalAgent(
        llm=llm,
        backend_client=backend_client,
    )

    result = agent.run_turn(
        conversation_id="conv_test",
        user_message="그 예약 15시로 바꿔줘.",
        conversation_messages=[{"role": "user", "message": "그 예약 15시로 바꿔줘."}],
        jsessionid="abc123",
        persisted_state={
            "recent_context": {
                "latest_reservations": [
                    {
                        "reservation_id": 11,
                        "hospital_id": 3,
                        "hospital_name": "미소가득치과",
                        "reserved_at": "2026-06-13T14:00:00",
                        "status": "RESERVED",
                    }
                ]
            }
        },
    )

    backend_client.update_reservation.assert_not_called()
    assert result["action"] == "ask_user"


def test_langgraph_hospital_agent_rejects_ambiguous_cancel_when_multiple_active_reservations_exist():
    llm = Mock()
    bound_llm = Mock()
    bound_llm.invoke.side_effect = [
        AIMessage(
            content="",
            tool_calls=[
                {
                    "name": "update_reservation",
                    "args": {
                        "reservation_id": 6,
                        "action": "CANCEL",
                    },
                    "id": "call_1",
                }
            ],
        ),
        AIMessage(content="활성 예약이 여러 건입니다. 취소할 예약 ID를 먼저 알려주세요. [ASK_USER]"),
    ]
    llm.bind_tools.return_value = bound_llm
    backend_client = Mock()
    agent = LangGraphHospitalAgent(
        llm=llm,
        backend_client=backend_client,
    )

    result = agent.run_turn(
        conversation_id="conv_test",
        user_message="예약 취소해줘.",
        conversation_messages=[{"role": "user", "message": "예약 취소해줘."}],
        jsessionid="abc123",
        persisted_state={
            "recent_context": {
                "latest_reservations": [
                    {
                        "reservation_id": 6,
                        "hospital_id": 4,
                        "hospital_name": "인천바른내과",
                        "reserved_at": "2026-06-16T13:30:00",
                        "status": "RESERVED",
                    },
                    {
                        "reservation_id": 5,
                        "hospital_id": 4,
                        "hospital_name": "인천바른내과",
                        "reserved_at": "2026-06-15T10:00:00",
                        "status": "RESERVED",
                    },
                ]
            }
        },
    )

    backend_client.update_reservation.assert_not_called()
    assert result["action"] == "ask_user"


def test_langgraph_hospital_agent_allows_cancel_when_user_explicitly_mentions_reservation_id():
    llm = Mock()
    bound_llm = Mock()
    bound_llm.invoke.side_effect = [
        AIMessage(
            content="",
            tool_calls=[
                {
                    "name": "update_reservation",
                    "args": {
                        "reservation_id": 6,
                        "action": "CANCEL",
                    },
                    "id": "call_1",
                }
            ],
        ),
        AIMessage(content="예약을 취소했습니다. [FINAL_ANSWER]"),
    ]
    llm.bind_tools.return_value = bound_llm
    backend_client = Mock()
    backend_client.update_reservation.return_value = {"data": None}
    agent = LangGraphHospitalAgent(
        llm=llm,
        backend_client=backend_client,
    )

    result = agent.run_turn(
        conversation_id="conv_test",
        user_message="예약 ID 6 취소해줘.",
        conversation_messages=[{"role": "user", "message": "예약 ID 6 취소해줘."}],
        jsessionid="abc123",
        persisted_state={
            "recent_context": {
                "latest_reservations": [
                    {
                        "reservation_id": 6,
                        "hospital_id": 4,
                        "hospital_name": "인천바른내과",
                        "reserved_at": "2026-06-16T13:30:00",
                        "status": "RESERVED",
                    },
                    {
                        "reservation_id": 5,
                        "hospital_id": 4,
                        "hospital_name": "인천바른내과",
                        "reserved_at": "2026-06-15T10:00:00",
                        "status": "RESERVED",
                    },
                ]
            }
        },
    )

    backend_client.update_reservation.assert_called_once_with(
        jsessionid="abc123",
        reservation_id=6,
        action="CANCEL",
        reserved_at=None,
    )
    assert result["action"] == "final_answer"


def test_langgraph_hospital_agent_rejects_create_without_matching_slot_context():
    llm = Mock()
    bound_llm = Mock()
    bound_llm.invoke.side_effect = [
        AIMessage(
            content="",
            tool_calls=[
                {
                    "name": "create_reservation",
                    "args": {
                        "hospital_id": 3,
                        "reserved_at": "2026-06-13T17:00:00",
                    },
                    "id": "call_1",
                }
            ],
        ),
        AIMessage(content="That time is not available. Please choose one of the available slots. [ASK_USER]"),
    ]
    llm.bind_tools.return_value = bound_llm
    backend_client = Mock()
    agent = LangGraphHospitalAgent(
        llm=llm,
        backend_client=backend_client,
    )

    result = agent.run_turn(
        conversation_id="conv_test",
        user_message="Book 5 PM at Miso Dental.",
        conversation_messages=[{"role": "user", "message": "Book 5 PM at Miso Dental."}],
        jsessionid="abc123",
        persisted_state={
            "recent_context": {
                "latest_hospitals": [
                    {
                        "hospital_id": 3,
                        "name": "Miso Dental",
                        "type": "DENTAL",
                    }
                ],
                "latest_slots": [
                    {"available_at": "2026-06-13T15:00:00"},
                    {"available_at": "2026-06-13T16:00:00"},
                ],
                "latest_slot_query": {
                    "hospital_id": 3,
                    "date": "2026-06-13",
                },
            }
        },
        response_language="en",
    )

    backend_client.create_reservation.assert_not_called()
    assert result["action"] == "ask_user"


def test_langgraph_hospital_agent_uses_requested_response_language_in_system_prompt():
    llm = Mock()
    bound_llm = Mock()
    bound_llm.invoke.return_value = AIMessage(
        content="Dentist options are ready. [FINAL_ANSWER]"
    )
    llm.bind_tools.return_value = bound_llm
    agent = LangGraphHospitalAgent(
        llm=llm,
        backend_client=Mock(),
    )

    result = agent.run_turn(
        conversation_id="conv_test",
        user_message="Find a dentist.",
        conversation_messages=[{"role": "user", "message": "Find a dentist."}],
        jsessionid="abc123",
        persisted_state={},
        response_language="en",
    )

    messages = bound_llm.invoke.call_args.args[0]
    assert "Answer in English" in messages[0].content
    assert "always Korean" not in messages[0].content
    assert result["message"] == "Dentist options are ready."

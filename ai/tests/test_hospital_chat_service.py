from unittest.mock import Mock

from app.services.hospital_chat_service import HospitalChatService
from app.services.session_store import SessionStore


def test_send_message_returns_auth_required_without_jsessionid():
    session_store = SessionStore()
    conversation_id = session_store.create()
    service = HospitalChatService(
        session_store=session_store,
        backend_client=Mock(),
        hospital_chat_agent=Mock(),
    )

    response = service.send_message(
        conversation_id=conversation_id,
        message="병원 예약해줘.",
        jsessionid=None,
    )

    assert response.message == "로그인이 필요합니다."
    assert response.data.intent == "AUTH_REQUIRED"
    assert response.data.action_required == "NONE"


def test_send_message_uses_langgraph_agent_and_persists_state():
    session_store = SessionStore()
    conversation_id = session_store.create()
    backend_client = Mock()
    hospital_chat_agent = Mock()
    hospital_chat_agent.run_turn.return_value = {
        "message": "서울하나내과가 가능합니다. 어느 병원으로 예약할까요?",
        "action": "ask_user",
        "items": [{"hospital_id": 1, "name": "서울하나내과"}],
        "state": {
            "last_tool_result": {
                "tool_name": "get_hospitals",
                "success": True,
                "payload": {"data": {"items": [{"hospital_id": 1, "name": "서울하나내과"}]}},
                "error": None,
            },
            "response_items": [{"hospital_id": 1, "name": "서울하나내과"}],
        },
    }
    service = HospitalChatService(
        session_store=session_store,
        backend_client=backend_client,
        hospital_chat_agent=hospital_chat_agent,
    )

    response = service.send_message(
        conversation_id=conversation_id,
        message="배가 아프니까 병원 좀 예약해줘",
        jsessionid="abc123",
    )

    hospital_chat_agent.run_turn.assert_called_once()
    assert response.message == "서울하나내과가 가능합니다. 어느 병원으로 예약할까요?"
    assert response.data.intent == "REACT"
    assert response.data.action_required == "ASK_USER"
    assert response.data.items == [{"hospital_id": 1, "name": "서울하나내과"}]
    assert session_store.get_messages(conversation_id)[-1] == {
        "role": "assistant",
        "message": "서울하나내과가 가능합니다. 어느 병원으로 예약할까요?",
    }
    assert session_store.get_graph_state(conversation_id)["response_items"] == [
        {"hospital_id": 1, "name": "서울하나내과"}
    ]

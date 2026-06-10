import json
from unittest.mock import Mock, patch

from app.clients.openai_intent_client import OpenAiIntentClient
from app.models.react_tool import ReActToolResult


def test_openai_intent_client_uses_chat_openai_for_intent_generation():
    llm = Mock()
    llm.invoke.return_value = Mock(
        content=json.dumps(
            {
                "intent": "CHECK_AVAILABILITY",
                "department": "INTERNAL_MEDICINE",
                "date": "2026-06-11",
                "time": "09:00",
                "hospital_id": None,
                "reservation_id": None,
                "needs_confirmation": False,
                "user_message": "내일 오전 9시에 내과 예약하고 싶어요.",
            }
        )
    )

    client = OpenAiIntentClient(
        api_key="test-key",
        model="gpt-4.1-mini",
        llm=llm,
    )

    result = client.generate_intent("내일 오전 9시에 내과 예약하고 싶어요.")

    assert '"intent": "CHECK_AVAILABILITY"' in result
    llm.invoke.assert_called_once()
    messages = llm.invoke.call_args.args[0]
    assert messages[0].content
    assert messages[1].content == "내일 오전 9시에 내과 예약하고 싶어요."


def test_openai_intent_client_generates_react_step_with_context():
    llm = Mock()
    llm.invoke.return_value = Mock(
        content=json.dumps(
            {
                "thought": "도구 호출 결과를 보고 사용자에게 대안을 제시한다.",
                "next_action": "final_answer",
                "message": "오전 9시는 어렵고 오전 9시 30분이 가능합니다.",
            }
        )
    )

    client = OpenAiIntentClient(
        api_key="test-key",
        model="gpt-4.1-mini",
        llm=llm,
    )

    result = client.generate_step(
        user_message="내일 오전 9시에 내과 예약해줘.",
        conversation_context={"messages": [{"role": "user", "content": "내일 예약해줘"}]},
        last_tool_result={"tool_name": "get_available_slots", "success": True},
    )

    assert '"next_action": "final_answer"' in result
    messages = llm.invoke.call_args.args[0]
    assert messages[1].content == json.dumps(
        {
            "user_message": "내일 오전 9시에 내과 예약해줘.",
            "conversation_context": {
                "messages": [{"role": "user", "content": "내일 예약해줘"}]
            },
            "last_tool_result": {
                "tool_name": "get_available_slots",
                "success": True,
            },
        },
        ensure_ascii=False,
    )


def test_openai_intent_client_builds_chat_openai():
    with patch("app.clients.openai_intent_client.ChatOpenAI") as chat_openai_cls:
        llm = Mock()
        llm.invoke.return_value = Mock(content="{}")
        chat_openai_cls.return_value = llm

        client = OpenAiIntentClient(
            api_key="test-key",
            model="gpt-4.1-mini",
        )

        client.generate_intent("테스트")

        chat_openai_cls.assert_called_once_with(
            api_key="test-key",
            model="gpt-4.1-mini",
            temperature=0,
        )


def test_openai_intent_client_serializes_react_tool_result():
    llm = Mock()
    llm.invoke.return_value = Mock(content="{}")
    client = OpenAiIntentClient(
        api_key="test-key",
        model="gpt-4.1-mini",
        llm=llm,
    )

    client.generate_step(
        user_message="가능한 병원 중에 찾아줘",
        conversation_context={"messages": []},
        last_tool_result=ReActToolResult(
            tool_name="get_hospitals",
            success=True,
            payload={"data": {"items": []}},
            error=None,
        ),
    )

    messages = llm.invoke.call_args.args[0]
    assert messages[1].content == json.dumps(
        {
            "user_message": "가능한 병원 중에 찾아줘",
            "conversation_context": {"messages": []},
            "last_tool_result": {
                "tool_name": "get_hospitals",
                "success": True,
                "payload": {"data": {"items": []}},
                "error": None,
            },
        },
        ensure_ascii=False,
    )

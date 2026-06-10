import json
import logging

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.models.react_tool import ReActToolResult


logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """
당신은 병원 예약 챗봇의 의도 해석기입니다.
반드시 JSON만 반환하세요.
반환 필드:
- intent
- department
- date
- time
- hospital_id
- reservation_id
- needs_confirmation
- user_message
"""

REACT_SYSTEM_PROMPT = """
당신은 병원 예약 ReAct 에이전트의 다음 행동 결정기입니다.
반드시 JSON만 반환하세요.
반환 필드:
- thought
- next_action
- message
- tool_name
- tool_input

규칙:
- next_action은 ask_user, tool_call, final_answer 중 하나입니다.
- tool_call이면 tool_name과 tool_input을 반드시 포함합니다.
- ask_user 또는 final_answer이면 message를 반드시 포함합니다.
- 사용 가능한 tool_name은 get_hospitals, get_available_slots, create_reservation, update_reservation, get_reservations 입니다.
"""


class OpenAiIntentClient:
    def __init__(
        self,
        api_key: str,
        model: str,
        llm=None,
    ) -> None:
        self.api_key = api_key
        self.model = model
        self.llm = llm or ChatOpenAI(
            api_key=self.api_key,
            model=self.model,
            temperature=0,
        )

    def generate_intent(self, message: str) -> str:
        logger.info("Generating intent with ChatOpenAI: message_length=%s", len(message))
        response = self.llm.invoke(
            [
                SystemMessage(content=SYSTEM_PROMPT.strip()),
                HumanMessage(content=message),
            ]
        )
        return response.content

    def generate_step(
        self,
        user_message: str,
        conversation_context: dict,
        last_tool_result,
    ) -> str:
        logger.info(
            "Generating ReAct step with ChatOpenAI: message_length=%s, context_messages=%s, has_tool_result=%s",
            len(user_message),
            len(conversation_context.get("messages", [])),
            last_tool_result is not None,
        )
        serialized_tool_result = self._serialize_tool_result(last_tool_result)
        response = self.llm.invoke(
            [
                SystemMessage(content=REACT_SYSTEM_PROMPT.strip()),
                HumanMessage(
                    content=json.dumps(
                        {
                            "user_message": user_message,
                            "conversation_context": conversation_context,
                            "last_tool_result": serialized_tool_result,
                        },
                        ensure_ascii=False,
                    )
                ),
            ]
        )
        return response.content

    def _serialize_tool_result(self, last_tool_result):
        if isinstance(last_tool_result, ReActToolResult):
            logger.info("Serializing ReActToolResult for LLM context: tool_name=%s", last_tool_result.tool_name)
            return last_tool_result.model_dump()
        return last_tool_result

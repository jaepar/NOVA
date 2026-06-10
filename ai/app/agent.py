import json
import logging
import operator
from typing import Annotated, Any, TypedDict

from langchain_core.messages import AIMessage, AnyMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph

from app.clients.backend_hospital_client import BackendHospitalClient
from app.config import OPENAI_API_KEY, OPENAI_MODEL, USE_LLM_INTENT_RESOLVER
from app.prompts import HOSPITAL_AGENT_SYSTEM_PROMPT


logger = logging.getLogger(__name__)

ALLOWED_DEPARTMENT_TYPES = {
    "DENTAL",
    "INTERNAL_MEDICINE",
    "ORTHOPEDICS",
    "DERMATOLOGY",
    "ENT",
    "OPHTHALMOLOGY",
    "OTHER",
}


class HospitalAgentState(TypedDict, total=False):
    # LangGraph 상태는 대화 히스토리와 이번 턴의 실행 결과만 최소한으로 유지한다.
    messages: Annotated[list[AnyMessage], operator.add]
    jsessionid: str | None
    response_items: list[dict[str, Any]] | None
    step_count: int
    final_message: str | None
    final_action: str | None


class LangGraphHospitalAgent:
    def __init__(self, llm, backend_client: BackendHospitalClient, max_steps: int = 5) -> None:
        self.backend_client = backend_client
        self.max_steps = max_steps
        self.tools = self._build_tools()
        # 모델이 직접 tool_call을 생성하게 해서, 별도 JSON 액션 파서를 두지 않는다.
        self.llm = llm.bind_tools(self.tools)
        self.graph = self._build_graph()

    def run_turn(
        self,
        conversation_id: str,
        user_message: str,
        conversation_messages: list[dict[str, str]],
        jsessionid: str | None,
        persisted_state: dict[str, Any],
    ) -> dict[str, Any]:
        logger.info(
            "ReAct hospital agent turn started: conversation_id=%s, message_length=%s, history_count=%s, persisted_keys=%s",
            conversation_id,
            len(user_message),
            len(conversation_messages),
            sorted(persisted_state.keys()),
        )
        initial_state: HospitalAgentState = {
            "messages": self._to_langchain_messages(conversation_messages),
            "jsessionid": jsessionid,
            "response_items": persisted_state.get("response_items"),
            "step_count": 0,
        }
        result = self.graph.invoke(initial_state)
        logger.info(
            "ReAct hospital agent turn completed: conversation_id=%s, action=%s, item_count=%s",
            conversation_id,
            result.get("final_action", "final_answer"),
            len(result.get("response_items") or []),
        )
        return {
            "message": result.get("final_message", "요청을 처리하지 못했습니다."),
            "action": result.get("final_action", "final_answer"),
            "items": result.get("response_items"),
            "state": {
                "response_items": result.get("response_items"),
            },
        }

    def _build_tools(self):
        @tool
        def get_hospitals(department_type: str | None = None) -> dict:
            """진료과 기준으로 예약 가능한 병원 후보를 조회한다."""

        @tool
        def get_available_slots(hospital_id: int, date: str) -> dict:
            """특정 병원의 날짜별 예약 가능 시간을 조회한다."""

        @tool
        def create_reservation(hospital_id: int, reserved_at: str) -> dict:
            """병원 예약을 생성한다."""

        @tool
        def update_reservation(
            reservation_id: int,
            action: str,
            reserved_at: str | None = None,
        ) -> dict:
            """예약을 변경하거나 취소한다."""

        @tool
        def get_reservations() -> dict:
            """현재 사용자의 예약 목록을 조회한다."""

        return [
            get_hospitals,
            get_available_slots,
            create_reservation,
            update_reservation,
            get_reservations,
        ]

    def _build_graph(self):
        # 가장 단순한 ReAct 루프만 유지한다.
        # 생각 -> 도구 호출 필요 여부 판단 -> 도구 실행 -> 다시 생각 -> 종료
        graph_builder = StateGraph(HospitalAgentState)
        graph_builder.add_node("agent", self._agent_node)
        graph_builder.add_node("execute_tools", self._execute_tools)
        graph_builder.add_node("finish", self._finish)
        graph_builder.add_node("fallback", self._fallback)

        graph_builder.add_edge(START, "agent")
        graph_builder.add_conditional_edges(
            "agent",
            self._route_after_agent,
            {
                "execute_tools": "execute_tools",
                "finish": "finish",
                "fallback": "fallback",
            },
        )
        graph_builder.add_edge("execute_tools", "agent")
        graph_builder.add_edge("finish", END)
        graph_builder.add_edge("fallback", END)
        return graph_builder.compile()

    def _agent_node(self, state: HospitalAgentState) -> HospitalAgentState:
        logger.info(
            "ReAct agent step: step_count=%s, message_count=%s",
            state.get("step_count", 0) + 1,
            len(state.get("messages", [])),
        )
        # 후속 발화가 짧더라도 이전 증상, 날짜, 병원 맥락을 이어받을 수 있도록
        # 매 턴 전체 대화 히스토리를 그대로 모델에 넣는다.
        response = self.llm.invoke(
            [SystemMessage(content=HOSPITAL_AGENT_SYSTEM_PROMPT)] + state.get("messages", [])
        )
        return {
            "messages": [response],
            "step_count": state.get("step_count", 0) + 1,
        }

    def _execute_tools(self, state: HospitalAgentState) -> HospitalAgentState:
        messages = state.get("messages", [])
        last_message = messages[-1]
        response_items = state.get("response_items")
        tool_messages: list[ToolMessage] = []

        if not isinstance(last_message, AIMessage):
            return {}

        for tool_call in last_message.tool_calls:
            tool_name = tool_call["name"]
            tool_input = tool_call.get("args", {})
            logger.info(
                "ReAct tool call: tool_name=%s, input_keys=%s",
                tool_name,
                sorted(tool_input.keys()) if isinstance(tool_input, dict) else [],
            )
            try:
                # 백엔드로 보내기 전에 여기서 도구 입력값을 검증한다.
                payload = self._call_backend_tool(
                    tool_name=tool_name,
                    tool_input=tool_input if isinstance(tool_input, dict) else {},
                    jsessionid=state["jsessionid"],
                )
                if isinstance(payload, dict):
                    response_items = self._extract_response_items(tool_name, payload, response_items)
                tool_messages.append(
                    ToolMessage(
                        content=json.dumps(payload, ensure_ascii=False, default=str),
                        tool_call_id=tool_call["id"],
                    )
                )
            except Exception as error:
                logger.warning(
                    "ReAct tool failed: tool_name=%s, error=%s",
                    tool_name,
                    error,
                )
                tool_messages.append(
                    ToolMessage(
                        content=f"Tool execution failed: {error}",
                        tool_call_id=tool_call["id"],
                    )
                )

        return {
            "messages": tool_messages,
            "response_items": response_items,
        }

    def _finish(self, state: HospitalAgentState) -> HospitalAgentState:
        messages = state.get("messages", [])
        last_message = messages[-1] if messages else None
        content = last_message.content if isinstance(last_message, AIMessage) else ""
        final_action = self._extract_action(content)
        final_message = self._strip_action_tag(content) or "요청을 처리하지 못했습니다."
        logger.info(
            "ReAct turn finished: final_action=%s, final_message_length=%s",
            final_action,
            len(final_message),
        )
        return {
            "final_action": final_action,
            "final_message": final_message,
        }

    def _fallback(self, state: HospitalAgentState) -> HospitalAgentState:
        logger.warning(
            "ReAct fallback reached: step_count=%s",
            state.get("step_count"),
        )
        return {
            "final_action": "final_answer",
            "final_message": "요청을 처리하지 못했습니다.",
        }

    def _route_after_agent(self, state: HospitalAgentState) -> str:
        messages = state.get("messages", [])
        if not messages:
            return "fallback"
        if state.get("step_count", 0) > self.max_steps:
            return "fallback"

        last_message = messages[-1]
        # 마지막 응답에 tool_call이 있으면 실행 단계로, 아니면 최종 응답으로 종료한다.
        if isinstance(last_message, AIMessage) and last_message.tool_calls:
            return "execute_tools"
        if isinstance(last_message, AIMessage):
            return "finish"
        return "fallback"

    def _call_backend_tool(
        self,
        tool_name: str,
        tool_input: dict[str, Any],
        jsessionid: str | None,
    ) -> dict:
        if jsessionid is None:
            raise ValueError("JSESSIONID is required")

        logger.info("Dispatching backend hospital tool: tool_name=%s", tool_name)
        if tool_name == "get_hospitals":
            department_type = self._validate_department_type(tool_input.get("department_type"))
            return self.backend_client.get_hospitals(
                jsessionid=jsessionid,
                department_type=department_type,
            )
        if tool_name == "get_available_slots":
            return self.backend_client.get_available_slots(
                jsessionid=jsessionid,
                hospital_id=tool_input["hospital_id"],
                date=tool_input["date"],
            )
        if tool_name == "create_reservation":
            return self.backend_client.create_reservation(
                jsessionid=jsessionid,
                hospital_id=tool_input["hospital_id"],
                reserved_at=tool_input["reserved_at"],
            )
        if tool_name == "update_reservation":
            return self.backend_client.update_reservation(
                jsessionid=jsessionid,
                reservation_id=tool_input["reservation_id"],
                action=tool_input["action"],
                reserved_at=tool_input.get("reserved_at"),
            )
        if tool_name == "get_reservations":
            return self.backend_client.get_reservations(jsessionid=jsessionid)
        raise ValueError(f"Unknown tool: {tool_name}")

    def _validate_department_type(self, department_type: Any) -> str | None:
        if department_type is None:
            return None
        if not isinstance(department_type, str):
            raise ValueError(
                "department_type must be one of "
                + ", ".join(sorted(ALLOWED_DEPARTMENT_TYPES))
            )

        normalized = department_type.strip()
        if not normalized:
            return None
        # 언어별 의미 해석은 모델이 맡고, 코드는 최종 값이 백엔드 enum 집합 안에
        # 들어오는지만 검증한다.
        if normalized not in ALLOWED_DEPARTMENT_TYPES:
            raise ValueError(
                f"department_type '{department_type}' is invalid. "
                f"Use one of: {', '.join(sorted(ALLOWED_DEPARTMENT_TYPES))}"
            )
        return normalized

    def _extract_response_items(
        self,
        tool_name: str,
        payload: dict[str, Any],
        fallback_items: list[dict[str, Any]] | None,
    ) -> list[dict[str, Any]] | None:
        data = payload.get("data")
        if not isinstance(data, dict):
            return fallback_items
        items = data.get("items")
        if not isinstance(items, list):
            return fallback_items

        if tool_name == "get_available_slots":
            # 슬롯 응답은 문자열 또는 객체 형태가 섞일 수 있어 한 가지 형태로 맞춘다.
            normalized_items: list[dict[str, Any]] = []
            for item in items:
                if isinstance(item, dict):
                    normalized_items.append(item)
                else:
                    normalized_items.append({"available_at": item})
            return normalized_items

        if all(isinstance(item, dict) for item in items):
            return items
        return fallback_items

    def _extract_action(self, content: str) -> str:
        if "[ASK_USER]" in content:
            return "ask_user"
        return "final_answer"

    def _strip_action_tag(self, content: str) -> str:
        return content.replace("[ASK_USER]", "").replace("[FINAL_ANSWER]", "").strip()

    def _to_langchain_messages(
        self,
        conversation_messages: list[dict[str, str]],
    ) -> list[AnyMessage]:
        # SessionStore에는 직렬화하기 쉬운 dict 형태로 저장해두고,
        # 에이전트 내부에서만 LangChain 메시지 객체로 변환해서 사용한다.
        messages: list[AnyMessage] = []
        for message in conversation_messages:
            role = message.get("role")
            text = message.get("message", "")
            if role == "user":
                messages.append(HumanMessage(content=text))
            elif role == "assistant":
                messages.append(AIMessage(content=text))
        logger.info(
            "Converted session messages to LangChain messages: source_count=%s, converted_count=%s",
            len(conversation_messages),
            len(messages),
        )
        return messages


def create_hospital_chat_agent(
    use_llm: bool | None = None,
    openai_api_key: str | None = None,
    openai_model: str | None = None,
    backend_client: BackendHospitalClient | None = None,
):
    effective_use_llm = USE_LLM_INTENT_RESOLVER if use_llm is None else use_llm
    effective_api_key = OPENAI_API_KEY if openai_api_key is None else openai_api_key
    effective_model = OPENAI_MODEL if openai_model is None else openai_model

    if not effective_use_llm or not effective_api_key or backend_client is None:
        logger.warning(
            "Hospital chat agent was not created: use_llm=%s, has_api_key=%s, has_backend_client=%s",
            effective_use_llm,
            effective_api_key is not None,
            backend_client is not None,
        )
        return None

    llm = ChatOpenAI(
        api_key=effective_api_key,
        model=effective_model,
        temperature=0,
    )
    logger.info("Hospital chat ReAct agent created: model=%s, max_steps=%s", effective_model, 5)
    return LangGraphHospitalAgent(
        llm=llm,
        backend_client=backend_client,
    )

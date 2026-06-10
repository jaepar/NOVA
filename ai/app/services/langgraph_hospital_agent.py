import logging
from typing import Any, TypedDict

from langgraph.graph import END, START, StateGraph

from app.models.react_tool import ReActToolResult


logger = logging.getLogger(__name__)


class HospitalAgentState(TypedDict, total=False):
    conversation_id: str
    user_message: str
    conversation_messages: list[dict[str, str]]
    jsessionid: str | None
    last_tool_result: dict[str, Any] | None
    response_items: list[dict[str, Any]] | None
    step_count: int
    next_action: str
    message: str | None
    tool_name: str | None
    tool_input: dict[str, Any] | None
    final_message: str | None
    final_action: str | None


class LangGraphHospitalAgent:
    def __init__(self, step_resolver, tool_executor, max_steps: int = 5) -> None:
        self.step_resolver = step_resolver
        self.tool_executor = tool_executor
        self.max_steps = max_steps
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
            "LangGraph turn started: conversation_id=%s, message_length=%s, persisted_keys=%s",
            conversation_id,
            len(user_message),
            sorted(persisted_state.keys()),
        )
        initial_state: HospitalAgentState = {
            "conversation_id": conversation_id,
            "user_message": user_message,
            "conversation_messages": conversation_messages,
            "jsessionid": jsessionid,
            "last_tool_result": persisted_state.get("last_tool_result"),
            "response_items": persisted_state.get("response_items"),
            "step_count": 0,
        }
        result = self.graph.invoke(initial_state)
        return {
            "message": result.get("final_message", "요청을 처리하지 못했습니다."),
            "action": result.get("final_action", "final_answer"),
            "items": result.get("response_items"),
            "state": {
                "last_tool_result": result.get("last_tool_result"),
                "response_items": result.get("response_items"),
            },
        }

    def _build_graph(self):
        graph_builder = StateGraph(HospitalAgentState)
        graph_builder.add_node("plan_step", self._plan_step)
        graph_builder.add_node("execute_tool", self._execute_tool)
        graph_builder.add_node("finish", self._finish)
        graph_builder.add_node("fallback", self._fallback)

        graph_builder.add_edge(START, "plan_step")
        graph_builder.add_conditional_edges(
            "plan_step",
            self._route_after_plan,
            {
                "execute_tool": "execute_tool",
                "finish": "finish",
                "fallback": "fallback",
            },
        )
        graph_builder.add_edge("execute_tool", "plan_step")
        graph_builder.add_edge("finish", END)
        graph_builder.add_edge("fallback", END)
        return graph_builder.compile()

    def _plan_step(self, state: HospitalAgentState) -> HospitalAgentState:
        step = self.step_resolver.next_step(
            user_message=state["user_message"],
            conversation_context={"messages": state["conversation_messages"]},
            last_tool_result=self._deserialize_tool_result(state.get("last_tool_result")),
        )
        logger.info(
            "LangGraph step resolved: conversation_id=%s, step_count=%s, next_action=%s, tool_name=%s",
            state["conversation_id"],
            state.get("step_count", 0) + 1,
            step.next_action,
            step.tool_name,
        )
        return {
            "step_count": state.get("step_count", 0) + 1,
            "next_action": step.next_action,
            "message": step.message,
            "tool_name": step.tool_name,
            "tool_input": step.tool_input,
        }

    def _execute_tool(self, state: HospitalAgentState) -> HospitalAgentState:
        tool_result = self.tool_executor.execute(
            tool_name=state["tool_name"],
            tool_input=state.get("tool_input") or {},
            jsessionid=state["jsessionid"],
        )
        payload = tool_result.payload or {}
        response_items = None
        if isinstance(payload, dict):
            response_items = payload.get("data", {}).get("items")
        logger.info(
            "LangGraph tool executed: conversation_id=%s, tool_name=%s, success=%s",
            state["conversation_id"],
            tool_result.tool_name,
            tool_result.success,
        )
        return {
            "last_tool_result": tool_result.model_dump(),
            "response_items": response_items,
        }

    def _finish(self, state: HospitalAgentState) -> HospitalAgentState:
        final_action = (
            "ask_user" if state.get("next_action") == "ask_user" else "final_answer"
        )
        logger.info(
            "LangGraph turn finished: conversation_id=%s, final_action=%s",
            state["conversation_id"],
            final_action,
        )
        return {
            "final_action": final_action,
            "final_message": state.get("message") or "요청을 처리하지 못했습니다.",
        }

    def _fallback(self, state: HospitalAgentState) -> HospitalAgentState:
        logger.warning(
            "LangGraph fallback reached: conversation_id=%s, step_count=%s, next_action=%s",
            state["conversation_id"],
            state.get("step_count"),
            state.get("next_action"),
        )
        return {
            "final_action": "final_answer",
            "final_message": "요청을 처리하지 못했습니다.",
        }

    def _route_after_plan(self, state: HospitalAgentState) -> str:
        if state.get("step_count", 0) > self.max_steps:
            return "fallback"
        if state.get("next_action") == "tool_call":
            return "execute_tool"
        if state.get("next_action") in {"ask_user", "final_answer"}:
            return "finish"
        return "fallback"

    def _deserialize_tool_result(self, last_tool_result: dict[str, Any] | None):
        if last_tool_result is None:
            return None
        return ReActToolResult.model_validate(last_tool_result)

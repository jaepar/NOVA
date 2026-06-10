import json
import logging

from app.models.react_agent import ReActAgentStep


logger = logging.getLogger(__name__)


class LlmReActStepResolver:
    def __init__(self, llm_client) -> None:
        self.llm_client = llm_client

    def next_step(
        self,
        user_message: str,
        conversation_context: dict,
        last_tool_result,
    ) -> ReActAgentStep:
        logger.info(
            "Resolving ReAct step: message_length=%s, context_messages=%s, has_tool_result=%s",
            len(user_message),
            len(conversation_context.get("messages", [])),
            last_tool_result is not None,
        )
        raw = self.llm_client.generate_step(
            user_message=user_message,
            conversation_context=conversation_context,
            last_tool_result=last_tool_result,
        )
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError as error:
            logger.warning("LLM returned invalid JSON for ReAct step")
            raise ValueError("LLM ReAct step response must be valid JSON") from error

        payload = self._normalize_payload(payload)
        step = ReActAgentStep.model_validate(payload)
        logger.info(
            "ReAct step validated: next_action=%s, tool_name=%s",
            step.next_action,
            step.tool_name,
        )
        return step

    def _normalize_payload(self, payload: dict) -> dict:
        tool_input = payload.get("tool_input")
        if tool_input == "":
            if payload.get("next_action") == "tool_call":
                logger.warning("Empty tool_input string detected and normalized to empty dict")
                payload["tool_input"] = {}
            else:
                logger.warning("Empty tool_input string detected and removed for non-tool action")
                payload["tool_input"] = None
            return payload

        if payload.get("next_action") != "tool_call":
            return payload

        if isinstance(tool_input, str):
            try:
                parsed_tool_input = json.loads(tool_input)
            except json.JSONDecodeError:
                logger.warning("tool_input string was not valid JSON")
                return payload

            if isinstance(parsed_tool_input, dict):
                logger.info("tool_input JSON string normalized to dict")
                payload["tool_input"] = parsed_tool_input

        return payload

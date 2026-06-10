from typing import Any, Literal

from pydantic import BaseModel, model_validator


class ReActAgentStep(BaseModel):
    thought: str
    next_action: Literal["ask_user", "tool_call", "final_answer"]
    message: str | None = None
    tool_name: str | None = None
    tool_input: dict[str, Any] | None = None

    @model_validator(mode="after")
    def validate_shape(self):
        if self.next_action == "tool_call":
            if self.tool_name is None or self.tool_input is None:
                raise ValueError("tool_call requires tool_name and tool_input")

        if self.next_action in {"ask_user", "final_answer"}:
            if self.message is None:
                raise ValueError(f"{self.next_action} requires message")

        return self

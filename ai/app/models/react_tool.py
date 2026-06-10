from typing import Any

from pydantic import BaseModel


class ReActToolResult(BaseModel):
    tool_name: str
    success: bool
    payload: dict[str, Any] | None = None
    error: str | None = None

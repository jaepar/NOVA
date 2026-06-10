from typing import Any

from pydantic import BaseModel


class StartSessionRequest(BaseModel):
    pass


class ChatMessageRequest(BaseModel):
    message: str


class ChatData(BaseModel):
    intent: str
    action_required: str
    hospital_id: int | None = None
    reservation_id: int | None = None
    requested_at: str | None = None
    confirmed_at: str | None = None
    suggested_slots: list[str] | None = None
    reservation_status: str | None = None
    items: list[dict[str, Any]] | None = None


class ChatResponse(BaseModel):
    conversation_id: str
    message: str
    data: ChatData | dict[str, Any] | None

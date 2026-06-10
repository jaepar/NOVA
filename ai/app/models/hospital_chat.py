from typing import Any

from pydantic import BaseModel


class StartSessionRequest(BaseModel):
    # 세션 시작은 별도 입력값이 없어서 빈 바디만 받는다.
    pass


class ChatMessageRequest(BaseModel):
    message: str


class ChatData(BaseModel):
    # 프론트가 대화 결과를 후속 행동으로 연결할 수 있도록 최소 메타데이터를 함께 보낸다.
    intent: str
    action_required: str
    hospital_id: int | None = None
    reservation_id: int | None = None
    requested_at: str | None = None
    confirmed_at: str | None = None
    suggested_slots: list[str] | None = None
    reservation_status: str | None = None
    items: list[dict[str, Any]] | None = None


class ChatPayload(BaseModel):
    # 공통 응답의 data 영역에 실제 병원 상담 결과를 담는다.
    conversation_id: str
    message: str
    data: ChatData | dict[str, Any] | None

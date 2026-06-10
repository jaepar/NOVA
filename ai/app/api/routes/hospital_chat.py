from fastapi import APIRouter, HTTPException, Request

from app.models.hospital_chat import (
    ChatData,
    ChatMessageRequest,
    ChatResponse,
    StartSessionRequest,
)
from app.services.hospital_chat_service import HospitalChatService


router = APIRouter(prefix="/hospital-chat", tags=["hospital-chat"])
service = HospitalChatService()


@router.post("/sessions", response_model=ChatResponse)
def start_session(_: StartSessionRequest) -> ChatResponse:
    return service.start_session()


@router.post("/sessions/{conversation_id}/messages", response_model=ChatResponse)
def send_message(
    conversation_id: str,
    request: ChatMessageRequest,
    http_request: Request,
) -> ChatResponse:
    try:
        return service.send_message(
            conversation_id,
            request.message,
            http_request.cookies.get("JSESSIONID"),
        )
    except KeyError as error:
        raise HTTPException(status_code=404, detail="conversation not found") from error


@router.delete("/sessions/{conversation_id}", response_model=ChatResponse)
def end_session(conversation_id: str) -> ChatResponse:
    return service.end_session(conversation_id)

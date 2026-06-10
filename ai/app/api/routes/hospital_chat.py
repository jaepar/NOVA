from fastapi import APIRouter, HTTPException, Request

from app.models.common_response import ApiResponse, ok_response
from app.models.hospital_chat import (
    ChatMessageRequest,
    ChatPayload,
    StartSessionRequest,
)
from app.services.hospital_chat_service import HospitalChatService


router = APIRouter(prefix="/chat", tags=["chat"])
# 라우트 계층은 HTTP 요청을 서비스 호출로 연결하는 얇은 진입점만 담당한다.
service = HospitalChatService()


@router.post("", response_model=ApiResponse[ChatPayload])
def start_session(_: StartSessionRequest) -> ApiResponse[ChatPayload]:
    payload = service.start_session()
    return ok_response(payload.message, payload)


@router.post("/{conversation_id}", response_model=ApiResponse[ChatPayload])
def send_message(
    conversation_id: str,
    request: ChatMessageRequest,
    http_request: Request,
) -> ApiResponse[ChatPayload]:
    try:
        # 로그인 세션은 쿠키에서 꺼내고, 대화 세션은 path parameter로 받는다.
        payload = service.send_message(
            conversation_id,
            request.message,
            http_request.cookies.get("JSESSIONID"),
        )
        return ok_response(payload.message, payload)
    except KeyError as error:
        # 없는 conversation_id로 들어오면 서비스 예외를 404로 변환한다.
        raise HTTPException(status_code=404, detail="대화 세션을 찾을 수 없습니다.") from error


@router.delete("/{conversation_id}", response_model=ApiResponse[ChatPayload])
def end_session(conversation_id: str) -> ApiResponse[ChatPayload]:
    payload = service.end_session(conversation_id)
    return ok_response(payload.message, payload)

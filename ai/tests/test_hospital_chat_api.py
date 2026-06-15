from fastapi.testclient import TestClient

from app.main import app
from app.api.routes import hospital_chat as hospital_chat_route
from app.models.hospital_chat import ChatData, ChatPayload


client = TestClient(app)


def test_health_check():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "UP"}


def test_start_session():
    response = client.post("/chat", json={})

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["message"] == "병원 예약 상담을 시작합니다."
    assert body["data"]["conversation_id"]
    assert body["data"]["message"] == "병원 예약 상담을 시작합니다."
    assert body["data"]["data"] is None
    assert body["error"] is None


def test_send_message():
    start = client.post("/chat", json={})
    conversation_id = start.json()["data"]["conversation_id"]
    hospital_chat_route.service.hospital_chat_agent = None

    response = client.post(
        f"/chat/{conversation_id}",
        json={"message": "내일 오전에 내과 예약하고 싶어요."},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["message"] == "병원 예약 상담 구성이 완료되지 않았습니다."
    assert body["data"]["conversation_id"] == conversation_id
    assert body["data"]["message"] == "병원 예약 상담 구성이 완료되지 않았습니다."
    assert body["data"]["data"]["intent"] == "FAIL"
    assert body["data"]["data"]["action_required"] == "NONE"


def test_end_session():
    start = client.post("/chat", json={})
    conversation_id = start.json()["data"]["conversation_id"]

    response = client.delete(f"/chat/{conversation_id}")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["message"] == "병원 예약 대화를 종료했습니다."
    assert body["data"]["conversation_id"] == conversation_id
    assert body["data"]["message"] == "병원 예약 대화를 종료했습니다."
    assert body["data"]["data"] is None


def test_send_message_returns_common_error_response_for_missing_conversation():
    response = client.post(
        "/chat/conv_missing",
        json={"message": "테스트"},
    )

    assert response.status_code == 404
    body = response.json()
    assert body["success"] is False
    assert body["message"] == "대화 세션을 찾을 수 없습니다."
    assert body["data"] is None
    assert body["error"]["code"] == "HTTP_404"
    assert body["error"]["detail"] == "대화 세션을 찾을 수 없습니다."


def test_send_message_passes_language_cookie_to_service():
    original_service = hospital_chat_route.service

    class StubService:
        def __init__(self) -> None:
            self.calls = []

        def send_message(
            self,
            conversation_id: str,
            message: str,
            jsessionid: str | None = None,
            response_language: str | None = None,
        ) -> ChatPayload:
            self.calls.append(
                {
                    "conversation_id": conversation_id,
                    "message": message,
                    "jsessionid": jsessionid,
                    "response_language": response_language,
                }
            )
            return ChatPayload(
                conversation_id=conversation_id,
                message="Hello, how can I help with your hospital reservation?",
                data=ChatData(intent="REACT", action_required="ASK_USER"),
            )

    stub_service = StubService()
    hospital_chat_route.service = stub_service

    try:
        response = client.post(
            "/chat/conv_language",
            json={"message": "Book me a dentist appointment."},
            headers={
                "cookie": "JSESSIONID=session_123; NOVA_LANGUAGE=en",
            },
        )
    finally:
        hospital_chat_route.service = original_service

    assert response.status_code == 200
    assert stub_service.calls == [
        {
            "conversation_id": "conv_language",
            "message": "Book me a dentist appointment.",
            "jsessionid": "session_123",
            "response_language": "en",
        }
    ]

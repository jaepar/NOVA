from fastapi.testclient import TestClient

from app.main import app
from app.api.routes import hospital_chat as hospital_chat_route


client = TestClient(app)


def test_health_check():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "UP"}


def test_deployed_frontend_origin_can_preflight_chat():
    response = client.options(
        "/chat",
        headers={
            "Origin": "https://nova-bank.site",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://nova-bank.site"
    assert response.headers["access-control-allow-credentials"] == "true"


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

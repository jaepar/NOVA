from fastapi.testclient import TestClient

from app.main import app
from app.api.routes import hospital_chat as hospital_chat_route


client = TestClient(app)


def test_start_session():
    response = client.post("/hospital-chat/sessions", json={})

    assert response.status_code == 200
    body = response.json()
    assert body["conversation_id"]
    assert body["message"] == "병원 예약 상담을 시작합니다."
    assert body["data"] is None


def test_send_message():
    start = client.post("/hospital-chat/sessions", json={})
    conversation_id = start.json()["conversation_id"]
    hospital_chat_route.service.hospital_chat_agent = None

    response = client.post(
        f"/hospital-chat/sessions/{conversation_id}/messages",
        json={"message": "내일 오전에 내과 예약하고 싶어요."},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["conversation_id"] == conversation_id
    assert body["message"] == "병원 예약 상담 구성이 완료되지 않았습니다."
    assert body["data"]["intent"] == "FAIL"
    assert body["data"]["action_required"] == "NONE"


def test_end_session():
    start = client.post("/hospital-chat/sessions", json={})
    conversation_id = start.json()["conversation_id"]

    response = client.delete(f"/hospital-chat/sessions/{conversation_id}")

    assert response.status_code == 200
    body = response.json()
    assert body["conversation_id"] == conversation_id
    assert body["message"] == "병원 예약 대화를 종료했습니다."
    assert body["data"] is None

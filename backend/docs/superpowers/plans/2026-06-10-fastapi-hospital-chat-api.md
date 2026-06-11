# FastAPI 병원 예약 챗봇 API 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `ai` 폴더에 병원 예약 챗봇용 FastAPI 서버를 생성하고 세션 시작, 메시지 처리, 세션 종료 API의 최소 동작을 구현한다.

**Architecture:** FastAPI 앱은 `hospital-chat` 라우터를 통해 세션 시작/메시지 처리/세션 종료를 제공하고, 초기 단계에서는 메모리 기반 세션 저장소와 고정 응답 오케스트레이터를 사용한다. 이후 backend API 연동은 분리된 클라이언트 계층으로 확장할 수 있게 파일 경계를 나눈다.

**Tech Stack:** Python 3.11, FastAPI, Pydantic, pytest, TestClient

---

## 파일 구조

- 생성: `../ai/requirements.txt`
- 생성: `../ai/app/__init__.py`
- 생성: `../ai/app/main.py`
- 생성: `../ai/app/api/__init__.py`
- 생성: `../ai/app/api/routes/__init__.py`
- 생성: `../ai/app/api/routes/hospital_chat.py`
- 생성: `../ai/app/models/__init__.py`
- 생성: `../ai/app/models/hospital_chat.py`
- 생성: `../ai/app/services/__init__.py`
- 생성: `../ai/app/services/session_store.py`
- 생성: `../ai/app/services/hospital_chat_service.py`
- 생성: `../ai/tests/test_hospital_chat_api.py`

### Task 1: API 계약 RED 고정

**Files:**
- Create: `../ai/tests/test_hospital_chat_api.py`

- [ ] **Step 1: 실패하는 API 테스트 작성**

```python
from fastapi.testclient import TestClient

from app.main import app


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

    response = client.post(
        f"/hospital-chat/sessions/{conversation_id}/messages",
        json={"message": "내일 오전에 내과 예약하고 싶어요."},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["conversation_id"] == conversation_id
    assert body["message"] == "원하시는 시간을 알려주세요."
    assert body["data"]["intent"] == "CLARIFY"
    assert body["data"]["action_required"] == "ASK_TIME"


def test_end_session():
    start = client.post("/hospital-chat/sessions", json={})
    conversation_id = start.json()["conversation_id"]

    response = client.delete(f"/hospital-chat/sessions/{conversation_id}")

    assert response.status_code == 200
    body = response.json()
    assert body["conversation_id"] == conversation_id
    assert body["message"] == "병원 예약 대화를 종료했습니다."
    assert body["data"] is None
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pytest ../ai/tests/test_hospital_chat_api.py -q`

Expected: FAIL with missing `app.main` or missing routes.

### Task 2: FastAPI 최소 구현

**Files:**
- Create: `../ai/requirements.txt`
- Create: `../ai/app/main.py`
- Create: `../ai/app/api/routes/hospital_chat.py`
- Create: `../ai/app/models/hospital_chat.py`
- Create: `../ai/app/services/session_store.py`
- Create: `../ai/app/services/hospital_chat_service.py`

- [ ] **Step 1: 최소 앱 및 라우터 구현**

```python
from fastapi import FastAPI

from app.api.routes.hospital_chat import router as hospital_chat_router


app = FastAPI()
app.include_router(hospital_chat_router)
```

- [ ] **Step 2: 세션/메시지/종료 최소 서비스 구현**

```python
import uuid


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, dict] = {}

    def create(self) -> str:
        conversation_id = f"conv_{uuid.uuid4().hex[:12]}"
        self._sessions[conversation_id] = {"messages": []}
        return conversation_id

    def exists(self, conversation_id: str) -> bool:
        return conversation_id in self._sessions

    def append_message(self, conversation_id: str, role: str, message: str) -> None:
        self._sessions[conversation_id]["messages"].append({"role": role, "message": message})

    def delete(self, conversation_id: str) -> None:
        self._sessions.pop(conversation_id, None)
```

- [ ] **Step 3: 테스트 통과 확인**

Run: `pytest ../ai/tests/test_hospital_chat_api.py -q`

Expected: PASS

### Task 3: 기본 실행 환경 정리

**Files:**
- Create: `../ai/app/__init__.py`
- Create: `../ai/app/api/__init__.py`
- Create: `../ai/app/api/routes/__init__.py`
- Create: `../ai/app/models/__init__.py`
- Create: `../ai/app/services/__init__.py`

- [ ] **Step 1: 패키지 초기화 파일 추가**

```python
# package marker
```

- [ ] **Step 2: 의존성 파일 추가**

```text
fastapi==0.115.0
uvicorn==0.30.6
pytest==9.0.3
httpx==0.27.2
```

- [ ] **Step 3: 최종 검증**

Run: `pytest ../ai/tests/test_hospital_chat_api.py -q`

Expected: PASS

## Self-Review

- 세션 시작, 메시지 처리, 세션 종료 3개 API가 모두 계획에 포함돼 있다.
- 실제 파일 경로와 테스트 명령을 명시했다.
- 초기 구현은 메모리 세션 저장과 고정 응답으로 제한해 과도한 범위 확장을 피한다.

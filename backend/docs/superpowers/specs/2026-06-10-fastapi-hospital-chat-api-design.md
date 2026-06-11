# FastAPI 병원 예약 챗봇 호출 API 설계

## 목표

프론트가 병원 예약 챗봇과 대화할 수 있도록 FastAPI가 제공할 세션 기반 챗 API 계약을 정의한다.

## 전제

- 외부 호출 주체는 프론트이며, 프론트는 FastAPI 챗 API를 호출한다.
- FastAPI는 병원 예약 업무 처리를 위해 Spring backend의 병원 API를 호출한다.
- 대화 문맥은 채팅방에 머무는 동안만 유지한다.
- 사용자가 채팅방을 나가면 세션은 종료된다.

## 범위

- 포함
  - 세션 생성 API
  - 후속 메시지 처리 API
  - 세션 종료 API
  - 공통 응답 구조
  - FastAPI 내부 intent 분류 기준
  - backend API 호출 흐름
- 제외
  - FastAPI 내부 모델 선택
  - Redis 구현 상세
  - 프론트 UI 계약
  - Spring backend 추가 개발

## 설계 선택

### 선택안

FastAPI는 세션 기반 대화 API 3개를 제공하고, 대화 중 병원 조회/슬롯 조회/예약 생성/예약 변경/취소/예약 내역 조회를 backend API 조합으로 수행한다.

이 방식을 선택한 이유:

- 챗 대화 책임과 예약 업무 책임을 분리할 수 있다
- FastAPI는 문맥 유지와 자연어 처리에 집중할 수 있다
- Spring backend는 이미 구현된 예약 업무 API를 재사용할 수 있다
- 채팅방 단위 임시 세션이라는 요구와 잘 맞는다

### 비교한 대안

1. FastAPI가 무상태로 매 요청 전체 문맥을 다시 받는 방식
   - 문맥 전달 비용이 커지고 프론트 책임이 과도해진다
2. Spring backend에 단일 에이전트 API를 추가하는 방식
   - 오케스트레이션이 backend로 이동해 현재 범위가 커진다
3. FastAPI 세션 API + backend 업무 API 조합
   - 현재 선택안

## API 구조

### 1. 세션 생성

- Method: `POST`
- Path: `/hospital-chat/sessions`

요청 필드:

- 없음

응답 필드:

- `conversation_id`
  - 생성된 채팅 세션 식별자
- `message`
  - 초기 안내 문구
- `data`
  - 없음

요청 예시:

```json
{}
```

응답 예시:

```json
{
  "conversation_id": "conv_123",
  "message": "병원 예약 상담을 시작합니다.",
  "data": null
}
```

### 2. 메시지 처리

- Method: `POST`
- Path: `/hospital-chat/sessions/{conversation_id}/messages`

요청 필드:

- `message`
  - 사용자 입력 문장

응답 필드:

- `conversation_id`
  - 현재 채팅 세션 식별자
- `message`
  - 사용자에게 바로 보여줄 챗봇 응답 문장
- `data.intent`
  - FastAPI가 해석한 현재 의도
- `data.action_required`
  - 다음 액션 또는 추가 입력 필요 여부
- `data.hospital_id`
  - 특정 병원 확정 시 반환 가능
- `data.reservation_id`
  - 기존 예약 변경/취소 대상일 때 반환 가능
- `data.requested_at`
  - 사용자가 원한 예약 일시
- `data.confirmed_at`
  - 실제 확정된 예약 일시
- `data.suggested_slots`
  - 근접 대안 시간 목록
- `data.reservation_status`
  - 예약 완료/변경 완료/취소 완료 상태
- `data.items`
  - 병원 후보 또는 예약 목록이 필요한 경우 사용

요청 예시:

```json
{
  "message": "오전 9시로 해주세요."
}
```

응답 예시:

```json
{
  "conversation_id": "conv_123",
  "message": "오전 9시는 어렵고 오전 9시 30분 예약이 가능합니다.",
  "data": {
    "intent": "CHECK_AVAILABILITY",
    "action_required": "CONFIRM_RESERVATION",
    "hospital_id": 1,
    "requested_at": "2026-06-11T09:00:00",
    "suggested_slots": [
      "2026-06-11T09:30:00"
    ]
  }
}
```

### 3. 세션 종료

- Method: `DELETE`
- Path: `/hospital-chat/sessions/{conversation_id}`

요청 필드:

- Path `conversation_id`

응답 필드:

- `conversation_id`
  - 종료된 채팅 세션 식별자
- `message`
  - 종료 안내 문구
- `data`
  - 없음

응답 예시:

```json
{
  "conversation_id": "conv_123",
  "message": "병원 예약 대화를 종료했습니다.",
  "data": null
}
```

## 공통 응답 구조

챗 API 응답은 자연어 메시지와 구조화 데이터를 함께 반환한다.

```json
{
  "conversation_id": "conv_123",
  "message": "사용자에게 바로 보여줄 응답 문장",
  "data": {
    "intent": "CHECK_AVAILABILITY",
    "action_required": "CONFIRM_RESERVATION"
  }
}
```

### 공통 필드

- `conversation_id`
  - 현재 채팅방 세션 식별자
- `message`
  - 사용자에게 바로 노출할 챗봇 응답 문장
- `data`
  - 프론트 또는 FastAPI 내부 후속 처리를 위한 구조화 정보

## 요청/응답 상세 초안

### 세션 생성 요청

```json
{}
```

### 세션 생성 응답

```json
{
  "conversation_id": "conv_123",
  "message": "병원 예약 상담을 시작합니다.",
  "data": null
}
```

### 메시지 처리 요청

```json
{
  "message": "내일 오전에 내과 예약하고 싶어요."
}
```

### 메시지 처리 응답 예시 1: 정보 부족

```json
{
  "conversation_id": "conv_123",
  "message": "원하시는 시간을 알려주세요.",
  "data": {
    "intent": "CLARIFY",
    "action_required": "ASK_TIME"
  }
}
```

### 메시지 처리 응답 예시 2: 대안 제안

```json
{
  "conversation_id": "conv_123",
  "message": "오전 9시는 어렵고 오전 9시 30분 예약이 가능합니다.",
  "data": {
    "intent": "CHECK_AVAILABILITY",
    "action_required": "CONFIRM_RESERVATION",
    "hospital_id": 1,
    "requested_at": "2026-06-11T09:00:00",
    "suggested_slots": [
      "2026-06-11T09:30:00"
    ]
  }
}
```

### 메시지 처리 응답 예시 3: 예약 완료

```json
{
  "conversation_id": "conv_123",
  "message": "6월 11일 오전 9시 30분으로 예약이 완료되었습니다.",
  "data": {
    "intent": "CREATE_RESERVATION",
    "action_required": "NONE",
    "hospital_id": 1,
    "reservation_id": 15,
    "confirmed_at": "2026-06-11T09:30:00",
    "reservation_status": "RESERVED"
  }
}
```

### 세션 종료 응답

```json
{
  "conversation_id": "conv_123",
  "message": "병원 예약 대화를 종료했습니다.",
  "data": null
}
```

## 구조화 데이터 필드 초안

필요 시 아래 필드를 조합해 사용한다.

- `intent`
  - FastAPI가 해석한 현재 사용자 의도
- `action_required`
  - 프론트 또는 사용자 확인이 필요한 다음 액션
- `hospital_id`
  - 특정 병원 확정 시 식별자
- `reservation_id`
  - 기존 예약 변경/취소 대상 식별자
- `requested_at`
  - 사용자가 원한 예약 일시
- `confirmed_at`
  - 실제 확정된 예약 일시
- `suggested_slots`
  - 가장 근접한 대안 시간 목록
- `reservation_status`
  - 예약 완료/변경 완료/취소 완료 상태
- `items`
  - 병원 목록 또는 예약 목록처럼 리스트 응답이 필요한 경우 사용

## Intent 분류 기준

최소 intent 후보:

- `SEARCH_HOSPITAL`
  - 병원 목록이나 후보 탐색
- `CHECK_AVAILABILITY`
  - 특정 날짜/시간 가능 여부 확인
- `CREATE_RESERVATION`
  - 신규 예약 확정
- `CHANGE_RESERVATION`
  - 기존 예약 시간 변경
- `CANCEL_RESERVATION`
  - 기존 예약 취소
- `CHECK_RESERVATIONS`
  - 내 예약 목록 확인
- `CLARIFY`
  - 정보 부족으로 재질문 필요
- `FAIL`
  - 처리 실패

## Action Required 초안

- `WAIT`
  - 내부 조회 진행 또는 추가 판단 중
- `ASK_DATE`
  - 날짜 정보 필요
- `ASK_TIME`
  - 시간 정보 필요
- `ASK_HOSPITAL`
  - 병원 선택 필요
- `CONFIRM_RESERVATION`
  - 예약 확정 의사 확인 필요
- `CONFIRM_CHANGE`
  - 예약 변경 확정 필요
- `CONFIRM_CANCEL`
  - 예약 취소 확정 필요
- `NONE`
  - 추가 사용자 액션 불필요

## FastAPI → backend 호출 흐름

### 병원 찾기

- `GET /hospital`
- 필요 시 `type` 필터 사용

### 예약 가능 시간 확인

- `GET /hospital/{hospital_id}/available-slots?date=yyyy-MM-dd`

### 예약 생성

- `POST /hospital/reservations`

### 예약 변경/취소

- `PATCH /hospital/reservations/{reservation_id}`

### 예약 내역 조회

- `GET /hospital/reservations`

## 대표 시나리오

### 1. 예약 생성

1. 사용자가 채팅방에 입장해 세션을 생성한다
2. 사용자가 예약 의사를 입력한다
3. FastAPI가 병원 유형/날짜/시간을 파악한다
4. 부족한 정보가 있으면 `CLARIFY`
5. 병원 목록과 슬롯 조회
6. 가능하면 예약 생성
7. 불가능하면 가장 가까운 `suggested_slots` 제안

### 2. 예약 변경

1. 사용자가 채팅방에 입장해 세션을 생성한다
2. FastAPI가 병원 유형/날짜/시간을 파악
2. 사용자가 기존 예약 변경 의사 전달
3. FastAPI가 예약 내역 조회
4. 변경 대상 예약 확정
5. 새 시간 슬롯 확인
6. 가능하면 예약 변경 API 호출
7. 불가능하면 대안 시간 제안

### 3. 예약 취소

1. 사용자가 채팅방에 입장해 세션을 생성한다
2. 사용자가 취소 의사 전달
3. FastAPI가 예약 내역 조회
4. 취소 대상 예약 확정
5. 확인 응답 후 취소 API 호출

## 세션 정책

- 세션은 채팅방에 머무는 동안만 유지한다
- 채팅창 입장 시 세션 생성 API를 호출한다
- 실제 에이전트 호출은 사용자가 메시지를 입력할 때 수행한다
- 채팅방 이탈 시 세션 종료 API 호출을 권장한다
- 종료 호출이 누락돼도 TTL 기반 만료를 둘 수 있다
- 세션은 영구 이력 저장이 아니라 임시 문맥 저장 용도다

## 예외/실패 처리 방향

- backend 업무 API 실패 시 FastAPI는 사용자에게 자연어 메시지로 재구성해 전달한다
- 동시에 `data.intent=FAIL` 또는 기존 intent 유지 + 실패 상태를 함께 반환할 수 있다
- 슬롯 불가, 예약 없음, 이미 취소됨 같은 backend 예외는 챗 UX에 맞게 설명 메시지로 치환한다

## 다음 단계

이 설계 이후 자연스러운 다음 단계:

1. FastAPI 챗 API 요청/응답 필드 상세 명세 확정
2. 세션 저장소 구조 정의
3. FastAPI에서 backend 병원 API 호출 순서와 fallback 규칙 정의

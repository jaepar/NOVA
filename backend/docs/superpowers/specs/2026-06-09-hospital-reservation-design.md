# 병원 예약 생성 API 설계

## 목표

병원 예약 생성 API를 1차 범위로 추가하되, 미래의 의사 예약 가능 시간 검증 테이블과 자연스럽게 연결될 수 있도록 `reservation` 저장 구조를 정리한다.

## 범위

- 포함
  - `reservation` 저장 구조를 `reserved_at` 기준으로 정리
  - `POST /hospital/reservations` 1차 구현 계약 정의
  - 요청/응답 DTO 계약 정의
  - 관련 테스트 범위 정의
  - `docs/erd.md`, `docs/rest_api.md` 반영 기준 정의
- 제외
  - 의사 예약 가능 시간 테이블 추가
  - 예약 중복/충돌 검증
  - 영업시간 검증
  - 예약 내역 조회
  - 예약 변경/취소
  - 에이전트 전용 오케스트레이션 API

## 설계 선택

### 추천안

`reservation.rsv_date` 문자열 컬럼 대신 `reservation.reserved_at` 단일 시간 컬럼을 사용한다.

- DB 타입: `DATETIME`
- 엔티티 타입: `LocalDateTime`

이 방식을 선택한 이유는 다음과 같다.

- 예약 시점을 하나의 값으로 명확하게 표현할 수 있다.
- 미래에 의사 예약 가능 시간 테이블과 비교하기 쉽다.
- 문자열 파싱 없이 정렬, 비교, 범위 조회가 가능하다.
- 지금 단계에서 컬럼 분리보다 변경 범위를 작게 유지할 수 있다.

### 비교한 대안

#### 1. 날짜/시간 분리 컬럼

- 예: `reservation_date DATE`, `reservation_time TIME`
- 의미는 명확하지만 1차 구현 대비 복잡도가 증가한다.
- 현 단계에서는 단일 `DATETIME` 컬럼으로도 충분하다.

#### 2. 문자열 유지

- 예: 기존 `rsv_date VARCHAR`
- 당장은 가장 적게 바뀌지만, 이후 슬롯 검증 시 재설계 가능성이 높아 비추천한다.

## 데이터 구조

### ERD 변경

기존:

- `rsv_date VARCHAR_100`

변경:

- `reserved_at DATETIME`

### 엔티티 변경

`Reservation` 엔티티는 아래 구조를 사용한다.

- `reservationId`
- `user`
- `hospital`
- `reservedAt`

즉, 기존 `String rsvDate`는 제거하고 `LocalDateTime reservedAt`으로 대체한다.

## API 계약

### 요청

- 메서드: `POST`
- 경로: `/hospital/reservations`
- 인증: `USER`

요청 필드:

- `hospital_id`
- `reserved_at`

예시:

```json
{
  "hospital_id": 1,
  "reserved_at": "2026-06-10T14:00:00"
}
```

요청의 `reserved_at`은 ISO-8601 형태의 `LocalDateTime` 문자열로 받는다.

### 응답

1차 범위에서는 생성 상세 데이터를 반환하지 않고 공통 성공 응답만 반환한다.

```json
{
  "success": true,
  "code": "20000",
  "message": "SUCCESS"
}
```

즉, 컨트롤러는 `BaseResponse.ok(null)`을 반환한다.

## 동작 규칙

### 1. 인증 사용자 기준 생성

예약은 세션 사용자 기준으로 생성한다. 요청 본문에 `user_id`는 받지 않는다.

### 2. 병원 존재 여부 확인

`hospital_id`에 해당하는 병원이 없으면 예외를 반환한다.

### 3. 예약 저장

병원이 존재하면 `reservation` 레코드를 생성한다.

### 4. 이번 단계에서 하지 않는 검증

이번 1차 구현에서는 아래 검증을 보류한다.

- 동일 시간대 중복 예약 검증
- 의사 예약 가능 시간 검증
- 병원 영업시간 검증
- 예약 수정/취소 가능 여부 검증

## 구현 구조

### Controller

`HospitalController`에 `POST /hospital/reservations` 엔드포인트를 추가한다.

- `@AuthenticationPrincipal SessionUserPrincipal principal`
- `@RequestBody CreateReservationRequest request`

성공 시 `BaseResponse.ok(null)`을 반환한다.

### Service

`HospitalService`에서 아래 책임을 가진다.

- 사용자 조회
- 병원 조회
- 예약 엔티티 생성
- 저장

조회 실패 시 기존 프로젝트 패턴대로 `CustomException`을 사용한다.

### Repository

이번 단계에서 필요한 리포지토리는 아래 두 가지다.

- `ReservationRepository`
- `HospitalRepository`

사용자 조회를 위해 `UserRepository`도 사용한다.

## 예외 처리

이번 설계에서 필요한 최소 예외는 다음 두 가지다.

- 사용자 없음
  - 기존 `USER_NOT_FOUND` 재사용
- 병원 없음
  - 새 병원 도메인 예외가 없으면 `BaseExceptionResponseStatus`에 병원 조회 실패 상태 추가 필요

## 테스트 전략

TDD 순서를 유지한다.

### RED

- 컨트롤러 테스트
  - 인증 사용자는 예약 생성 성공 응답을 받는다
  - 비인증 사용자는 `401`을 받는다
- 서비스 테스트
  - 병원이 존재하면 예약을 저장한다
  - 병원이 없으면 예외를 던진다
  - 사용자가 없으면 예외를 던진다

### GREEN

테스트를 통과시키는 최소 구현만 추가한다.

### REFACTOR

동작을 바꾸지 않는 범위에서 엔티티 생성 책임과 DTO 유효성만 정리한다.

## 문서 반영

### `docs/erd.md`

- `reservation.rsv_date` 삭제
- `reservation.reserved_at DATETIME` 추가

### `docs/rest_api.md`

- `HOSPITAL-001` 요청 필드에 `hospital_id`, `reserved_at` 반영
- 성공 응답은 `data = null` 의미로 정리

## 다음 단계 연결

이번 구조는 이후 아래 기능으로 확장하기 쉽게 설계한다.

- 의사 예약 가능 시간 테이블
- 예약 시간 충돌 검증
- 예약 내역 조회
- 예약 변경/취소

즉, 1차는 저장 구조와 생성 API만 최소 구현하고, 검증 로직은 다음 단계에서 별도 설계한다.

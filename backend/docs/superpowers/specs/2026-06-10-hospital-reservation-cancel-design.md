# 병원 예약 취소 API 설계

## 목표

병원 예약 취소를 `예약 row 유지 + 상태 변경` 방식으로 처리하고, 취소 시 예약 슬롯을 다시 사용 가능 상태로 복구한다.

## 범위

- 포함
  - `PATCH /hospital/reservations/{reservation_id}`
  - `action=CANCEL`만 처리
  - `reservation.status` 상태 컬럼 추가
  - 취소 시 `hospital_available_slot.is_available = true` 복구
  - 관련 테스트 및 문서 반영
- 제외
  - `action=CHANGE`
  - 예약 변경 로직
  - 취소 가능 시간 제한 정책
  - 취소 사유 저장

## 설계 선택

### 선택안

예약 row를 삭제하지 않고 상태 컬럼으로 취소 처리한다.

상태 예시:

- `RESERVED`
- `CANCELED`

이 방식을 선택한 이유:

- 예약 이력이 남는다
- 예약 내역 조회 시 취소 여부를 표시하기 쉽다
- 운영/감사 관점에서 삭제보다 안전하다

### 선택하지 않은 방식

예약 취소 시 row를 실제 삭제하는 방식은 채택하지 않는다.

이유:

- 취소 이력이 사라진다
- 예약 생성/취소 이력을 추적하기 어렵다
- 이후 예약 내역 기능과 잘 맞지 않는다

## 데이터 구조

### Reservation

기존:

- `reservation_id`
- `user_id`
- `hospital_id`
- `reserved_at`

변경:

- `reservation_id`
- `user_id`
- `hospital_id`
- `reserved_at`
- `status`

### status enum

값:

- `RESERVED`
- `CANCELED`

신규 예약 생성 시 기본값은 `RESERVED`다.

## API 계약

### 요청

- 메서드: `PATCH`
- 경로: `/hospital/reservations/{reservation_id}`
- 인증: `USER`

요청 바디:

```json
{
  "action": "CANCEL"
}
```

현재 1차 범위에서는 `CANCEL`만 허용한다.

### 응답

성공 시:

```json
{
  "success": true,
  "code": "20000",
  "message": "요청에 성공했습니다."
}
```

즉 `BaseResponse.ok(null)`을 반환한다.

## 취소 처리 흐름

1. `reservation_id`로 예약 조회
2. 세션 사용자 본인 예약인지 확인
3. 예약 상태가 `RESERVED`인지 확인
4. 대응 슬롯 `hospital_id + reserved_at` 조회
5. 예약 상태를 `CANCELED`로 변경
6. 슬롯 `is_available = true`로 복구
7. 성공 응답 반환

## 예외 후보

최소 예외 후보:

- 예약 없음
- 본인 예약 아님
- 이미 취소된 예약
- 대응 슬롯 없음
- 유효하지 않은 action

이번 단계에서는 위 항목을 테스트 기준으로 좁혀서 구현한다.

## 테스트 전략

### RED

- 컨트롤러 테스트
  - 인증 사용자 `action=CANCEL` 성공
  - 비인증 사용자 실패
- 서비스 테스트
  - 본인 예약이면 상태를 `CANCELED`로 바꾸고 슬롯을 복구
  - 예약이 없으면 예외
  - 본인 예약이 아니면 예외
  - 이미 취소된 예약이면 예외

### GREEN

테스트를 통과시키는 최소 구현만 추가한다.

### REFACTOR

상태 전이 메서드나 슬롯 복구 메서드만 정리하고, 범위 밖 기능은 추가하지 않는다.

## 문서 반영

- `docs/erd.md`
  - `reservation.status` 추가
- `docs/rest_api.md`
  - `HOSPITAL-003`의 1차 범위가 `action=CANCEL`임을 명시

## 다음 단계

이 설계 이후 자연스러운 다음 단계:

1. `CHANGE` 처리 추가
2. 예약 내역 조회에서 취소 상태 표시
3. 취소 가능 시간 제한 정책 추가

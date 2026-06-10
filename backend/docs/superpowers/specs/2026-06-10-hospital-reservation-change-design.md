# 병원 예약 변경 API 설계

## 목표

기존 예약 row를 유지한 채 예약 시간을 변경하고, 이전 슬롯은 복구하고 새 슬롯은 점유하는 `CHANGE` 처리를 정의한다.

## 범위

- 포함
  - `PATCH /hospital/reservations/{reservation_id}`
  - `action=CHANGE`
  - 기존 예약 row 유지
  - 이전 슬롯 복구
  - 새 슬롯 점유
  - 관련 테스트 및 문서 반영
- 제외
  - 병원 변경
  - 사용자 변경
  - 변경 이력 별도 저장
  - 변경 가능 시간 제한 정책

## 설계 선택

### 선택안

예약 변경 시 기존 예약 row를 삭제하거나 새 row를 만들지 않고, 기존 `reservation` row의 `reserved_at`만 갱신한다.

이 방식을 선택한 이유:

- 예약 1건의 연속성을 유지할 수 있다
- 예약 변경 전후를 같은 예약 ID로 다룰 수 있다
- 사용자 예약 목록에서 불필요한 중복 row를 만들지 않는다

### 슬롯 처리

기존 예약 시간의 슬롯은 `is_available=true`로 복구하고, 새 예약 시간의 슬롯은 `is_available=false`로 점유한다.

## API 계약

### 요청

- 메서드: `PATCH`
- 경로: `/hospital/reservations/{reservation_id}`
- 인증: `USER`

요청 바디:

```json
{
  "action": "CHANGE",
  "reserved_at": "2026-06-11T15:00:00"
}
```

현재 1차 범위에서는 `action=CHANGE`일 때만 `reserved_at`을 사용한다.

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

## 변경 처리 흐름

1. `reservation_id`로 예약 조회
2. 세션 사용자 본인 예약인지 확인
3. 예약 상태가 `RESERVED`인지 확인
4. 새 `reserved_at` 슬롯 조회
5. 새 슬롯이 존재하고 `is_available=true`인지 확인
6. 기존 슬롯 조회
7. 기존 슬롯 `is_available=true` 복구
8. 새 슬롯 `is_available=false` 점유
9. 기존 예약 row의 `reserved_at`을 새 시간으로 변경

## 예외 후보

최소 예외 후보:

- 예약 없음
- 본인 예약 아님
- 이미 취소된 예약
- 새 슬롯 없음
- 새 슬롯 이미 사용 중
- 유효하지 않은 action
- `CHANGE`인데 `reserved_at` 누락

## 테스트 전략

### RED

- 컨트롤러 테스트
  - 인증 사용자 `action=CHANGE` 성공
  - 비인증 사용자 실패
- 서비스 테스트
  - 변경 성공 시 기존 슬롯 복구 + 새 슬롯 점유 + 예약 시간 갱신
  - 예약이 없으면 예외
  - 이미 취소된 예약이면 예외
  - 새 슬롯이 없거나 사용 중이면 예외

### GREEN

테스트를 통과시키는 최소 구현만 추가한다.

### REFACTOR

슬롯 전환과 예약 시간 변경 책임을 읽기 쉬운 메서드 단위로만 정리한다.

## 문서 반영

- `docs/rest_api.md`
  - `HOSPITAL-003`에 `action=CHANGE`, `reserved_at` 반영
- 필요 시 `docs/erd.md`
  - 구조 변경은 없으므로 설명만 보강 가능

## 다음 단계

이 설계 이후 자연스러운 다음 단계:

1. 변경 가능 시간 제한 정책
2. 병원 변경 허용 여부 검토
3. 변경 이력 추적 정책

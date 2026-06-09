# 병원 예약 가능 슬롯 설계

## 목표

병원 예약 생성 전에 예약 가능 시간을 검증할 수 있도록, 병원 기준 30분 슬롯 테이블 구조를 정의한다.

## 전제

- 검증 기준 키는 `hospital_id`
- 병원당 의사는 1명
- 병원의 예약 가능 시간이 곧 의사의 예약 가능 시간
- 슬롯 단위는 30분

## 선택한 방식

예약 가능한 시간만 DB에 저장한다.

즉, `hospital_available_slot` 테이블에 해당 시간이 존재하면 예약 가능하고, 존재하지 않으면 예약 불가로 본다.

예시:

- `hospital_id=1`, `available_at=2026-06-10 09:00:00`
- `hospital_id=1`, `available_at=2026-06-10 09:30:00`
- `hospital_id=1`, `available_at=2026-06-10 10:00:00`

위처럼 저장되어 있으면 이 세 시간만 예약 가능하다.

## 선택하지 않은 방식

모든 시간 슬롯을 미리 넣고 `is_available` 상태값으로 on/off 관리하는 방식은 이번 단계에서 채택하지 않는다.

이유:

- 초기 구조가 더 무거워진다
- 현재 목표는 최소 검증 구조 확정이다
- 병원 1개당 의사 1명 전제에서는 가능한 시간만 저장하는 방식이 더 단순하다

## 테이블 구조

테이블명:

- `hospital_available_slot`

컬럼:

- `slot_id` `BIGINT` PK
- `hospital_id` `BIGINT` FK
- `available_at` `DATETIME`
- `created_at` `TIMESTAMP`
- `updated_at` `TIMESTAMP`

권장 제약:

- `(hospital_id, available_at)` 유니크

이 유니크 제약을 두면 같은 병원에 같은 30분 슬롯이 중복 적재되는 것을 막을 수 있다.

## ERD 초안

```text
HOSPITAL_AVAILABLE_SLOT {
  BIGINT slot_id PK
  BIGINT hospital_id FK
  DATETIME available_at
  TIMESTAMP created_at
  TIMESTAMP updated_at
}
```

## 조회 방식

예약 생성 검증은 `IN`이 아니라 `존재 여부 조회`를 기본으로 한다.

예를 들어 사용자가 아래 요청을 보내면:

- `hospital_id = 1`
- `reserved_at = 2026-06-10T09:30:00`

검증 의미는 아래와 같다.

```sql
SELECT 1
FROM hospital_available_slot
WHERE hospital_id = 1
  AND available_at = '2026-06-10 09:30:00';
```

결과가 있으면 예약 가능, 없으면 예약 불가다.

## 예약 생성 검증 흐름

1. `POST /hospital/reservations` 요청에서 `hospital_id`, `reserved_at` 수신
2. 병원 존재 여부 확인
3. `hospital_available_slot`에서 `hospital_id + reserved_at` 존재 여부 확인
4. 존재하면 예약 생성 진행
5. 없으면 예약 불가 예외 반환

## 이번 단계에서 보류하는 것

- 예약 완료 후 슬롯 자동 제거
- 예약 취소 시 슬롯 자동 복구
- 동일 시간 중복 예약 차단 전략
- 병원 운영시간 문자열(`open_time`, `close_time`) 기반 슬롯 자동 생성
- 휴무일(`day_off`) 기반 슬롯 차단

## 다음 단계 연결

이 구조를 기준으로 다음 순서로 확장할 수 있다.

1. `docs/erd.md`에 `hospital_available_slot` 반영
2. 슬롯 엔티티/리포지토리 추가
3. 예약 생성 API에서 슬롯 존재 여부 검증 추가
4. 필요 시 슬롯 적재 SQL 추가

이 방식은 병원당 의사 1명 전제에서는 가장 단순하고, 나중에 의사 개념이 추가되면 `hospital_id` 옆에 `doctor_id`를 확장하는 방향으로 이어갈 수 있다.

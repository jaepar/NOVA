# 병원 예약 내역 조회 API 설계

## 목표

로그인 사용자가 본인의 병원 예약 내역을 조회할 수 있도록 `GET /hospital/reservations` API를 정의한다.

## 범위

- 포함
  - 세션 사용자 기준 예약 목록 조회
  - 예약 목록 응답 DTO 정의
  - `reserved_at`, `status` 포함
  - 병원 정보 일부(`hospital_name`, `doctor_name`) 포함
  - 관련 테스트 및 문서 반영
- 제외
  - 사용자 ID를 path로 받는 조회 방식
  - 페이지네이션
  - 날짜 필터
  - 상태 필터
  - 병원 상세 조회

## 경로 정리

기존 문서에는 `/{user_id}/reservations`로 적혀 있지만, 현재 프로젝트 전반의 인증/세션 패턴에 맞춰 `GET /hospital/reservations`로 정리한다.

이유:

- 세션 사용자 본인 기준 조회 패턴과 일치한다
- 요청에서 `user_id`를 직접 받지 않아도 된다
- 권한 검증이 단순해진다

## API 계약

### 요청

- 메서드: `GET`
- 경로: `/hospital/reservations`
- 인증: `USER`

별도 요청 바디는 없다.

### 응답

성공 시 공통 응답 래퍼 `BaseResponse`를 사용한다.

응답 예시:

```json
{
  "success": true,
  "code": "20000",
  "message": "요청에 성공했습니다.",
  "data": {
    "items": [
      {
        "reservation_id": 1,
        "hospital_id": 2,
        "hospital_name": "강남튼튼정형외과",
        "doctor_name": "이준호",
        "reserved_at": "2026-06-10T14:00:00",
        "status": "RESERVED"
      }
    ]
  }
}
```

### 응답 필드

- `reservation_id`
- `hospital_id`
- `hospital_name`
- `doctor_name`
- `reserved_at`
- `status`

`status` 값:

- `RESERVED`
- `CANCELED`

## 동작 규칙

### 1. 세션 사용자 기준 조회

세션 사용자의 예약만 조회한다.

### 2. 상태 포함 조회

취소된 예약도 목록에 포함하고, `status`로 구분해서 내려준다.

### 3. 최신순 정렬

1차 구현에서는 `reserved_at` 기준 최신순 정렬을 우선한다.

## 구현 구조

### Controller

`HospitalController`에 `GET /hospital/reservations` 엔드포인트를 추가한다.

- `@AuthenticationPrincipal SessionUserPrincipal principal`

### Service

`HospitalService`에서 세션 사용자 기준 예약 목록을 조회하고 응답 DTO로 변환한다.

### Repository

`ReservationRepository`에 사용자 기준 목록 조회 메서드를 추가한다.

예:

- `findAllByUserUserIdOrderByReservedAtDesc(Long userId)`

## 테스트 전략

### RED

- 컨트롤러 테스트
  - 인증 사용자 성공
  - 비인증 사용자 실패
- 서비스 테스트
  - 사용자 예약 목록을 최신순으로 반환
  - 병원명/의사명/상태가 응답에 반영됨

### GREEN

테스트를 통과시키는 최소 구현만 추가한다.

### REFACTOR

DTO 변환 책임은 DTO 쪽 정적 팩토리 메서드로 둔다.

## 문서 반영

- `docs/rest_api.md`
  - `HOSPITAL-002`를 `GET /reservations`로 수정
  - 응답 필드 반영
- 필요 시 `docs/erd.md`
  - 상태 enum 설명 보강

## 다음 단계

이 설계 이후 자연스러운 다음 단계:

1. 상태/날짜 필터 추가
2. 예약 변경(`CHANGE`) 구현
3. 페이지네이션 추가

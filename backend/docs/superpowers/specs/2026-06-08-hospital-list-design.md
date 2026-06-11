# 병원 목록 조회 API 설계

## 목표

로그인 사용자가 `GET /hospital` API로 병원 목록을 조회할 수 있도록 하고, 필요 시 진료과(`type`)로 목록을 필터링할 수 있게 한다.

## 범위

- 포함
  - 병원 목록 조회 API
  - 선택형 `type` 쿼리 파라미터
  - 병원 목록 응답 DTO
  - 병원 목록 조회 서비스/리포지토리 연동
  - 관련 테스트
  - `docs/rest_api.md` 계약 동기화
- 제외
  - 예약 생성
  - 예약 내역 조회
  - 예약 변경/취소
  - 에이전트 전용 오케스트레이션 API

## API 계약

### 요청

- 메서드: `GET`
- 경로: `/hospital`
- 인증: `USER`
- 쿼리 파라미터
  - `type` (선택): `DepartmentType`

예시:

- `GET /hospital`
- `GET /hospital?type=INTERNAL_MEDICINE`

### 응답

공통 응답 래퍼 `BaseResponse`를 유지하고, `data`에는 병원 목록 DTO를 담는다.

응답 데이터는 다음 정보를 포함한다.

- `items`: 병원 목록
  - `hospital_id`
  - `name`
  - `type`
  - `doctor_name`
  - `address`
  - `open_time`
  - `close_time`
  - `break_time`
  - `day_off`

현재 단계에서는 예약 가능 여부, 거리순 정렬, 페이징은 포함하지 않는다.

## 동작 규칙

### 1. 필터 없음

`type`이 없으면 전체 병원 목록을 조회한다.

### 2. 필터 있음

`type`이 있으면 해당 진료과와 일치하는 병원 목록만 조회한다.

### 3. 잘못된 필터 값

`DepartmentType`에 없는 값은 스프링의 기본 enum 바인딩 실패로 거절되며, 기존 전역 예외 응답 체계를 따른다.

## 구현 구조

### Controller

`HospitalController`에 `GET /hospital` 엔드포인트를 추가한다.

- `@RequestParam(required = false) DepartmentType type`
- `@AuthenticationPrincipal SessionUserPrincipal principal`

이번 API는 세션 사용자 인증이 필요하지만, 현재 1차 범위에서는 `userId`를 별도 조회 조건으로 사용하지 않는다. 인증 요구사항 충족과 기존 컨트롤러 패턴 일관성을 위해 principal은 유지한다.

### Service

`HospitalService`는 `type` 유무에 따라 아래 두 흐름 중 하나를 선택한다.

- `type == null` -> 전체 조회
- `type != null` -> 진료과 조건 조회

서비스는 엔티티를 직접 반환하지 않고 응답 DTO로 변환한다.

### Repository

`HospitalRepository`는 기존 `findAll()`과 함께 진료과 조건 조회 메서드를 사용한다.

- `findAllByType(DepartmentType type)`

## 테스트 전략

TDD 순서를 유지한다.

### RED

- 컨트롤러 테스트
  - 인증 사용자 요청 시 성공 응답을 반환하는지 확인
  - `type` 파라미터를 서비스로 그대로 전달하는지 확인
  - 인증 없이 요청하면 `401`을 반환하는지 확인
- 서비스 테스트
  - `type`이 없으면 전체 조회 경로를 타는지 확인
  - `type`이 있으면 필터 조회 경로를 타는지 확인
  - 응답 DTO 매핑이 올바른지 확인

### GREEN

테스트를 통과시키는 최소 구현만 추가한다.

### REFACTOR

중복되는 DTO 변환이나 테스트 헬퍼만 정리하고, 동작 변경은 하지 않는다.

## 문서 반영

`docs/rest_api.md`의 `HOSPITAL-004`에 `type` 쿼리 파라미터를 반영한다.

예시:

- `GET /hospital`
- `GET /hospital?type=INTERNAL_MEDICINE`

## 비범위 결정

이번 단계에서는 아래 항목을 의도적으로 보류한다.

- 페이징
- 병원 상세 조회
- 예약 가능 시간 계산
- 다국어 메시지 확장
- 에이전트 전용 단일 호출 API

이 항목들은 병원 예약 2차 이후 단계에서 별도 설계한다.

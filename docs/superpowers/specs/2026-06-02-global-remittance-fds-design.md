# 해외송금 FDS 연동 설계

## 목표

해외송금 요청을 CoreBanking 원장에 먼저 저장하고, 별도 Python FDS 서버의 비동기 심사 결과에 따라 해외송금 원장 상태를 갱신한다. NOVA는 실제 은행 송금 실행 전 단계까지만 담당하며, 은행 처리 이후의 송금 실행/정산/완료 처리는 구현 범위에 포함하지 않는다.

## 책임 경계

- `frontend`: 해외송금 요청 입력 및 사용자별 해외송금 목록/상태 조회 화면을 담당한다.
- `backend`: 사용자 세션 기준 본인 계좌/사용자 검증을 수행하고, 프론트 요청 필드와 `account_ref` 등 백엔드 보유 정보를 조합해 CoreBanking에 전달한다.
- `coreBanking`: 해외송금 원장 생성, 계좌 선출금, FDS 비동기 심사 요청, FDS 결과 기반 상태 갱신, 실패 시 출금 금액 환급을 담당한다.
- `fds-server`: Python 기반 On-Premise FDS 서버로, 폴더는 `fds`를 사용한다. CoreBanking이 전달한 해외송금 원장 스냅샷을 Isolation Forest 모델로 심사하고 `SUCCESS` 또는 `FAILED`를 반환한다.

## 거래 흐름

1. 프론트가 해외송금 요청을 백엔드에 전달한다.
2. 백엔드는 로그인 세션 기준 사용자와 계좌 소유 관계를 검증한다.
3. 백엔드는 요청 필드와 백엔드 보유 정보를 조합해 CoreBanking 해외송금 생성 API를 호출한다.
4. CoreBanking은 중복 요청 여부를 확인한다.
5. CoreBanking은 출금 계좌의 금액을 먼저 차감하고 계좌 거래내역을 기록한다.
6. CoreBanking은 `global_transaction` 원장을 `PENDING` 상태로 저장한다.
7. CoreBanking은 `@Async` 기반 비동기 작업으로 FDS 심사 API를 호출한다.
8. FDS가 위험 거래로 판단하면 CoreBanking은 상태를 `FAILED`로 변경하고 출금 금액을 계좌에 환급한다.
9. FDS가 정상 거래로 판단하면 CoreBanking은 상태를 `SUCCESS`로 변경한다.
10. 프론트는 백엔드의 사용자별 해외송금 목록 조회 API로 처리 상태를 확인한다.

## 상태 정의

| 상태 | 의미 |
|---|---|
| `PENDING` | 해외송금 원장이 저장되고 FDS 심사가 대기 또는 진행 중인 상태 |
| `SUCCESS` | FDS 1차 게이트웨이를 통과해 은행 처리 단계로 넘길 수 있는 상태 |
| `FAILED` | FDS 위험 판정 또는 FDS 통신 장애로 NOVA 단계에서 종료된 상태 |

## 실패 사유

`FAILED` 상태는 `failure_reason`으로 실패 원인을 구분한다.

| 실패 사유 | 의미 |
|---|---|
| `FDS_RISK_DETECTED` | Isolation Forest 모델이 위험 거래로 판정 |
| `FDS_TIMEOUT` | FDS 응답 시간이 허용 시간을 초과 |
| `FDS_COMMUNICATION_FAILED` | FDS 서버와 통신할 수 없음 |
| `FDS_RESPONSE_INVALID` | FDS 응답 형식 또는 값이 유효하지 않음 |
| `FDS_RETRY_EXHAUSTED` | FDS 재시도 횟수 초과 |

## API 계약

### CoreBanking

- `CB-008 POST /global-transactions`: 해외송금 요청을 생성하고 `PENDING` 상태를 반환한다.
- `CB-009 GET /global-transactions/{globalTransactionId}`: 해외송금 단건 상태를 조회한다.
- `CB-012 GET /global-transactions?customerId={customerId}`: 서버 간 호출로 고객별 해외송금 목록을 조회한다.

### Backend

- `BANK-007 POST /banking/global-transactions`: 사용자 세션 기준 해외송금 요청을 생성한다.
- `BANK-009 GET /banking/global-transactions`: 사용자 세션 기준 본인 해외송금 목록을 조회한다.
- 목록 응답 필드는 `globalTransactionId`, `receiverEngName`, `remitAmount`, `currency`, `status`, `createdAt`을 기본으로 한다.

### FDS

- `FDS-001 POST /fds/global-transactions/screenings`: CoreBanking이 전달한 해외송금 전체 필드 스냅샷을 심사하고 `SUCCESS` 또는 `FAILED`를 반환한다.

## 중복 방지

해외송금 생성 API는 외부 요청 식별자(`externalRequestId`)를 사용한다. 동일한 요청 식별자로 이미 생성된 해외송금 원장이 있으면 새 원장과 추가 출금을 만들지 않고 기존 처리 결과를 반환한다.

## 장애 처리

FDS 호출은 타임아웃과 재시도 정책을 둔다. 재시도 횟수를 초과하면 해외송금 원장 상태를 `FAILED`로 변경하고, 선출금된 금액을 환급한다. 장애 원인은 `failure_reason`에 남긴다.

## 문서 반영 범위

- `coreBanking/docs/rest_api.md`: CoreBanking 해외송금 API 계약
- `coreBanking/docs/erd.md`: 상태 enum 및 `failure_reason` 컬럼
- `backend/docs/rest_api.md`: Cloud 해외송금 생성/목록 조회 API
- `fds/docs/rest_api.md`: Python FDS 심사 API

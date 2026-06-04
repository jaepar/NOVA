# REST API (On-Prem Only)

coreBanking 서버는 On-Prem 계정계 Open API(BaaS) 역할을 수행한다.  
본 문서는 전달받은 API 명세 중 **On-Prem** 항목만 정의한다.

## Common Rules

- 인증 방식은 서버 간 인증(내부망/전용 연동) 기준으로 운영한다.
- 모든 응답은 coreBanking 공통 응답 래퍼를 사용한다.
- 원장 변경 API는 중복 방지를 위해 요청 식별자(`externalRequestId` 등)를 사용한다.
- 컨트롤러는 DTO만 입출력하고 엔티티 직접 반환을 금지한다.

## Role Rules

| Role | Meaning |
|---|---|
| `AUTHORIZED` | 연동된 내부 서비스/권한 토큰 필요 |

## API Catalog

| ID | Name | Method | Path | Auth | Role | Notes |
|---|---|---|---|---|---|---|
| `CB-001` | 계좌 개설(On-Prem) | POST | `/accounts` | O | AUTHORIZED | |
| `CB-002` | 계좌 비밀번호 검증(On-Prem) | POST | `/accounts/password/verify` | O | AUTHORIZED | account.password 일치 검증 |
| `CB-003` | 계좌 이체(On-Prem) | POST | `/account-transactions/transfers` | O | AUTHORIZED | `externalRequestId` 기반 멱등 처리 |
| `CB-004` | 이체 처리 결과 조회(On-Prem) | GET | `/account-transactions/requests/{externalRequestId}` | O | AUTHORIZED | 이체/월렛충전 공통 외부 요청 ID 기반 결과 조회 |
| `CB-005` | 거래 내역 조회(On-Prem) | GET | `/core-banking/{accountId}/transactions` | O | AUTHORIZED | |
| `CB-006` | 거래 내역 메모 수정(On-Prem) | PATCH | `/account-transactions/accounts/{accountId}/transactions/{transactionId}/memo` | O | AUTHORIZED | 메모 20자 이내, 빈 값은 null 저장 |
| `CB-007` | 홈 계좌 정보 조회(On-Prem) | GET | `/core-banking/home` | O | AUTHORIZED | |
| `CB-008` | 해외 송금(On-Prem) | TBD | `TBD` | O | AUTHORIZED | 명세 상세 확정 후 반영 |
| `CB-009` | 해외 송금 이상거래 탐지(On-Prem) | TBD | `TBD` | O | AUTHORIZED | FDS 연동 정책/룰셋 확정 후 반영 |
| `CB-010` | 수취인 조회(On-Prem) | POST | `/accounts/recipients/lookup` | O | AUTHORIZED | 은행코드+계좌번호로 예금주명 조회 |
| `CB-011` | 고객 생성(On-Prem) | POST | `/customers` | O | AUTHORIZED | `userId`,`name`,`email` 기반 고객 생성 |

## CB-001 계좌 개설(On-Prem)

- Method: `POST`
- Path: `/`
- Resource Prefix: `/accounts` (최종 엔드포인트: `POST /accounts`)
- Auth: `O` (`AUTHORIZED`)

Request
```json
{
  "customerId": 1001,
  "accountType": "DEMAND_DEPOSIT",
  "accountName": "우리 SUPER주거래 통장",
  "customerInfo": {
    "name": "PARK JAEHA",
    "email": "abcdef@gmail.com",
    "address": "서울특별시 광진구 능동로 120",
    "addressDetail": "건국대학교 기숙사 101호"
  },
  "job": "STUDENT",
  "transactionInfo": {
    "purpose": "SALARY_AND_LIVING_EXPENSES",
    "source": "EARNED_AND_PENSION_INCOME"
  },
  "taxInfo": {
    "hasForeignTax": false
  },
  "accountPassword": "1234"
}
```

Response (200)
```json
{
  "success": true,
  "code": 20000,
  "message": "요청에 성공했습니다.",
  "data": {
    "accountId": 2001,
    "bankCode": "WOORI",
    "accountNumber": "1002-312-345678"
  }
}
```

Notes
- `customer.backend_user_id`는 nullable이다.
- NOVA 사용자 연동 고객은 `userId`를 저장하고, 타행/외부 유입 고객은 `backend_user_id` 없이 저장될 수 있다.

## CB-011 고객 생성(On-Prem)

- Method: `POST`
- Path: `/customers`
- Auth: `O` (`AUTHORIZED`)

Request
```json
{
  "userId": 2,
  "name": "PARK JAEHA",
  "email": "abc@gmail.com"
}
```

Response (200)
```json
{
  "success": true,
  "code": 20000,
  "message": "요청에 성공했습니다.",
  "data": null
}
```

Account Number Rules
- 저장값(`account_number`): 숫자 13자리 raw 문자열
- 저장 포맷: `S(1) + YYY(3) + C(1) + NNNNNNNN(8)`
- 고정값: `S=1`, `YYY=002`, `bankCode=WOORI`
- `C`: 모듈러 방식 검증숫자
- `NNNNNNNN`: 중복되지 않는 고유 일련번호(8자리)
- 조회 응답 포맷: `SYYY-CZZ-ZZZZZZ` (하이픈 포함)
- 하이픈은 저장하지 않고 조회 시에만 포매팅한다.

Validation / Error Rules
- `customerId`, `accountType`, `accountName`, `customerInfo`, `job`, `transactionInfo`, `taxInfo`, `accountPassword`는 필수다.
- `accountType`은 계좌 유형 enum(예: `DEMAND_DEPOSIT`, `INSTALLMENT_SAVINGS`, `TIME_DEPOSIT`, `FOREIGN_CURRENCY`)만 허용한다.
- `transactionInfo.purpose`, `transactionInfo.source`는 ERD의 `customer` enum 정의를 따른다.
- `accountPassword`는 문자열로 전달한다.
- 계좌 비밀번호 원문은 로그/예외 메시지에 노출하지 않는다.
- 계좌번호 생성 중 유니크 충돌 시 재시도 후 실패를 반환한다.

## Hold Policy

| API ID | Status | Reason |
|---|---|---|
| `CB-008` | 구현 예정 | 해외 송금 프로세스/입출력 계약 미확정 |
| `CB-009` | 구현 예정 | 이상거래 탐지 연동(FDS) 정책 미확정 |

## CB-010 수취인 조회(On-Prem)

- Method: `POST`
- Path: `/accounts/recipients/lookup`
- Auth: `O` (`AUTHORIZED`)

Request
```json
{
  "bankCode": "BUSAN",
  "accountNumber": "1122261925003"
}
```

## CB-002 계좌 비밀번호 검증(On-Prem)

- Method: `POST`
- Path: `/accounts/password/verify`
- Auth: `O` (`AUTHORIZED`)

Request
```json
{
  "accountId": 1,
  "accountPassword": "1234"
}
```

Response (200)
```json
{
  "success": true,
  "code": 20000,
  "message": "요청에 성공했습니다."
}
```

Response (200)
```json
{
  "success": true,
  "code": 20000,
  "message": "요청에 성공했습니다.",
  "data": {
    "recipientName": "백민정"
  }
}
```

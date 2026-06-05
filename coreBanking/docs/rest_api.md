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
| `CB-006` | 거래 내역 메모 수정(On-Prem) | PATCH | `/core-banking/{accountId}/transactions/{transactionId}/memo` | O | AUTHORIZED | |
| `CB-007` | 홈 계좌 정보 조회(On-Prem) | GET | `/core-banking/home` | O | AUTHORIZED | |
| `CB-008` | 해외 송금 요청 생성(On-Prem) | POST | `/global-transactions` | O | AUTHORIZED | `externalRequestId` 기반 멱등 처리, FDS 비동기 심사 |
| `CB-009` | 해외 송금 상태 조회(On-Prem) | GET | `/global-transactions/{globalTransactionId}` | O | AUTHORIZED | 단건 상태 조회 |
| `CB-010` | 수취인 조회(On-Prem) | POST | `/accounts/recipients/lookup` | O | AUTHORIZED | 은행코드+계좌번호로 예금주명 조회 |
| `CB-011` | 고객 생성(On-Prem) | POST | `/customers` | O | AUTHORIZED | `userId`,`name`,`email` 기반 고객 생성 |
| `CB-012` | 고객별 해외 송금 목록 조회(On-Prem) | GET | `/global-transactions?customerId={customerId}` | O | AUTHORIZED | 서버 간 호출 전용 |

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
| `CB-008` | 구현 예정 | 해외 송금 생성 구현 필요 |
| `CB-009` | 구현 예정 | 해외 송금 상태 조회 구현 필요 |
| `CB-012` | 구현 예정 | 고객별 해외 송금 목록 조회 구현 필요 |

## CB-008 해외 송금 요청 생성(On-Prem)

- Method: `POST`
- Path: `/global-transactions`
- Auth: `O` (`AUTHORIZED`)

Request
```json
{
  "externalRequestId": "global-remittance-20260602-0001",
  "customerId": 1001,
  "accountId": 2001,
  "remitPurpose": "생활비 송금",
  "targetCountry": "US",
  "currency": "USD",
  "remitAmount": "1000.00",
  "mediaryFeePayer": "SENDER",
  "exchangeRate": 1380.500000,
  "krwAmount": "1380500",
  "senderEngName": "PARK JAEHA",
  "senderPhone": "+821012345678",
  "senderAddressDetail": "101",
  "senderDistrict": "Gwangjin-gu",
  "senderCity": "Seoul",
  "senderZipCode": "05029",
  "senderCountry": "KR",
  "receiverEngName": "JOHN SMITH",
  "receiverAddressDetail": "Apt 10",
  "receiverDistrict": "Manhattan",
  "receiverCity": "New York",
  "receiverZipCode": null,
  "receiverPhone": "+12125550100",
  "swiftCode": "BOFAUS3N",
  "receiverAccountNum": "1234567890",
  "routingNumber": "026009593",
  "bankName": "Bank of America",
  "remitReason": "LIVING_EXPENSE"
}
```

Response (200)
```json
{
  "success": true,
  "code": 20000,
  "message": "요청에 성공했습니다.",
  "data": {
    "globalTransactionId": 1,
    "status": "PENDING"
  }
}
```

Processing Rules
- 동일한 `externalRequestId`가 이미 처리된 경우 새 해외송금 원장과 추가 출금을 만들지 않고 기존 처리 결과를 반환한다.
- 요청을 수락하면 계좌 금액을 먼저 출금하고 계좌 거래내역을 기록한다.
- 해외송금 원장은 최초 `PENDING` 상태로 저장한다.
- CoreBanking은 `@Async` 기반 비동기 작업으로 FDS Python 서버의 `FDS-001` API를 호출한다.
- FDS 결과가 `SUCCESS`이면 해외송금 원장 상태를 `SUCCESS`로 변경한다.
- FDS 결과가 `FAILED`이거나 FDS 통신 재시도 횟수를 초과하면 해외송금 원장 상태를 `FAILED`로 변경하고 선출금 금액을 환급한다.
- `FAILED` 상태에서는 `failureReason`에 실패 사유를 저장한다.

Status / Failure Rules
- `status`: `PENDING | SUCCESS | FAILED`
- `failureReason`: `FDS_RISK_DETECTED | FDS_TIMEOUT | FDS_COMMUNICATION_FAILED | FDS_RESPONSE_INVALID | FDS_RETRY_EXHAUSTED`
- `PENDING`, `SUCCESS` 상태에서는 `failureReason`을 `null`로 둔다.
- `receiverDistrict`, `receiverZipCode`는 선택값이다.
- `receiverCity`는 필수값이다.

## CB-009 해외 송금 상태 조회(On-Prem)

- Method: `GET`
- Path: `/global-transactions/{globalTransactionId}`
- Auth: `O` (`AUTHORIZED`)

Response (200)
```json
{
  "success": true,
  "code": 20000,
  "message": "요청에 성공했습니다.",
  "data": {
    "globalTransactionId": 1,
    "status": "FAILED",
    "failureReason": "FDS_RISK_DETECTED"
  }
}
```

## CB-012 고객별 해외 송금 목록 조회(On-Prem)

- Method: `GET`
- Path: `/global-transactions?customerId={customerId}`
- Auth: `O` (`AUTHORIZED`)

Response (200)
```json
{
  "success": true,
  "code": 20000,
  "message": "요청에 성공했습니다.",
  "data": [
    {
      "globalTransactionId": 1,
      "receiverEngName": "JOHN SMITH",
      "remitAmount": "1000.00",
      "currency": "USD",
      "status": "PENDING",
      "createdAt": "2026-06-02T10:30:00"
    }
  ]
}
```

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

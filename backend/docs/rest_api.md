# REST API

모든 API 경로는 `/{도메인 이름}` prefix를 사용한다.
아래 표의 `Path`는 prefix를 제외한 상대 경로다.

## Common Rules

- 인증 방식은 세션 기반이다. JWT로 전환하지 않는다.
- `Auth=O`는 로그인 세션이 필요하고, `Auth=X`는 비로그인 호출 가능하다.
- 모든 응답은 백엔드 공통 응답 래퍼를 사용한다.
- 컨트롤러 엔드포인트에는 SpringDoc 어노테이션을 작성한다.
- 엔티티 직접 반환 금지, DTO 응답을 사용한다.
- 요청/응답 DTO의 세부 필드는 구현 단계에서 도메인 담당자가 최종 확정한다.

예시 응답 래퍼:

```json
{
  "success": true,
  "code": 20000,
  "message": "요청에 성공했습니다.",
  "data": {}
}
```

## Role Rules

| Role     | Meaning    |
|----------|------------|
| `PUBLIC` | 비로그인 호출 가능 |
| `USER` | 사용자 세션 필요 |

권한 공통 규칙:

- `USER` API는 현재 세션 `userId` 기준으로 본인 데이터만 조회/변경한다.

## Hold Policy

| API ID         | Status | Reason                           |
|----------------|--------|----------------------------------|
| `HOSPITAL-005` | 구현 예정  | 에이전트 호출 API 경로/입출력 계약 미확정        |
| `BANK-014`     | 구현 예정  | 해외 송금(Cloud) 프로세스 상세 정책 미확정      |
| `BANK-015`     | 구현 예정  | 해외 송금(On-Prem) 프로세스 상세 정책 미확정    |
| `BANK-016`     | 구현 예정  | 해외 송금 이상거래 탐지(On-Prem) 정책/룰셋 미확정 |

## API Catalog

| ID             | Name                 | Method | Path                                                     | Auth | Role   | Notes                         |
|----------------|----------------------|--------|----------------------------------------------------------|------|--------|-------------------------------|
| `AUTH-001`     | 회원가입 | POST | `/auth/signup` | X | PUBLIC | |
| `AUTH-002`     | 로그인 | POST | `/auth/login` | X | PUBLIC | |
| `AUTH-003`     | 로그아웃 | POST | `/auth/logout` | O | USER | 현재 `JSESSIONID` 서버 세션 무효화 |
| `AUTH-004`     | 이메일 인증번호 발송 | POST | `/auth/email-verifications` | X | PUBLIC | |
| `AUTH-005`     | 이메일 인증번호 확인 | POST | `/auth/email-verifications/confirm` | X | PUBLIC | |
| `AUTH-006`     | 세션 확인 | GET | `/auth/me` | X | PUBLIC | `JSESSIONID` 기준 로그인 세션 확인 |
| `USER-007`     | 회원 정보 조회 | GET | `/users` | O | USER | |
| `USER-008`     | 회원 정보 수정 | PATCH | `/users` | O | USER | |
| `USER-009`     | 회원 탈퇴 | POST | `/users` | O | USER | soft delete |
| `USER-010`     | 서류 제출 | POST   | `/users/documents` | O | USER | 최초 업로드는 2개 필수, 재업로드는 반려(REJECTED) 문서만 허용(2개 반려 시 2개 모두 필수) |
| `USER-011`     | Liveness 얼굴 인증 | POST | `/users/verifications/liveness` | O | USER | |
| `USER-012`     | 인증서 발급 | POST | `/users/verifications` | O | USER | |
| `USER-013`     | 알림 조회 | GET | `/users/notifications` | O | USER | |
| `USER-014`     | 보완 서류 목록 조회 | GET | `/users/documents/corrections` | O | USER | `missing` 필드를 `,` 기준으로 파싱해 리스트 반환 |
| `USER-015`     | 관리자 서류 심사 상태 변경 | PATCH | `/admin/users/{userId}/documents/{documentType}` | X | PUBLIC | `documentType`: `ALIEN_REGISTRATION_APPLICATION`/`RESIDENCE_PROOF`, `targetStatus`: `APPROVED`/`REJECTED` |
| `USER-016`     | Liveness 얼굴 인증       | POST   | `/users/verifications/liveness`                          | O    | USER   |                               |
| `USER-017`     | Liveness 결과 조회       | GET    | `/users/verifications/liveness/{sessionId}`              | O    | USER   |                               |
| `USER-018`     | Liveness 동일인 비교      | POST   | `/users/verifications/liveness/{sessionId}/face-match`   | O    | USER   |                               |
| `USER-019`     | Liveness 최종 확정       | POST   | `/users/verifications/liveness/{sessionId}/finalize`     | O    | USER   |                               |
| `USER-020`      | 신분증/여권 OCR 추출 | POST   | `/users/verifications/identity`                          | O    | USER   | `ocrDocumentType=PASSPORT|ID_CARD` |
| `USER-021`      | 외국인등록증 OCR 확정 검증 | POST   | `/users/verifications/identity/confirm`                  | O    | USER   | 사용자가 확인/수정한 ID_CARD OCR 값으로 Government DB 검증 |
| `WALLET-001`   | 월렛 계좌내역 조회           | GET    | `/wallet/transactions`                                   | O    | USER   |                               |
| `WALLET-002`   | 월렛 충전                | POST   | `/wallet/charges`                                        | O    | USER   |                               |
| `WALLET-003`   | 월렛 계좌 금액 차감(On-Prem) | POST   | `/wallet/charges/debit`                                  | O    | USER   |                               |
| `WALLET-004`   | 월렛 상태 조회 | GET | `/wallet/status` | O | USER | 월렛 페이지 화면 분기용 |
| `WALLET-005`   | 월렛 생성 | POST | `/wallet` | O | USER | |
| `WALLET-006`   | 월렛 요약 조회 | GET | `/wallet/summary` | O | USER | 충전/결제 화면 요약 정보 표시용 |
| `JOB-001`      | 구인구직 공고 목록 조회        | GET    | `/`                                                      | X    | PUBLIC | 도메인 prefix 하위 루트              |
| `JOB-002`      | 구인구직 공고 상세 조회        | GET    | `/{job_id}`                                              | X    | PUBLIC | 도메인 prefix 하위 경로              |
| `JOB-003`      | 지원서 작성 화면 초기 조회        | GET    | `/applications/form`                                     | O    | USER   | 로그인 사용자 이름/이메일 및 포트폴리오 목록 |
| `JOB-004`      | 지원서 제출               | POST   | `/{job_id}/applications`                                 | O    | USER   | multipart `body.portfolio_urls` + `files` |
| `JOB-005`      | 지원 내역 목록 조회          | GET    | `/applications`                                          | O    | USER   | 목록에는 포트폴리오 미포함           |
| `JOB-006`      | 지원 내역 포트폴리오 조회     | GET    | `/applications/{application_id}/portfolios`              | O    | USER   | 지원 건 클릭 시 포트폴리오 목록 조회 |
| `HOSPITAL-001` | 예약                   | POST   | `/reservations`                                          | O    | USER   | 요청 `hospital_id`, `reserved_at`, 응답 data는 null |
| `HOSPITAL-002` | 예약 내역 확인             | GET    | `/reservations`                                          | O    | USER   | 응답 `reservation_id`, `hospital_id`, `hospital_name`, `doctor_name`, `reserved_at`, `status` |
| `HOSPITAL-003` | 예약 취소                  | PATCH  | `/reservations/{reservation_id}`                         | O    | USER   | 요청 `action=CANCEL`, 응답 data는 null |
| `HOSPITAL-004` | 병원 목록 확인             | GET    | `/`                                                      | O    | USER   | `type` 쿼리 파라미터 선택 지원, day off는 일요일 고정 |
| `HOSPITAL-005` | 에이전트 호출              | TBD    | `TBD`                                                    | O    | USER   | API 경로/계약 미정                  |
| `CS-001`       | 화상 상담 신청             | POST   | `/consultations`                                         | O    | USER   |                               |
| `CS-002`       | 대기 고객 목록 조회          | GET    | `/consultations?status=WAITING`                          | X    | PUBLIC |                               |
| `CS-003`       | 화상 상담 상태 변경          | PATCH  | `/consultations/{cs_id}/status`                          | X    | PUBLIC | 상담 내역 저장 여부 논의                |
| `CS-004`       | 화상 상담 입장             | POST   | `/consultations/{cs_id}/join`                            | O    | USER   |                               |
| `BANK-001`     | 계좌 개설(Cloud)         | POST   | `/banking`                                               | O    | USER   |                               |
| `BANK-003`     | 계좌 이체(Cloud)         | POST   | `/banking/transfers`                                     | O    | USER   |                               |
| `BANK-004`     | 거래 내역 조회(Cloud)      | GET    | `/banking/{accountId}/transactions`                      | O    | USER   |                               |
| `BANK-005`     | 거래 내역 메모 수정(Cloud)   | PATCH  | `/banking/transactions/{transactionId}/memo`             | O    | USER   | 응답 data는 null                  |
| `BANK-006`     | 홈 계좌 정보 조회(Cloud)    | GET    | `/banking/home`                                          | O    | USER   |                               |
| `BANK-007`     | 해외 송금(Cloud)         | TBD    | `TBD`                                                    | O    | USER   | 프로세스 정의 중 (추후 작성)             |
| `BANK-008`     | 이체 사전 조회(Cloud) | POST | `/banking/transfers/preview` | O | USER | 내 계좌(account_ref) + 수취인(coreBanking) 통합 조회 |

## Naming and Contract Notes

- 경로 세그먼트는 소문자-kebab-case 또는 복수형 리소스 명사를 사용한다.
- 예약 리소스는 `hospital/reservations`로 고정한다.
- `wallet_transaction.transaction_flow`는 `DEPOSIT | WITHDRAWAL`만 사용한다.
- `application.status`는 `PASSED | FAILED | READ | UNREAD`만 사용한다.
- `WALLET-004` 응답의 `nextStep`은 `CREATE_ACCOUNT | WALLET_TERMS | WALLET_HOME`만 사용한다.
- `WALLET-006`은 화면 표시 목적의 `balance`, `linkedAccountNumber`만 반환한다.

## Docs Sync Rule

다음 변경이 발생하면 본 문서를 함께 갱신한다.

- 신규/삭제 API
- 경로/메서드/권한 변경
- 요청/응답 계약 변경
- 보류(`Hold`) 상태 변경

## BANK-003 계좌 이체(Cloud)

- Method: `POST`
- Path: `/banking/transfers`
- Auth: `O` (USER 세션 필수)
- Header: `Idempotency-Key`

Request
```json
{
  "withdrawAccountId": "1080863698115",
  "depositAccountId": "1002123456789",
  "transferAmount": 5000,
  "accountPassword": "1234"
}
```

## BANK-008 이체 사전 조회(Cloud)

- Method: `POST`
- Path: `/banking/transfers/preview`
- Auth: `O` (USER 세션 필수)

Request
```json
{
  "recipientBankCode": "BUSAN",
  "recipientAccountNumber": "1122261925003"
}
```

Response (200)
```json
{
  "success": true,
  "code": 20000,
  "message": "요청에 성공했습니다.",
  "data": {
    "myAccount": {
      "accountName": "우리SUPER주거래통장",
      "accountNumber": "1002867390781",
      "balance": 50000,
      "transferLimit": 300000,
      "userName": "홍길동"
    },
    "recipient": {
      "recipientName": "백민정"
    }
  }
}
```

## BANK-007 해외 송금 요청 생성(Cloud)

- Method: `POST`
- Path: `/banking/global-transactions`
- Auth: `O` (USER 세션 필수)

Request
```json
{
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
## BANK-006 홈 계좌 상태 조회(Cloud)

- Method: `GET`
- Path: `/banking/home`
- Auth: `O` (USER session required)
- Purpose: Return the user's certificate/account state for the NOVA home account panel.

State mapping

| Scenario | Backend decision source | `uiState` | `account` |
| --- | --- | --- | --- |
| Certificate not issued | `certificateStatus=NOT_ISSUED`, no account | `NEED_CERTIFICATE` | `null` |
| Certificate issuing | `certificateStatus=PENDING`, no account | `CERTIFICATE_ISSUING` | `null` |
| Certificate issued, no account | `certificateStatus=ISSUED`, no account | `READY_TO_OPEN_ACCOUNT` | `null` |
| Certificate issued, limited account | account exists | `HAS_ACCOUNT` | Account summary with `hasLimit=true` |
| Certificate issued, general account | account exists | `HAS_ACCOUNT` | Account summary with `hasLimit=false` |

Response (200, account exists)
```json
{
  "success": true,
  "code": 20000,
  "message": "Request succeeded.",
  "data": {
    "uiState": "HAS_ACCOUNT",
    "account": {
      "accountId": 2001,
      "accountName": "NOVA demand account",
      "accountNumber": "1002-312-345678",
      "bankName": "Woori Bank",
      "balance": 150000,
      "hasLimit": true
    },
    "has_notification": true
  }
}
```

Response (200, no account)
```json
{
  "success": true,
  "code": 20000,
  "message": "Request succeeded.",
  "data": {
    "uiState": "READY_TO_OPEN_ACCOUNT",
    "account": null,
    "has_notification": false
  }
}
```

Error Response (인증서 미발급)
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
- 현재 세션 사용자 기준으로 본인 계좌만 해외송금 요청에 사용할 수 있다.
- 백엔드는 프론트 요청 필드와 `account_ref` 등 백엔드 보유 정보를 조합해 CoreBanking `CB-008` API에 전달한다.
- 중복 요청 방지를 위해 백엔드는 CoreBanking에 전달할 `externalRequestId`를 생성하거나 클라이언트 멱등 키를 검증된 요청 식별자로 변환한다.
- 해외송금 원장 저장, 계좌 선출금, FDS 비동기 심사, 실패 시 환급은 CoreBanking에서 처리한다.
- `receiverDistrict`, `receiverZipCode`는 선택값이다.
- `receiverCity`는 필수값이다.

## BANK-009 해외 송금 목록 조회(Cloud)

- Method: `GET`
- Path: `/banking/global-transactions`
- Auth: `O` (USER 세션 필수)

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

Notes
- 프론트는 `customerId`를 직접 전달하지 않는다.
- 백엔드는 현재 세션 사용자와 연결된 CoreBanking 고객 식별자를 기준으로 `CB-012`를 호출한다.

## BANK-002 계좌 비밀번호 검증(Cloud)

## BANK-004 거래 내역 조회(Cloud)

- Method: `GET`
- Path: `/banking/{accountId}/transactions`
- Auth: `O` (USER 세션 필수)
- Sort: `sortDirection` 요청값 기준, 기본 `DESC`
- Pagination: Spring `Pageable`, 기본 `size=20`, 응답은 무한 스크롤용 Slice 형태(`hasNext`)로 제공

Query Parameters

| Name | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `period` | enum | N | `ONE_MONTH` | `ONE_WEEK`, `ONE_MONTH`, `CUSTOM` | 조회 기간 |
| `flow` | enum | N | `ALL` | `ALL`, `DEPOSIT`, `WITHDRAWAL` | 입출금 유형 |
| `from` | date | N | - | `yyyy-MM-dd` | `period=CUSTOM`일 때 시작일 |
| `to` | date | N | - | `yyyy-MM-dd` | `period=CUSTOM`일 때 종료일 |
| `keyword` | string | N | - | - | `counterParty`, `memo` 검색어 |
| `sortDirection` | enum | N | `DESC` | `ASC`, `DESC` | 거래일시 정렬 방향 |
| `page` | integer | N | `0` | `0..` | 페이지 번호 |
| `size` | integer | N | `20` | `1..` | 페이지 크기 |

Validation

- `period`가 `CUSTOM`이면 `from`, `to`가 모두 필요하다.
- `period`가 `CUSTOM`이 아니면 `from`, `to`를 함께 전달할 수 없다.
- `from`은 `to`보다 늦을 수 없다.

Response (200)

```json
{
  "success": true,
  "code": 20000,
  "message": "요청에 성공했습니다.",
  "data": {
    "accountId": 2001,
    "period": "ONE_MONTH",
    "flow": "ALL",
    "transactions": [
      {
        "transactionId": 1,
        "transactionFlow": "WITHDRAWAL",
        "transactionType": "ACCOUNT_TRANSFER",
        "counterParty": "PARK JAEHA",
        "amount": 10000,
        "balanceAfter": 90000,
        "memo": "생활비",
        "transactionDateTime": "2026-06-02T10:15:30"
      }
    ],
    "page": 0,
    "size": 20,
    "hasNext": false
  }
}
```

## USER-005 여권 인증

- Method: `POST`
- Path: `/users/verifications/passports`
- Auth: `O` (USER 세션 필수)
- Content-Type: `multipart/form-data`

Request
- `file`: 여권 이미지 파일 1개

Response (200)
```json
{
  "success": true,
  "code": "20000",
  "message": "요청에 성공했습니다.",
  "data": {
    "type": "P",
    "issueCountry": "KOR",
    "num": "M12345678",
    "surName": "KIM",
    "givenName": "GILDONG",
    "nationality": "KOREAN",
    "birthDate": "1990.01.01",
    "sex": "M",
    "issueDate": "2020.01.01",
    "expireDate": "2030.01.01",
    "authority": "MOFA"
  }
}
```

## USER-020 신분증/여권 OCR 추출

- Method: `POST`
- Path: `/users/verifications/identity`
- Auth: `O` (USER 세션 필수)
- Content-Type: `multipart/form-data`

Request
- `file`: OCR 대상 이미지 파일 1개
- `ocrDocumentType`: `PASSPORT` | `ID_CARD`

Response (ID_CARD 성공 예시)
```json
{
  "success": true,
  "code": "20000",
  "message": "요청에 성공했습니다.",
  "data": {
    "ocrDocumentType": "ID_CARD",
    "result": {
      "name": "홍길동",
      "residentRegistrationNumber": "900101-1234567",
      "issueDate": "2020.01.01"
    },
    "nameMatchWithUser": null
  }
}
```

Error Response
```json
{
  "success": false,
  "code": "USER-009",
  "message": "여권 OCR을 위한 이미지 파일이 필요합니다."
}
```

## USER-021 외국인등록증 OCR 확정 검증

- Method: `POST`
- Path: `/users/verifications/identity/confirm`
- Auth: `O` (USER 세션 필수)
- Content-Type: `application/json`

Request
```json
{
  "ocrDocumentType": "ID_CARD",
  "name": "홍길동",
  "residentRegistrationNumber": "900101-1234567",
  "issueDate": "2020.01.01"
}
```

처리 규칙:
- `residentRegistrationNumber`는 backend 내부에서 숫자만 남기도록 정규화한 뒤 HMAC-SHA256 해시로 변환해 Government DB 조회 키로 사용한다.
- `backend -> gateway` 요청에는 원문 식별번호를 포함하지 않는다.
- 사용자 이름 및 Government DB 이름/발급일/active 여부가 일치하면 외국인등록증 등록을 완료한다.

Response (검증 성공 예시)
```json
{
  "success": true,
  "code": "20000",
  "message": "요청에 성공했습니다.",
  "data": {
    "ocrDocumentType": "ID_CARD",
    "nameMatchWithUser": true,
    "identityMatchWithGovDb": true,
    "verificationStatus": "VERIFIED",
    "failureReasonCode": null
  }
}
```

```json
{
  "success": false,
  "code": "USER-010",
  "message": "여권 OCR 설정이 필요합니다."
}
```

```json
{
  "success": false,
  "code": "USER-013",
  "message": "여권 OCR 처리에 실패했습니다."
}
```

```json
{
  "success": false,
  "code": "USER-014",
  "message": "사진이 올바르지 않습니다."
}
```

## BANK-001 계좌 개설(Cloud)

- Method: `POST`
- Path: `/banking`
- Auth: `O` (USER 세션 필수)
- 선행 조건: `user.certificate_status=ISSUED` (인증서 발급 완료 상태)
- 오류 전달 규칙: coreBanking 비즈니스 오류(예: `ACCOUNT-*`)는 backend가 동일 `code/message`로 전달하고, 실제 통신 장애일 때만 `BANK-003`을 반환한다.

Request
```json
{
  "accountType": "DEMAND_DEPOSIT",
  "accountName": "우리 SUPER주거래 통장",
  "customerInfo": {
    "address": "서울특별시 광진구 능동로 120",
    "addressDetail": "건국대학교 기숙사 101호"
  },
  "job": "STUDENT",
  "transactionInfo": {
    "purpose": "SALARY_AND_LIVING_EXPENSES",
    "source": "EARNED_AND_PENSION_INCOME"
  },
  "hasForeignTax": false,
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

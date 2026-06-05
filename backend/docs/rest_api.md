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

| ID         | Name                 | Method | Path                                                     | Auth | Role   | Notes                         |
|------------|----------------------|--------|----------------------------------------------------------|------|--------|-------------------------------|
| `AUTH-001` | 회원가입 | POST | `/auth/signup` | X | PUBLIC | |
| `AUTH-002` | 로그인 | POST | `/auth/login` | X | PUBLIC | |
| `AUTH-003` | 로그아웃 | POST | `/auth/logout` | O | USER | 현재 `JSESSIONID` 서버 세션 무효화 |
| `AUTH-004` | 이메일 인증번호 발송 | POST | `/auth/email-verifications` | X | PUBLIC | |
| `AUTH-005` | 이메일 인증번호 확인 | POST | `/auth/email-verifications/confirm` | X | PUBLIC | |
| `AUTH-006` | 세션 확인 | GET | `/auth/me` | X | PUBLIC | `JSESSIONID` 기준 로그인 세션 확인 |
| `USER-001` | 회원 정보 조회 | GET | `/users` | O | USER | |
| `USER-002` | 회원 정보 수정 | PATCH | `/users` | O | USER | |
| `USER-003` | 회원 탈퇴 | POST | `/users` | O | USER | soft delete |
| `USER-004` | 서류 제출 | POST   | `/users/documents` | O | USER | 최초 업로드는 2개 필수, 재업로드는 반려(REJECTED) 문서만 허용(2개 반려 시 2개 모두 필수) |
| `USER-005` | 여권 인증 | POST | `/users/verifications/passports` | O | USER | |
| `USER-006` | Liveness 얼굴 인증 | POST | `/users/verifications/liveness` | O | USER | |
| `USER-007` | 인증서 발급 | POST | `/users/verifications` | O | USER | |
| `USER-008` | 알림 조회 | GET | `/users/notifications` | O | USER | |
| `USER-009` | 보완 서류 목록 조회 | GET | `/users/documents` | O | USER | |
| `USER-010` | 관리자 서류 심사 상태 변경 | PATCH | `/admin/users/{userId}/documents/{documentType}` | X | PUBLIC | `documentType`: `ALIEN_REGISTRATION_APPLICATION`/`RESIDENCE_PROOF`, `targetStatus`: `APPROVED`/`REJECTED` |
| `USER-011` | Liveness 얼굴 인증       | POST   | `/users/verifications/liveness`                          | O    | USER   |                               |
| `USER-012` | Liveness 결과 조회       | GET    | `/users/verifications/liveness/{sessionId}`              | O    | USER   |                               |
| `USER-013` | Liveness 동일인 비교      | POST   | `/users/verifications/liveness/{sessionId}/face-match`   | O    | USER   |                               |
| `USER-014` | Liveness 최종 확정       | POST   | `/users/verifications/liveness/{sessionId}/finalize`     | O    | USER   |                               |
| `WALLET-001`   | 월렛 계좌내역 조회           | GET    | `/wallet/transactions`                                   | O    | USER   |                               |
| `WALLET-002`   | 월렛 충전                | POST   | `/wallet/charges`                                        | O    | USER   |                               |
| `WALLET-003`   | 월렛 계좌 금액 차감(On-Prem) | POST   | `/wallet/charges/debit`                                  | O    | USER   |                               |
| `WALLET-004`   | 월렛 상태 조회 | GET | `/wallet/status` | O | USER | 월렛 페이지 화면 분기용 |
| `WALLET-005`   | 월렛 생성 | POST | `/wallet` | O | USER | |
| `JOB-001`      | 구인구직 공고 목록 조회        | GET    | `/`                                                      | X    | PUBLIC | 도메인 prefix 하위 루트              |
| `JOB-002`      | 구인구직 공고 상세 조회        | GET    | `/{job_id}`                                              | X    | PUBLIC | 도메인 prefix 하위 경로              |
| `JOB-003`      | 지원서 제출               | POST   | `/{job_id}/applications`                                 | O    | USER   | 도메인 prefix 하위 경로              |
| `JOB-004`      | 지원 내역 목록 조회          | GET    | `/applications`                                          | O    | USER   | 도메인 prefix 하위 경로              |
| `HOSPITAL-001` | 예약                   | POST   | `/reservations`                                          | O    | USER   |                               |
| `HOSPITAL-002` | 예약 내역 확인             | GET    | `/{user_id}/reservations`                                | O    | USER   |                               |
| `HOSPITAL-003` | 예약 취소 & 변경           | PATCH  | `/reservations/{reservation_id}`                         | O    | USER   | action enum=`CANCEL`,`CHANGE` |
| `HOSPITAL-004` | 병원 목록 확인             | GET    | `/`                                                      | O    | USER   | day off는 일요일 고정               |
| `HOSPITAL-005` | 에이전트 호출              | TBD    | `TBD`                                                    | O    | USER   | API 경로/계약 미정                  |
| `CS-001`       | 화상 상담 신청             | POST   | `/consultations`                                         | O    | USER   |                               |
| `CS-002`       | 대기 고객 목록 조회          | GET    | `/consultations?status=WAITING`                          | X    | PUBLIC |                               |
| `CS-003`       | 화상 상담 상태 변경          | PATCH  | `/consultations/{cs_id}/status`                          | X    | PUBLIC | 상담 내역 저장 여부 논의                |
| `CS-004`       | 화상 상담 입장             | POST   | `/consultations/{cs_id}/join`                            | O    | USER   |                               |
| `BANK-001`     | 계좌 개설(Cloud)         | POST   | `/banking`                                               | O    | USER   |                               |
| `BANK-002`     | 계좌 비밀번호 검증(Cloud)    | POST   | `/banking/{accountId}/password/verify`                   | O    | USER   |                               |
| `BANK-003`     | 계좌 이체(Cloud)         | POST   | `/banking/transfers`                                     | O    | USER   |                               |
| `BANK-004`     | 거래 내역 조회(Cloud)      | GET    | `/banking/{accountId}/transactions`                      | O    | USER   |                               |
| `BANK-005`     | 거래 내역 메모 수정(Cloud)   | PATCH  | `/banking/{accountId}/transactions/{transactionId}/memo` | O    | USER   |                               |
| `BANK-006`     | 홈 계좌 정보 조회(Cloud)    | GET    | `/banking/home`                                          | O    | USER   |                               |
| `BANK-007`     | 해외 송금 요청 생성(Cloud) | POST | `/banking/global-transactions` | O | USER | CoreBanking에 해외송금 생성 요청 전달 |
| `BANK-008`     | 이체 사전 조회(Cloud) | POST | `/banking/transfers/preview` | O | USER | 내 계좌(account_ref) + 수취인(coreBanking) 통합 조회 |
| `BANK-009`     | 해외 송금 목록 조회(Cloud) | GET | `/banking/global-transactions` | O | USER | 현재 세션 사용자 본인 목록만 조회 |

## Naming and Contract Notes

- 경로 세그먼트는 소문자-kebab-case 또는 복수형 리소스 명사를 사용한다.
- 예약 리소스는 `hospital/reservations`로 고정한다.
- `wallet_transaction.transaction_flow`는 `DEPOSIT | WITHDRAWAL`만 사용한다.
- `application.status`는 `PASSED | FAILED | READ | UNREAD`만 사용한다.
- `WALLET-004` 응답의 `nextStep`은 `CREATE_ACCOUNT | WALLET_TERMS | WALLET_HOME`만 사용한다.

## Docs Sync Rule

다음 변경이 발생하면 본 문서를 함께 갱신한다.

- 신규/삭제 API
- 경로/메서드/권한 변경
- 요청/응답 계약 변경
- 보류(`Hold`) 상태 변경

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
      "accountNumber": "1002867390781"
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

- Method: `POST`
- Path: `/banking/password/verify`
- Auth: `O` (USER 세션 필수)

Request
```json
{
  "accountId": 1,
  "accountPassword": "1234"
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

Error Response
```json
{
  "success": false,
  "code": "USER-009",
  "message": "여권 OCR을 위한 이미지 파일이 필요합니다."
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

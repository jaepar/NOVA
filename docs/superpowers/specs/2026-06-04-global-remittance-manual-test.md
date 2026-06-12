# 해외송금 수동 통합 테스트 절차서

## 목적

이 문서는 `fds-server -> coreBanking -> backend` 흐름으로 구현된 해외송금 기능을 로컬에서 수동으로 검증하기 위한 절차를 정리한다.

검증 범위는 다음과 같다.

- FDS 서버 단독 심사 동작
- CoreBanking 해외송금 생성, 상태 조회, 목록 조회
- FDS 결과에 따른 `PENDING -> SUCCESS | FAILED` 상태 전이
- `FAILED` 시 환급 반영 여부
- Backend 사용자 API 연동 여부

## 사전 조건

- `fds`, `coreBanking`, `backend`의 최신 코드가 반영되어 있어야 한다.
- 로컬 DB와 Redis가 실행 중이어야 한다.
- 테스트에 사용할 사용자, 고객, 계좌, `account_ref` 데이터가 준비되어 있어야 한다.
- 출금 계좌는 `krwAmount` 이상 잔액을 보유해야 한다.

## 로컬 포트 주의사항

로컬 기본 포트는 아래와 같다.

- `backend`: `8000`
- `coreBanking`: `8001`

따라서 FDS 서버를 기본 포트 `8001`로 띄우면 CoreBanking과 충돌한다. 로컬 테스트에서는 FDS를 `8003`으로 실행하고, CoreBanking에 `FDS_BASE_URL=http://localhost:8003`를 주는 방식을 사용한다.

## 1. FDS 서버 실행

PowerShell에서 아래 명령을 실행한다.

```powershell
cd C:\Users\3-33\OneDrive\Desktop\NOVA\fds
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8003
```

확인 주소:

- Swagger UI: `http://localhost:8003/docs`
- OpenAPI JSON: `http://localhost:8003/openapi.json`

## 2. CoreBanking 실행

새 PowerShell 창에서 아래 명령을 실행한다.

```powershell
cd C:\Users\3-33\OneDrive\Desktop\NOVA\coreBanking
$env:FDS_BASE_URL='http://localhost:8003'
.\gradlew.bat bootRun --args='--spring.profiles.active=local'
```

확인 주소:

- CoreBanking Base URL: `http://localhost:8001`

## 3. Backend 실행

새 PowerShell 창에서 아래 명령을 실행한다.

```powershell
cd C:\Users\3-33\OneDrive\Desktop\NOVA\backend
$env:CORE_BANKING_BASE_URL='http://localhost:8001'
.\gradlew.bat bootRun --args='--spring.profiles.active=local'
```

확인 주소:

- Backend Base URL: `http://localhost:8000`

## 4. FDS 단독 테스트

### 4-1. 정상 후보 요청

아래 요청은 비교적 정상 거래에 가까운 예시다.

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8003/fds/global-transactions/screenings `
  -ContentType "application/json" `
  -Body '{
    "globalTransactionId": 1,
    "customerId": 1001,
    "accountId": 2001,
    "remitPurpose": "생활비 송금",
    "targetCountry": "US",
    "currency": "USD",
    "remitAmount": "1000.00",
    "mediaryFeePayer": "SENDER",
    "exchangeRate": 1380.5,
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
  }'
```

기대 결과:

- 응답 코드 `200`
- `status`가 `SUCCESS` 또는 `FAILED`
- `anomalyScore`, `threshold` 필드 포함

### 4-2. 실패 후보 요청

아래 요청은 매우 큰 금액과 비정상 환율을 사용해 이상치 가능성을 높인 예시다.

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8003/fds/global-transactions/screenings `
  -ContentType "application/json" `
  -Body '{
    "globalTransactionId": 2,
    "customerId": 1001,
    "accountId": 2001,
    "remitPurpose": "고위험 테스트",
    "targetCountry": "US",
    "currency": "USD",
    "remitAmount": "999999.00",
    "mediaryFeePayer": "SENDER",
    "exchangeRate": 9999.9,
    "krwAmount": "999999999",
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
  }'
```

기대 결과:

- `status = FAILED`
- `failureReason = FDS_RISK_DETECTED`

## 5. CoreBanking 직접 통합 테스트

### 5-1. 성공 후보 해외송금 생성

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8001/global-transactions `
  -ContentType "application/json" `
  -Body '{
    "externalRequestId": "global-remittance-success-001",
    "customerId": 1001,
    "accountId": 2001,
    "remitPurpose": "생활비 송금",
    "targetCountry": "US",
    "currency": "USD",
    "remitAmount": "1000.00",
    "mediaryFeePayer": "SENDER",
    "exchangeRate": "1380.500000",
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
  }'
```

기대 결과:

- 즉시 응답에서 `status = PENDING`
- 응답에 `globalTransactionId` 존재
- 사용자는 FDS 완료를 기다리지 않고 응답을 받음

### 5-2. 상태 조회

위 응답의 `globalTransactionId`가 `1`이라고 가정하면 아래와 같이 조회한다.

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri http://localhost:8001/global-transactions/1
```

초기 기대 결과:

- `status = PENDING`

몇 초 후 재조회 기대 결과:

- `status = SUCCESS` 또는 `FAILED`

### 5-3. 고객 기준 목록 조회

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:8001/global-transactions?customerId=1001"
```

기대 결과:

- 배열 응답
- 각 항목에 `globalTransactionId`, `receiverEngName`, `remitAmount`, `currency`, `status`, `createdAt` 존재

### 5-4. 실패 후보 해외송금 생성

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8001/global-transactions `
  -ContentType "application/json" `
  -Body '{
    "externalRequestId": "global-remittance-failed-001",
    "customerId": 1001,
    "accountId": 2001,
    "remitPurpose": "고위험 테스트",
    "targetCountry": "US",
    "currency": "USD",
    "remitAmount": "999999.00",
    "mediaryFeePayer": "SENDER",
    "exchangeRate": "9999.900000",
    "krwAmount": "999999999",
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
  }'
```

기대 결과:

- 즉시 응답은 여전히 `PENDING`
- 잠시 후 상태 조회 시 `FAILED`
- 실패 사유가 `FDS_RISK_DETECTED` 또는 통신 실패 계열 사유로 저장됨

## 6. 환급 검증 포인트

실패 후보 요청 전후로 아래를 확인한다.

- 출금 계좌 잔액이 생성 시점에 먼저 차감되는지
- FDS `FAILED` 이후 동일 금액이 다시 환급되는지
- 환급 거래가 `GLOBAL_REMITTANCE_REFUND` 유형으로 저장되는지

권장 확인 순서:

1. 테스트 전 계좌 잔액 기록
2. 실패 후보 해외송금 생성 직후 잔액 확인
3. 상태가 `FAILED`로 바뀐 뒤 잔액 재확인

기대 결과:

- 생성 직후: `krwAmount`만큼 감소
- 실패 처리 후: 원래 잔액으로 복구

## 7. 중복 요청 검증

동일한 `externalRequestId` 또는 `Idempotency-Key`로 같은 요청을 두 번 보낸다.

CoreBanking 직접 테스트 예시:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8001/global-transactions `
  -ContentType "application/json" `
  -Body '{
    "externalRequestId": "global-remittance-dup-001",
    "customerId": 1001,
    "accountId": 2001,
    "remitPurpose": "중복 테스트",
    "targetCountry": "US",
    "currency": "USD",
    "remitAmount": "1000.00",
    "mediaryFeePayer": "SENDER",
    "exchangeRate": "1380.500000",
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
  }'
```

같은 요청을 다시 한 번 보낸다.

기대 결과:

- 두 번째 요청에서도 새 해외송금 원장이 생기지 않음
- 추가 선출금이 발생하지 않음
- 같은 `globalTransactionId` 또는 동일 처리 결과를 반환

## 8. Backend 사용자 API 테스트

Backend API는 로그인 세션이 필요하다. 따라서 아래 두 방식 중 하나로 테스트한다.

- 프론트에서 로그인 후 브라우저 기반으로 호출
- 유효한 세션 쿠키를 확보한 뒤 API 도구로 호출

### 8-1. 해외송금 생성

```http
POST http://localhost:8000/banking/global-transactions
Idempotency-Key: global-remittance-user-001
Cookie: JSESSIONID=...
Content-Type: application/json
```

```json
{
  "accountId": 2001,
  "remitPurpose": "생활비 송금",
  "targetCountry": "US",
  "currency": "USD",
  "remitAmount": "1000.00",
  "mediaryFeePayer": "SENDER",
  "exchangeRate": "1380.500000",
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

기대 결과:

- `200 OK`
- `data.globalTransactionId` 존재
- `data.status = PENDING`

### 8-2. 사용자 기준 목록 조회

```http
GET http://localhost:8000/banking/global-transactions
Cookie: JSESSIONID=...
```

기대 결과:

- 로그인 사용자 본인의 해외송금 목록만 반환
- 각 항목에 `globalTransactionId`, `receiverEngName`, `remitAmount`, `currency`, `status`, `createdAt` 존재

## 9. 장애 테스트

### 9-1. FDS 서버 종료 후 해외송금 요청

FDS 서버를 중지한 뒤 CoreBanking 또는 Backend를 통해 해외송금을 요청한다.

기대 결과:

- 최초 생성 응답은 `PENDING`
- 이후 상태가 `FAILED`로 변경
- 실패 사유는 `FDS_COMMUNICATION_FAILED` 또는 재시도 정책 반영 사유
- 선출금 금액은 환급됨

## 10. 확인 체크리스트

- [ ] FDS 서버 단독 호출이 가능하다.
- [ ] CoreBanking 해외송금 생성 시 즉시 `PENDING`을 반환한다.
- [ ] 상태 조회 시 `PENDING -> SUCCESS | FAILED`로 전이된다.
- [ ] `FAILED` 시 환급이 반영된다.
- [ ] 동일 멱등키 재요청 시 추가 출금이 없다.
- [ ] Backend 목록 조회는 로그인 사용자 본인 데이터만 반환한다.
- [ ] 로컬에서 FDS와 CoreBanking 포트 충돌 없이 실행된다.

# FDS REST API

FDS 서버는 On-Premise 환경에서 사용하는 Python 기반 이상거래 탐지 서버다. CoreBanking 서버가 해외송금 원장을 저장한 뒤 비동기 REST Client로 FDS API를 호출한다.

## Common Rules

- FDS API는 사용자 직접 호출을 가정하지 않고 CoreBanking 서버 간 호출만 허용한다.
- FDS는 CoreBanking 원장을 직접 수정하지 않는다.
- FDS는 해외송금 원장 스냅샷을 심사하고 `SUCCESS` 또는 `FAILED` 판정만 반환한다.
- 실제 상태 변경, 출금 금액 환급, 실패 사유 저장은 CoreBanking에서 처리한다.
- 민감정보와 계좌번호 전체는 로그에 남기지 않는다.

## API Catalog

| ID | Name | Method | Path | Auth | Notes |
|---|---|---|---|---|---|
| `FDS-001` | 해외송금 이상거래 심사 | POST | `/fds/global-transactions/screenings` | O | Isolation Forest 기반 1차 게이트웨이 심사 |

## FDS-001 해외송금 이상거래 심사

- Method: `POST`
- Path: `/fds/global-transactions/screenings`
- Auth: `O` (CoreBanking 서버 간 호출)

Request
```json
{
  "globalTransactionId": 1,
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
  "globalTransactionId": 1,
  "status": "FAILED",
  "failureReason": "FDS_RISK_DETECTED",
  "anomalyScore": -0.34,
  "threshold": -0.2
}
```

Response Rules
- `status`는 `SUCCESS | FAILED`만 반환한다.
- `SUCCESS`일 때 `failureReason`은 `null`로 반환한다.
- `FAILED`일 때 `failureReason`은 `FDS_RISK_DETECTED`를 반환한다.
- `anomalyScore`와 `threshold`는 모델 판정 근거 확인용이며, CoreBanking 상태 변경 기준은 `status`와 `failureReason`이다.
- `receiverDistrict`, `receiverZipCode`는 선택값이다.
- `receiverCity`는 필수값이다.

Model Rules
- 초기 버전은 `global_transaction` 전체 필드를 입력으로 받는다.
- 추후 모델 성능 튜닝 결과에 따라 입력 필드를 축소할 수 있다.
- Isolation Forest 점수가 지정 임계값보다 위험하면 `FAILED`로 판정한다.

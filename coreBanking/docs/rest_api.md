# REST API (On-Prem Only)

coreBanking 서버는 On-Prem 계정계 Open API(BaaS) 역할을 수행한다.  
본 문서는 전달받은 API 명세 중 **On-Prem** 항목만 정의한다.

## Common Rules

- 인증 방식은 서버 간 인증(내부망/전용 연동) 기준으로 운영한다.
- 모든 응답은 coreBanking 공통 응답 래퍼를 사용한다.
- 원장 변경 API는 중복 방지를 위해 요청 식별자(`transferRequestId` 등)를 사용한다.
- 컨트롤러는 DTO만 입출력하고 엔티티 직접 반환을 금지한다.

## Role Rules

| Role | Meaning |
|---|---|
| `AUTHORIZED` | 연동된 내부 서비스/권한 토큰 필요 |

## API Catalog

| ID | Name | Method | Path | Auth | Role | Notes |
|---|---|---|---|---|---|---|
| `CB-001` | 계좌 개설(On-Prem) | POST | `/core-banking` | O | AUTHORIZED | |
| `CB-002` | 계좌 비밀번호 검증(On-Prem) | POST | `/core-banking/{accountId}/password/verify` | O | AUTHORIZED | |
| `CB-003` | 계좌 이체(On-Prem) | POST | `/core-banking/transfers` | O | AUTHORIZED | |
| `CB-004` | 이체 처리 결과 조회(On-Prem) | GET | `/core-banking/transfers/{transferRequestId}` | O | AUTHORIZED | 중복 요청 방지용 결과 조회 |
| `CB-005` | 거래 내역 조회(On-Prem) | GET | `/core-banking/{accountId}/transactions` | O | AUTHORIZED | |
| `CB-006` | 거래 내역 메모 수정(On-Prem) | PATCH | `/core-banking/{accountId}/transactions/{transactionId}/memo` | O | AUTHORIZED | |
| `CB-007` | 홈 계좌 정보 조회(On-Prem) | GET | `/core-banking/home` | O | AUTHORIZED | |
| `CB-008` | 해외 송금(On-Prem) | TBD | `TBD` | O | AUTHORIZED | 명세 상세 확정 후 반영 |
| `CB-009` | 해외 송금 이상거래 탐지(On-Prem) | TBD | `TBD` | O | AUTHORIZED | FDS 연동 정책/룰셋 확정 후 반영 |

## Hold Policy

| API ID | Status | Reason |
|---|---|---|
| `CB-008` | 구현 예정 | 해외 송금 프로세스/입출력 계약 미확정 |
| `CB-009` | 구현 예정 | 이상거래 탐지 연동(FDS) 정책 미확정 |

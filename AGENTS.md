# NOVA

외국인 대상 비대면 금융/생활 밀착 서비스.
핵심 목표: 비대면 신원 인증 기반 임시 제한 계좌 개설, 최소 금융 기능, 생활 서비스 연계를 통해 외국인들의 외국인등록증 발급 전 금융 공백 해소.

## Repository Structure

```mermaid
flowchart TD
    Root["NOVA"]
    Root --> FE["frontend<br/>Web/Mobile UI"]
    Root --> BE["backend<br/>Spring Boot API"]
    Root --> AI["ai-server<br/>FastAPI Hospital Reservation Chatbot Server"]
    Root --> CB["core-banking-gateway<br/>On-Prem Core Banking Bridge"]
```

Sub-project relations:

```mermaid
flowchart LR
    FE["Frontend"] -->|"HTTPS REST"| BE["Backend API"]
    BE -->|"HTTP API"| AI["AI Server (FastAPI)"]
    BE -->|"Secure tunnel / private link"| CBG["Core Banking Gateway"]
    CBG -->|"Internal protocol"| CBS["Core Banking Server"]
    CBS --> CBD[("Core Banking DB")]

    BE --> RDS[("Amazon RDS MySQL")]
    BE --> Redis[("ElastiCache Redis")]
    AI --> S3[("Amazon S3")]
```

## Deploy Diagram

```mermaid
flowchart TD
    Dev["Developer"] -->|"Git push"| Repo["GitHub"]
    Repo --> GA["GitHub Actions"]

    User["User"] --> DNS["Route 53"]
    DNS --> ALB["ALB"]

    GA --> FEDeploy["Frontend Deploy"]
    FEDeploy --> FEHost["Vercel or Static Hosting"]

    GA --> BEDeploy["Backend Deploy"]
    BEDeploy --> BEBlue["Backend Blue"]
    BEDeploy --> BEGreen["Backend Green"]

    GA --> AIDeploy["AI Deploy (Single)"]
    AIDeploy --> AISingle["AI Server"]

    ALB --> BEBlue
    ALB --> BEGreen

    BEBlue --> RDSPrimary[("RDS Primary")]
    BEGreen --> RDSPrimary
    RDSPrimary --> RDSStandby[("RDS Standby")]

    BEBlue --> Redis["ElastiCache Redis"]
    BEGreen --> Redis

    BEBlue --> Tunnel["Tunneling"]
    BEGreen --> Tunnel
    Tunnel --> CBGW["On-Prem Core Banking Gateway"]
```

## Operations Diagram

```mermaid
flowchart TD
    User["User"] --> FE["Frontend"]
    FE --> API["Backend API"]

    API --> Auth["KYC/Account Validation"]
    API --> Wallet["Wallet / Transfer / History"]
    API --> NonFin["Job / Hospital"]

    Auth --> AIServer["AI Server\nOCR + Liveness + Face Match"]
    NonFin --> AIChat["AI Hospital Reservation Agent\n(FastAPI Chatbot)"]
    AIChat --> HospitalApi["Hospital Reservation API Orchestration"]
    AIServer --> S3["S3 Object Storage"]

    API --> Redis["Redis Cache"]
    API --> DB["RDS MySQL"]

    API --> Tunnel["Private Tunnel"]
    Tunnel --> CBG["Core Banking Gateway"]
    CBG --> CBS["Core Banking Server"]
    CBS --> CBD[("Core Banking DB")]

    CBG --> Gov[("Government/Verification DB")]
    CBG --> FDS["FDS Server"]
```

## Monorepo Golden Rules

### Immutable
- 모든 금융 거래는 백엔드 도메인 서비스에서만 처리한다. 프론트/AI 서버(FastAPI 챗봇 포함)에서 금액 확정 로직을 수행하지 않는다.
- 계좌 개설/송금/해외송금은 인증 상태(KYC, 신분증, liveness) 검증 없이 진행할 수 없다.
- 원장성 데이터(거래내역, 잔액, 계좌상태)는 Core Banking 응답과 백엔드 상태가 불일치하면 실패 처리한다.
- 비밀정보(API 키, 인증서, 터널링 자격증명, DB 계정)는 코드/로그에 남기지 않는다.

### Do
- 계약 우선: FE-BE, BE-AI(FastAPI), BE-CoreBanking 간 API 스펙을 먼저 고정하고 구현한다.
- 장애 격리: Core Banking 연동 실패 시 재시도 정책과 보상 흐름을 명시한다.
- 감사 추적: 인증/이체/계좌개설 단계는 모두 추적 가능한 이벤트 로그를 남긴다.
- 다국어 UX를 고려해 메시지 키 기반 응답을 우선한다.

### Don't
- Core Banking 연동 모듈에서 임의 비즈니스 규칙을 추가하지 않는다.
- 인증 우회 플래그(예: `skipKyc=true`)를 운영 경로에 추가하지 않는다.
- 거래 성공 전에 잔액 UI를 낙관적으로 확정하지 않는다.

## Operational Commands

- Backend build: `bash ./backend/gradlew -p ./backend clean build`
- Backend run: `bash ./backend/gradlew -p ./backend bootRun`
- Backend test: `bash ./backend/gradlew -p ./backend test`
- AI server run (FastAPI): `cd ai-server && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- Frontend run: `cd frontend && <project-specific run command>`
- Integration check: `backend` 기동 후 `frontend`에서 인증/지갑/이체 핵심 시나리오를 수동 점검

## Agent Routing

- 백엔드 도메인/엔티티/트랜잭션 수정: `backend` 규칙 파일 우선 적용.
- UI/UX/상태관리 수정: `frontend` 규칙 파일 우선 적용.
- 병원 예약 챗봇/에이전트 로직(FastAPI) 수정: `ai-server` 규칙 파일 우선 적용.
- 코어뱅킹 인터페이스/터널링/프로토콜 수정: `core-banking-gateway` 규칙 파일 우선 적용.

## Maintenance Policy

- 이 문서와 실제 코드/인프라가 달라지면, 기능 변경 PR에 `AGENT.md` 또는 하위 규칙 파일 동시 업데이트를 포함한다.
- 하위 모듈 규칙과 충돌 시, 더 하위 디렉토리의 규칙을 우선 적용한다.

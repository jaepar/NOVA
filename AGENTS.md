# NOVA

외국인 대상 비대면 금융/생활 밀착 서비스.
핵심 목표: 비대면 신원 인증 기반 임시 제한 계좌 개설, 최소 금융 기능, 생활 서비스 연계를 통해 외국인들의 외국인등록증 발급 전 금융 공백 해소 및 생활 정착 보조.

## Repository Structure

```mermaid
flowchart TD
    Root["NOVA"]
    Root --> FE["frontend<br/>Web/Mobile UI"]
    Root --> BE["backend<br/>Spring Boot API"]
    Root --> AI["ai-server<br/>FastAPI"]
    Root --> CB["On-Premise-Server<br/>Core Banking Server<br/>FDS Server<br/>Goverment DB"]
```

Sub-project relations:

```mermaid
flowchart LR
    FE["Frontend (Vercel)"] -->|"HTTPS REST"| BE["Backend API"]
    BE -->|"HTTP API"| AI["AI Server (FastAPI)"]
    BE -->|"Private routing via Transit Gateway"| CBG["On-Prem Core Banking Gateway"]
    CBG -->|"Internal protocol"| CBS["On-Prem Core Banking Server"]
    CBS --> CBD[("On-Prem Core Banking DB")]

    BE --> RDS[("Amazon RDS MySQL")]
    BE --> Redis[("ElastiCache Redis (Primary/Replica)")]
    BE --> S3[("Amazon S3")]
    CBG --> Gov[("Government DB (On-Prem)")]
    CBS --> FDS["FDS Server (On-Prem)"]
```

## Deploy Diagram

```mermaid
flowchart TD
    Dev["Developer"] --> Bastion["EC2 Bastion Host (Public Subnet)"]

    User["User"] --> Vercel["Vercel"]
    Vercel --> DNS["Amazon Route 53"]
    DNS --> WAF["AWS WAF"]
    WAF --> ALB["ALB"]

    ALB --> BEAZ1["Backend Server (AZ1 / Private App Subnet)"]
    ALB --> BEAZ2["Backend Server (AZ2 / Private App Subnet)"]
    ALB --> AIAZ1["AI Server (AZ1 / Private App Subnet)"]
    ALB --> AIAZ2["AI Server (AZ2 / Private App Subnet)"]

    Bastion --> BEAZ1
    Bastion --> BEAZ2
    Bastion --> AIAZ1
    Bastion --> AIAZ2

    BEAZ1 --> RDSProxy["RDS Proxy"]
    BEAZ2 --> RDSProxy
    RDSProxy --> RDSPrimary[("Amazon RDS (Primary)")]
    RDSProxy --> RDSStandby[("Amazon RDS (Standby / Multi-AZ Failover)")]

    BEAZ1 --> RedisPrimary[("ElastiCache for Redis Primary")]
    BEAZ2 --> RedisPrimary
    RedisPrimary --> RedisReplica[("ElastiCache for Redis Replica")]

    BEAZ1 --> TGW["AWS Transit Gateway"]
    BEAZ2 --> TGW
    AIAZ1 --> TGW
    AIAZ2 --> TGW

    TGW --> OnPremGW["On-Prem Core Banking Gateway"]
    OnPremGW --> OnPremCBS["On-Prem Core Banking Server"]
    OnPremCBS --> OnPremDB[("On-Prem Core Banking DB")]
    OnPremGW --> GovDB[("Government DB (On-Prem)")]
    OnPremCBS --> FDS["FDS Server (On-Prem)"]

    BEAZ1 --> S3["Amazon S3"]
    BEAZ2 --> S3
    AIAZ1 --> S3
    AIAZ2 --> S3
```

## Operations Diagram

```mermaid
flowchart TD
    User["User"] --> FE["Frontend"]
    FE --> API["Backend API"]

    API --> Auth["KYC/Account Validation"]
    API --> Wallet["Wallet / Transfer / Transaction History"]
    API --> Job["Job"]
    API --> Hospital["Hospital"]

    Hospital --> AIChat["AI Hospital Reservation Agent\n(FastAPI Chatbot)"]
    AIChat --> HospitalApi["Hospital Reservation API Orchestration"]
    Job --> S3["S3 Object Storage\n(Job Portfolio Files / Foreigner Face Images)"]

    API --> Redis["Redis Cache"]
    API --> DB["RDS MySQL"]

    API --> Tunnel["Private Tunnel"]
    Tunnel --> CBG["On-Premise Gateway"]
    CBG --> CBS["Core Banking Server"]
    CBS --> CBD[("Core Banking DB")]

    CBG --> Gov[("Government/Verification DB")]
    Gov --> S3
    CBG --> FDS["FDS Server"]
```

## Monorepo Golden Rules

### Immutable
- 모든 금융 거래는 백엔드 도메인 서비스에서만 처리한다. 프론트/AI 서버(FastAPI 챗봇 포함)에서 금액 확정 로직을 수행하지 않는다.
- 인증서 발급 및 계좌 개설은 여권 및 liveness 검증 없이 진행할 수 없으며, 이체/해외송금은 계좌 비밀번호 검증을 통해서만 수행한다.
- 원장성 데이터(거래내역, 잔액, 계좌상태)는 Core Banking 응답과 백엔드 상태가 불일치하면 실패 처리한다.
- 비밀정보(API 키, 인증서, 터널링 자격증명, DB 계정)는 코드/로그에 남기지 않는다.
- 액세스/보안 관련 키 값은 노출되지 않도록 저장소에 평문으로 커밋되지 않도록 하며, 환경변로 처리한다.
- `government-db`는 별도 Spring Boot 애플리케이션 모듈이 아닌 온프레미스 인프라 데이터 소스로 취급하며, `backend` 서버가 AWS Transit Gateway를 통해 온프레미스 gateway를 경유해 접근하도록 한다.

### Do
- 계약 우선: FE-BE, BE-AI(FastAPI), BE-CoreBanking 간 API 스펙을 먼저 고정하고 구현한다.
- 계좌이체 UX에 필요한 수취인명 조회는 `backend -> coreBanking` 서버 간 API 계약으로 처리한다.
- 장애 격리: Core Banking 연동 실패 시 재시도 정책과 보상 흐름을 명시한다.
- 감사 추적: 인증/이체/계좌개설 단계는 모두 추적 가능한 이벤트 로그를 남기고, 로그는 롤링 파일 형식으로 생성/보관한다.
- 다국어 UX를 고려해 메시지 키 기반 응답을 우선한다.
- superpowers 실행 시 리뷰 완료 직후 `compound` 회고 단계를 반드시 수행해, 실행-검토 사이클에서 발생한 실수/원인/교훈/재발방지 체크리스트를 다음 작업 입력에 반영한다.

### Don't
- Core Banking 연동 모듈에서 임의 비즈니스 규칙을 추가하지 않는다.
- 인증 우회 플래그(예: `skipKyc=true`)를 운영 경로에 추가하지 않는다.
- 거래 성공 전에 잔액 UI를 낙관적으로 확정하지 않는다.

## Agent Routing

- 백엔드 도메인/엔티티/트랜잭션 수정: `backend` 규칙 파일 우선 적용.
- UI/UX/상태관리 수정: `frontend` 규칙 파일 우선 적용.
- 병원 예약 챗봇/에이전트 로직(FastAPI) 수정: `ai-server` 규칙 파일 우선 적용.
- 코어뱅킹 인터페이스/터널링/프로토콜 수정: `core-banking-gateway` 규칙 파일 우선 적용.

## Maintenance Policy

- 이 문서와 실제 코드/인프라가 달라지면, 기능 변경 PR에 `AGENTS.md` 또는 하위 규칙 파일 동시 업데이트를 포함한다.
- 하위 모듈 규칙과 충돌 시, 더 하위 디렉토리의 규칙을 우선 적용한다.

# ✨NOVA

<img width="1097" height="418" alt="스크린샷 2026-06-17 오전 11 37 31" src="https://github.com/user-attachments/assets/7350e181-6e34-47e1-b4f4-c06de281c87a" />


NOVA는 외국인등록증 발급 전 금융 공백을 겪는 외국인을 위한 비대면 금융·생활 밀착 서비스입니다.

여권 OCR, Liveness, 정부 신원 정보 검증을 기반으로 임시 제한 계좌를 개설하고, 이체·월렛·해외송금 같은 기본 금융 기능과 구인구직·AI 병원 예약 같은 생활 서비스를 함께 제공합니다.

## 프로젝트 기획 배경

한국에 입국한 외국인은 외국인등록증 발급 전까지 일반 금융 서비스 이용이 어렵고, 계좌 개설·송금·생활 정착 과정에서 오프라인 방문과 언어 장벽을 동시에 겪습니다.

NOVA는 비대면 신원 인증과 제한 계좌 개설을 먼저 제공해 초기 금융 접근성을 확보하고, 이후 외국인등록증 등록 시 한도 해제와 해외송금까지 확장되는 흐름을 설계했습니다.

또한 금융 기능을 단독으로 제공하는 데 그치지 않고, 구직 정보와 AI 병원 예약 상담을 함께 제공해 외국인의 생활 정착 과정에서 반복적으로 발생하는 불편을 하나의 서비스 흐름 안에서 해결하고자 했습니다.

## ✨주요 기능

<img width="1241" height="684" alt="스크린샷 2026-06-17 오전 11 46 45" src="https://github.com/user-attachments/assets/39399b72-22b2-4d92-a336-b853423aa709" />


### 비대면 KYC 및 신원 검증

- 여권 OCR, 외국인등록증 OCR, Liveness 인증을 조합한 비대면 신원 인증
- 외국인등록증 OCR 결과와 Government DB 조회 결과 비교
- 주민등록번호/외국인등록번호 원문 대신 HMAC-SHA256 해시 기반 조회
- 인증서 발급 이후 제한 계좌 개설 가능

### 제한 계좌 개설

- 인증서 발급 완료 사용자만 계좌 개설 가능
- Backend가 사용자 및 계좌 상품 정보를 Core Banking으로 전달
- Core Banking에서 계좌번호 생성, 비밀번호 암호화, 초기 이체 한도 설정
- 생성된 계좌 식별자를 Backend의 `account_ref`에 동기화

### 계좌 이체

- 프론트엔드에서 전달한 멱등키 기반 중복 요청 방지
- Redis 처리중 락과 결과 캐시를 통한 중복 실행 차단
- 출금 계좌 단위 Redis 락으로 동시 차감 방지
- 계좌 비밀번호 검증 후 Core Banking에 이체 요청
- 통신 장애 시 `externalRequestId` 기반 처리 결과 조회로 복구

### 해외송금 및 FDS 심사

- Backend가 해외송금 요청을 Core Banking으로 위임
- Core Banking이 잔액을 차감하고 해외송금 원장을 `PENDING` 상태로 생성
- FDS 서버가 이상거래 여부를 비동기로 심사
- 정상 거래는 `SUCCESS`, 위험 거래 또는 통신 실패는 `FAILED` 처리
- 실패 시 Core Banking이 상태 변경과 환급을 최종 수행

### AI 병원 예약 상담

- FastAPI 기반 AI Server에서 병원 예약 상담 제공
- LangGraph ReAct 에이전트가 사용자 발화를 분석
- 병원 조회, 예약 가능 시간 조회, 예약 생성·변경·취소 도구 호출
- 실제 예약 데이터 변경은 Backend Hospital API에서 수행
- AI 서버는 대화 맥락과 도구 호출 흐름만 관리

### 생활 정착 서비스

- 구인구직 정보 제공
- 포트폴리오 파일 업로드 및 관리
- 병원 예약 기능 제공
- 금융 서비스와 생활 서비스를 하나의 사용자 흐름으로 통합

## ✨시스템 아키텍처

<img width="1074" height="689" alt="스크린샷 2026-06-17 오전 11 27 57" src="https://github.com/user-attachments/assets/f4f17d23-569f-409e-94ad-d4714450917e" />


NOVA는 사용자 접근 계층은 클라우드에 두고, 금융 원장과 정부 신원 DB는 온프레미스 경계 안에 분리한 하이브리드 아키텍처입니다.

- 사용자는 Vercel에 배포된 프론트엔드에 접속하고, Route 53, WAF, ALB를 거쳐 AWS private subnet의 Backend/AI 서버로 요청이 전달됩니다.

- AWS 내부에서는 Backend 서버가 Blue-Green Auto Scaling 구조로 배치되어 트래픽을 분산 처리합니다. RDS는 Multi-AZ 기반 Primary/Standby 구조로 구성해 장애 발생 시 자동 Failover가 가능하도록 했고, Redis 역시 Primary/Replica 구조를 통해 세션·락·멱등 처리 데이터의 가용성을 높였습니다.

- 온프레미스 영역은 OpenStack VM 기반으로 구성됩니다. 외국인 신원 확인을 위한 Government DB, 계좌·거래 원장을 처리하는 Core Banking Server, Core Banking DB, 해외송금 이상거래를 탐지하는 FDS Server, 클라우드와 온프레미스 내부망을 연결하는 On-Premise Gateway가 배치됩니다.

- Cloud Backend는 Transit Gateway와 Site-to-Site VPN을 통해 On-Premise Gateway에 접근하며, Government DB나 Core Banking DB의 접속 정보를 직접 보유하지 않습니다. 이를 통해 개인정보와 금융 원장 데이터를 온프레미스 경계에 격리하고, 클라우드는 서비스 API와 사용자 경험을 담당하도록 역할을 분리했습니다.

- NOVA의 아키텍처는 단순히 서비스를 실행하기 위한 구조가 아니라, 금융 서비스가 가져야 하는 안정성, 정합성, 보안 경계를 우선으로 설계했습니다.

  - 클라우드 영역은 사용자의 접근성과 확장성을 담당하고, 온프레미스 영역은 계정계 원장과 정부 신원 데이터처럼 민감하고 정합성이 중요한 자원을 담당합니다. 두 영역은 Transit Gateway와 이중화된 Site-to-Site VPN 터널로 연결해 public internet 노출을 최소화했습니다.

  - 또한 Backend, RDS, Redis를 Multi-AZ 기반으로 구성하고, 배포는 Blue-Green 방식으로 운영해 장애와 배포 리스크를 줄였습니다. 거래 처리에서는 멱등키, Redis lock, Core Banking 중심 원장 확정, FDS 심사를 함께 사용해 중복 거래와 원장 불일치 가능성을 낮췄습니다.

NOVA는 외국인 사용자의 생활 정착을 돕는 서비스이면서도, 금융 서비스의 핵심인 신뢰성과 고가용성을 함께 만족하는 것을 목표로 합니다.

## ✨서버별 역할

| Server | Role |
|---|---|
| `frontend` | React/Vite 기반 웹 UI. 인증, 계좌개설, 이체, 월렛, 해외송금, 병원 예약, 일자리 화면 제공 |
| `backend` | 클라우드 메인 API 서버. 사용자, 인증, 금융 도메인, 생활 서비스, 외부 서버 연동의 중심 |
| `ai` | FastAPI 기반 병원 예약 챗봇 서버. LangGraph 에이전트를 통해 예약 API 흐름 보조 |
| `gateway` | 온프레미스 내부 API 진입점. Government DB 조회와 내부 검증 로직 수행 |
| `coreBanking` | 계정계 서버. 계좌, 잔액, 거래내역, 이체, 해외송금 원장의 최종 정합성 보장 |
| `fds` | 해외송금 이상거래 탐지 서버. Isolation Forest 기반 위험 거래 판정 |

## ✨소프트웨어 아키텍처

<img width="1235" height="766" alt="스크린샷 2026-06-17 오전 11 30 15" src="https://github.com/user-attachments/assets/950d222f-58f3-4220-9fa1-084d7b7e4b93" />


- Frontend는 화면 구성, 라우팅, 상태 관리, API 호출을 담당합니다. 금융 금액 확정이나 원장성 판단은 수행하지 않습니다.

- Cloud Backend는 인증, 사용자, 금융, 생활 API의 진입점입니다. KYC, 계좌 개설 요청, 이체 사전 조회, 월렛 충전, 해외송금 요청, 병원/구직 기능을 제공하지만, 금융 원장 확정은 Core Banking에 위임합니다. Core Banking 연동은 `backend/global/corebanking/client` 단일 클라이언트를 통해 수행해 도메인 서비스가 온프레미스 API에 직접 분산 의존하지 않도록 했습니다.

- AI Server는 병원 예약 챗봇을 담당합니다. 사용자의 자연어 요청을 LangGraph 기반 ReAct 에이전트가 해석하고, 병원 목록 조회, 예약 가능 시간 조회, 예약 생성/변경/취소를 Backend Hospital API 호출로 실행합니다. AI 서버는 금융 원장이나 사용자 인증 상태를 직접 변경하지 않습니다.

- On-Premise Gateway는 Cloud Backend가 온프레미스 내부 자원에 접근하기 위한 내부 API 진입점입니다. 외부 요청은 먼저 Nginx를 통해 리버스 프록시되며, 실제 Government DB 조회 요청 처리와 검증 로직은 Gateway Spring Boot 서버에서 수행됩니다.

- Core Banking은 계좌 개설, 비밀번호 검증, 이체, 거래내역, 해외송금 원장 처리를 담당합니다. 원장성 데이터는 Core Banking에서 최종 확정하며, Backend 상태와 불일치하면 실패 처리하는 구조를 지향합니다.

- FDS Server는 Core Banking에서 전달한 해외송금 원장 스냅샷을 기반으로 이상거래 여부를 심사합니다. FDS는 금융 원장을 직접 수정하지 않고 `SUCCESS` 또는 `FAILED` 판정과 실패 사유만 반환하며, 송금 상태 변경과 환급 처리는 Core Banking에서 최종 수행합니다.

## 🏦금융 안정성 설계

NOVA는 금융 거래 안정성을 위해 다음 원칙을 적용했습니다.

### 멱등성

월렛 충전, 계좌 차감, 이체, 해외송금 같은 중복 실행 위험이 있는 요청은 멱등키를 사용합니다.

- Frontend는 요청 단위 idempotency key 생성
- Backend는 동일 멱등키의 중복 진행을 Redis로 차단
- Core Banking은 `externalRequestId`로 이미 처리된 원장 변경 요청을 재처리하지 않음
- 통신 장애 시 처리 결과 조회 API로 실제 처리 여부 재확인

### Redis Lock

Backend는 Redis `setIfAbsent` 기반 락을 사용해 금융 요청의 중복 실행을 방지합니다.

- 동일 멱등키 처리 중복 방지
- 동일 출금 계좌에 대한 동시 차감 방지
- 완료된 요청 결과 캐싱
- TTL 설정을 통한 영구 락 방지

### Core Banking 중심 원장 확정

잔액, 거래내역, 계좌 상태는 Core Banking에서 최종 확정합니다. Backend는 Core Banking client를 통해서만 계정계 기능을 호출하며, 도메인 서비스가 임의로 원장 규칙을 추가하지 않도록 경계를 분리했습니다.

### 계좌 비밀번호 검증

이체와 해외송금, 월렛 충전처럼 출금이 발생하는 기능은 계좌 비밀번호 검증을 통과해야 합니다. 비밀번호 검증은 Backend가 사용자 소유 계좌를 확인한 뒤 Core Banking의 검증 API 응답을 기준으로 처리합니다.

### FDS 기반 해외송금 심사

해외송금은 Core Banking에서 원장을 `PENDING`으로 생성한 뒤 FDS 심사를 수행합니다. FDS는 Isolation Forest 기반 anomaly score와 threshold를 사용해 위험 여부를 판단합니다. 위험 거래는 `FAILED`와 `FDS_RISK_DETECTED`로 반환되고, Core Banking은 해당 결과에 따라 실패 상태 기록 및 환급 처리를 수행합니다.

## 🔐보안 설계

NOVA는 개인정보와 금융 원장 데이터를 보호하기 위해 클라우드와 온프레미스의 책임을 분리했습니다.

- Government DB와 Core Banking DB는 public network에 노출하지 않음
- Backend는 Government DB JDBC URL 또는 계정 정보를 직접 보유하지 않음
- Backend는 OCR 식별번호를 숫자만 남기도록 정규화한 뒤 HMAC-SHA256 해시 생성
- Gateway는 원문 식별번호가 아닌 해시 값으로 Government DB 조회
- 주민등록번호/외국인등록번호 원문은 서버 간 HTTP 요청/응답과 DB 저장값에 포함하지 않음
- API 키, 인증서, 터널링 자격증명, DB 계정은 환경변수와 비밀 관리 체계로 분리



또한 Backend, RDS, Redis를 Multi-AZ 기반으로 구성하고, 배포는 Blue-Green 방식으로 운영해 장애와 배포 리스크를 줄였습니다. 거래 처리에서는 멱등키, Redis lock, Core Banking 중심 원장 확정, FDS 심사를 함께 사용해 중복 거래와 원장 불일치 가능성을 낮췄습니다.

NOVA는 외국인 사용자의 생활 정착을 돕는 서비스이면서도, 금융 서비스의 핵심인 신뢰성과 고가용성을 함께 만족하는 것을 목표로 합니다.

## ✨서비스 워크플로우

<img width="1362" height="498" alt="서비스 워크플로우" src="https://github.com/user-attachments/assets/983be377-f5cc-4dc3-be49-33e6e752d489" />


- 서비스 진입 후 사용자는 회원가입과 로그인을 거쳐 인증서 발급을 수행합니다. 인증서가 발급되면 제한 계좌를 생성할 수 있고, 제한 계좌 상태에서는 이체, 거래 조회, 간편 결제 충전 같은 기본 금융 기능을 사용할 수 있습니다. 외국인등록증을 등록해 Government DB 검증을 통과하면 해외송금과 한도 해제 같은 확장 금융 기능으로 이어집니다.

- 금융 흐름과 별개로, 인증서 발급 이후에는 구인구직과 병원 예약 같은 생활 서비스도 사용할 수 있습니다. 병원 예약은 사용자가 자연어로 요청하면 AI Server가 대화 맥락을 유지하면서 Backend 병원 예약 API를 호출하는 방식으로 통합됩니다.



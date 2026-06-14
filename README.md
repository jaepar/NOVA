# NOVA

외국인 대상 비대면 금융/생활 밀착 서비스입니다.

NOVA는 외국인등록증 발급 전까지 발생하는 금융 공백을 줄이기 위해, 비대면 신원 인증 기반 임시 제한 계좌 개설, 기본 금융 기능, 병원/일자리 등 생활 서비스를 하나의 흐름으로 제공합니다.

## 핵심 목표

- 여권 OCR, NFC, Liveness 기반 비대면 신원 인증
- 외국인등록증 발급 전 사용할 수 있는 제한 계좌 개설
- 계좌 조회, 이체, 월렛 충전, 거래내역, 해외송금 등 최소 금융 기능 제공
- 병원 예약 AI 챗봇, 일자리/포트폴리오 등 생활 정착 서비스 연계
- 금융 서비스에 필요한 안정성, 정합성, 고가용성을 고려한 하이브리드 클라우드 아키텍처 구성


## 서버별 역할

| Server | Role |
|---|---|
| `frontend` | 모바일 앱과 유사한 웹 UI. 인증, 계좌개설, 이체, 월렛, 해외송금, 병원 예약, 일자리 화면 제공 |
| `backend` | 클라우드 메인 API 서버. 사용자, 인증, 금융 도메인, 생활 서비스, 외부 서버 연동의 중심 |
| `ai` | 병원 예약 FastAPI 챗봇 서버. 사용자 대화 맥락을 기반으로 병원 예약 API 흐름을 보조 |
| `gateway` | 온프레미스 내부 진입점. Government DB 조회와 Core Banking 접근 경계를 분리 |
| `coreBanking` | 계정계 서버. 계좌, 잔액, 거래내역, 이체, 해외송금 원장의 최종 정합성 보장 |
| `fds` | 해외송금 이상거래 탐지 서버. Isolation Forest 기반 위험 거래 판정 |

## Backend

`backend`는 NOVA의 클라우드 중심 API 서버입니다.

주요 역할은 다음과 같습니다.

- 회원가입, 로그인, 세션 관리
- 여권 OCR, 외국인등록증 OCR, Liveness 인증 결과 처리
- 계좌 개설 요청, 계좌 조회, 이체 사전 조회, 계좌 비밀번호 검증 연동
- 월렛 생성, 월렛 충전, 월렛 거래내역 관리
- 해외송금 요청을 Core Banking으로 위임
- 병원, 일자리, 포트폴리오 등 생활 서비스 API 제공
- S3 기반 문서/이미지 파일 관리
- Redis 기반 세션, 이메일 인증 코드, 금융 요청 중복 방지 처리

금융 거래 확정 로직은 프론트엔드나 AI 서버에서 수행하지 않고, 반드시 `backend` 도메인 서비스를 거쳐 Core Banking으로 전달됩니다. 특히 잔액, 거래내역, 계좌 상태처럼 원장성이 있는 데이터는 Core Banking 응답과 backend 상태가 불일치하면 실패 처리하는 구조를 지향합니다.

## Core Banking

`coreBanking`은 온프레미스 계정계 서버입니다.

클라우드 backend의 하위 모듈이 아니라, 별도 경계를 가진 계정계 시스템으로 설계했습니다. 계좌 개설, 계좌 비밀번호 검증, 이체, 거래내역, 해외송금 원장을 최종 처리합니다.

주요 API는 다음과 같습니다.

- 계좌 개설
- 계좌 비밀번호 검증
- 계좌 이체
- 이체 처리 결과 조회
- 거래내역 조회
- 수취인 조회
- 해외송금 요청 생성
- 해외송금 상태 조회

원장 변경 API는 `externalRequestId` 기반 멱등 처리를 적용해 중복 이체와 중복 출금을 방지합니다. 해외송금은 먼저 출금과 원장 생성을 수행한 뒤 `PENDING` 상태로 저장하고, FDS 심사 결과에 따라 `SUCCESS` 또는 `FAILED`로 전이합니다. FDS 실패 또는 통신 재시도 초과 시에는 실패 사유를 기록하고 환급 흐름으로 정리합니다.

## Gateway

`gateway`는 AWS 클라우드와 온프레미스 내부망 사이의 API 경계입니다.

backend는 Government DB의 JDBC URL, 계정, 내부 네트워크 주소를 직접 알지 않습니다. 대신 Transit Gateway와 Site-to-Site VPN을 통해 온프레미스 gateway의 HTTP API만 호출합니다.

Government DB 조회에서는 주민등록번호/외국인등록번호 원문을 주고받지 않습니다. backend가 OCR 결과에서 숫자만 정규화한 뒤 `REGISTRATION_NUMBER_HMAC_SECRET` 기반 HMAC-SHA256 해시를 생성하고, gateway는 해당 해시를 조회 키로 사용합니다.

이 구조를 통해 클라우드 서버가 온프레미스 DB 자격증명을 직접 보유하지 않도록 분리하고, 개인정보 원문이 서버 간 요청/응답에 포함되지 않도록 했습니다.

## FDS Server

`fds`는 온프레미스 Python FastAPI 기반 이상거래 탐지 서버입니다.

Core Banking이 해외송금 원장 스냅샷을 전달하면, FDS는 Isolation Forest 모델을 통해 이상거래 점수를 계산합니다. 응답은 `SUCCESS` 또는 `FAILED`로 단순화하고, 위험 거래로 판단되면 `FDS_RISK_DETECTED` 실패 사유를 반환합니다.

FDS는 원장을 직접 수정하지 않습니다. 출금, 입금, 환급, 상태 변경은 모두 Core Banking 책임으로 유지해 모델 판정과 금융 원장 처리를 분리했습니다.

## AI Server

`ai` 서버는 FastAPI 기반 병원 예약 챗봇 서버입니다.

사용자 발화와 이전 대화 맥락을 바탕으로 증상, 병원, 날짜, 시간 정보를 정리하고 backend의 병원 예약 API 흐름을 보조합니다. AI 서버는 예약/금융 상태를 직접 확정하지 않고, 실제 상태 변경은 backend API를 통해 수행합니다.

## Frontend

`frontend`는 Vercel에 배포되는 React/Vite 기반 웹 UI입니다.

모바일 앱과 유사한 경험을 제공하기 위해 고정 모바일 프레임, 공통 레이아웃, 공통 입력/버튼 컴포넌트를 사용합니다. 주요 화면은 다음과 같습니다.

- 회원가입/로그인
- 여권 OCR, NFC, Liveness 인증
- 계좌 개설
- 계좌 조회/이체
- 월렛 충전/거래내역
- 해외송금
- 병원 예약
- 일자리/포트폴리오

프론트엔드는 금액 확정, 잔액 확정, 거래 성공 처리를 낙관적으로 확정하지 않습니다. 금융 결과는 backend와 Core Banking 응답을 기준으로 반영합니다.

## Infrastructure Architecture

NOVA는 금융 서비스의 본질인 안정성, 고가용성, 정합성을 위해 AWS 클라우드와 온프레미스 계정계를 연결하는 하이브리드 아키텍처로 구성했습니다.

<img width="1158" height="813" alt="스크린샷 2026-06-14 오후 5 14 00" src="https://github.com/user-attachments/assets/8e19ed26-033f-47a6-9987-b7040775a2ef" />


## Public / Private Subnet 분리

VPC 내부는 역할에 따라 subnet을 분리했습니다.

- Public subnet
  - Bastion Host
  - NAT Gateway
  - 외부 진입이 필요한 최소 리소스만 배치

- Private app subnet
  - Backend 서버
  - AI 서버
  - 외부에서 직접 접근할 수 없고 ALB 또는 Bastion을 통해서만 접근

- Private data subnet
  - RDS Primary / Standby
  - ElastiCache Redis Primary / Replica
  - 애플리케이션 서버에서만 접근 가능

이 구조는 인터넷 노출면을 줄이고, 애플리케이션 계층과 데이터 계층을 네트워크 레벨에서 분리하기 위한 선택입니다.

## High Availability(고가용성)

NOVA의 클라우드 backend는 Multi-AZ 기반으로 배치했습니다.

- ALB를 통해 트래픽 분산
- Backend EC2 Auto Scaling Group 구성
- Blue-Green 무중단 배포 적용
- RDS Multi-AZ Primary/Standby 구성
- RDS Proxy를 통한 DB 커넥션 안정화
- ElastiCache Redis Primary/Replica 구성
- 장애 발생 시 다른 AZ 인스턴스로 트래픽 우회 가능

금융 서비스에서는 일시적인 서버 장애가 곧 거래 실패나 중복 처리로 이어질 수 있기 때문에, 애플리케이션 서버뿐 아니라 DB, Redis, 네트워크 경로까지 이중화 대상으로 보았습니다.

## Transit Gateway / Site-to-Site VPN

클라우드 backend와 온프레미스 gateway/core banking은 AWS Transit Gateway를 통해 연결됩니다.

온프레미스 측은 StrongSwan 기반 Site-to-Site VPN을 사용하며, IPsec 터널 2개를 구성해 단일 터널 장애 시에도 통신 경로를 유지할 수 있도록 했습니다.

이 구조의 목적은 다음과 같습니다.

- 클라우드 backend와 온프레미스 계정계 사이의 private routing 구성
- Government DB와 Core Banking DB를 public network에 노출하지 않음
- 터널 이중화를 통한 네트워크 고가용성 확보
- 금융 원장 시스템을 온프레미스 경계 안에 유지

## Deployment

### Cloud Backend

클라우드 backend 서버는 Auto Scaling Group 기반 Blue-Green 무중단 배포를 적용했습니다.

배포 시 신규 버전 인스턴스를 준비하고 health check를 통과한 뒤 트래픽을 전환합니다. 이를 통해 사용자는 배포 중에도 서비스를 계속 이용할 수 있고, 문제가 있는 버전은 트래픽 전환 전에 차단하거나 롤백할 수 있습니다.

### On-Prem Core Banking

온프레미스 Core Banking은 systemd와 Nginx를 이용한 Blue-Green 배포를 구성했습니다.

- Nginx entry port: `8001`
- Blue Java port: `18001`
- Green Java port: `18002`
- systemd service:
  - `core-banking-blue.service`
  - `core-banking-green.service`
- 배포 스크립트:
  - 신규 jar를 비활성 color에 배치
  - 비활성 color service 재시작
  - `/actuator/health` health check
  - Nginx upstream port 전환
  - Nginx reload
  - 기존 color service stop

이 방식은 온프레미스 단일 서버 환경에서도 배포 중단 시간을 최소화하기 위한 구성입니다.

### On-Prem Gateway

gateway는 Spring Boot jar를 systemd 서비스로 운영합니다.

- service file: `/etc/systemd/system/nova-gateway.service`
- working directory: `/opt/nova/gateway`
- environment file: `/opt/nova/gateway/.env`
- run command:
  - `java -jar /opt/nova/gateway/app/gateway-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev`
- log:
  - `journalctl -u nova-gateway -f`

gateway는 온프레미스 내부 API 진입점이므로 `Restart=always`와 journal 기반 로그 확인 흐름을 적용했습니다.

### On-Prem FDS

FDS는 Python 3.11 이상, venv, uvicorn, systemd 구조로 운영합니다.

- service file: `/etc/systemd/system/nova-fds.service`
- working directory: `/home/ubuntu/nova/fds`
- run command:
  - `/home/ubuntu/nova/fds/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8003`
- deployment:
  - 로컬 소스코드를 rsync/scp로 업로드
  - requirements 변경 시 venv에서 의존성 갱신
  - `sudo systemctl restart nova-fds`
- log:
  - `journalctl -u nova-fds -f`

## Financial Reliability

NOVA는 금융 거래 안정성을 위해 다음 원칙을 적용했습니다.

### 1. 멱등성

월렛 충전, 계좌 차감, 이체, 해외송금 같은 중복 실행 위험이 있는 요청은 멱등키를 사용합니다.

- frontend는 요청 단위 idempotency key를 생성
- backend는 동일 멱등키의 중복 진행을 Redis로 차단
- Core Banking은 `externalRequestId`로 이미 처리된 원장 변경 요청을 재처리하지 않음
- 통신 장애 시 처리 결과 조회 API로 실제 처리 여부를 재확인

이를 통해 사용자가 버튼을 여러 번 누르거나 네트워크 재시도가 발생해도 중복 출금과 중복 이체를 방지합니다.

### 2. Redis Lock

backend의 월렛 충전 흐름에서는 Redis `setIfAbsent` 기반 lock을 사용합니다.

- 동일 멱등키 처리 중복 방지
- 동일 출금 계좌에 대한 동시 차감 방지
- 완료된 요청 결과 캐싱
- lock TTL을 설정해 비정상 종료 시에도 영구 lock이 남지 않도록 처리

### 3. Core Banking 중심 원장 확정

잔액, 거래내역, 계좌 상태는 Core Banking에서 최종 확정합니다.

backend는 Core Banking client를 통해서만 계정계 기능을 호출하며, 도메인 서비스가 임의로 원장 규칙을 추가하지 않도록 경계를 분리했습니다.

### 4. 계좌 비밀번호 검증

이체와 해외송금, 월렛 충전처럼 출금이 발생하는 기능은 계좌 비밀번호 검증을 통과해야 합니다.

비밀번호 검증은 backend가 사용자 소유 계좌를 확인한 뒤 Core Banking의 검증 API 응답을 기준으로 처리합니다.

### 5. 인증 강화

계좌 개설과 인증서 발급은 여권 및 Liveness 검증 없이 진행할 수 없도록 설계했습니다.

- 여권 OCR
- NFC 기반 여권 칩 확인
- AWS Rekognition / Face Liveness
- 외국인등록증 OCR
- Government DB 해시 기반 신원 조회

주민등록번호/외국인등록번호 원문은 서버 간 요청/응답에 포함하지 않고, 정규화된 값의 HMAC-SHA256 해시만 조회 키로 사용합니다.

### 6. FDS 기반 해외송금 심사

해외송금은 Core Banking에서 원장을 `PENDING`으로 생성한 뒤 FDS 심사를 수행합니다.

FDS는 Isolation Forest 기반 anomaly score와 threshold를 사용해 위험 여부를 판단합니다. 위험 거래는 `FAILED`와 `FDS_RISK_DETECTED`로 반환되고, Core Banking은 해당 결과에 따라 실패 상태 기록 및 환급 처리를 수행합니다.

## Tech Stack

### Frontend

- React
- Vite
- TypeScript
- Zustand
- Axios
- Tailwind CSS
- AWS Amplify Face Liveness UI
- Vercel

### Backend

- Java 21
- Spring Boot
- Spring Web MVC
- Spring Data JPA
- Spring Security
- Spring Session Redis
- MySQL
- Redis
- AWS SDK S3
- AWS SDK Rekognition
- Actuator

### AI Server

- Python
- FastAPI
- LangGraph
- LangChain OpenAI
- Uvicorn
- Pytest

### Core Banking / Gateway

- Java 21
- Spring Boot
- Spring Data JPA
- Spring Web MVC
- MySQL
- Actuator
- systemd
- Nginx

### FDS

- Python
- FastAPI
- scikit-learn
- Isolation Forest
- Uvicorn
- Pytest
- systemd

### Infrastructure

- AWS Route 53
- AWS WAF
- AWS ALB
- EC2 Auto Scaling Group
- VPC Public / Private Subnet
- NAT Gateway
- Bastion Host
- Amazon RDS MySQL Multi-AZ
- RDS Proxy
- Amazon ElastiCache Redis Primary / Replica
- Amazon S3
- Amazon Rekognition
- AWS Transit Gateway
- Site-to-Site VPN
- StrongSwan
- On-Premise Core Banking / Gateway / FDS

## Architecture Decision

NOVA의 아키텍처는 단순히 서비스를 실행하기 위한 구조가 아니라, 금융 서비스가 가져야 하는 안정성, 정합성, 보안 경계를 우선으로 설계했습니다.

클라우드 영역은 사용자의 접근성과 확장성을 담당하고, 온프레미스 영역은 계정계 원장과 정부 신원 데이터처럼 민감하고 정합성이 중요한 자원을 담당합니다. 두 영역은 Transit Gateway와 이중화된 Site-to-Site VPN 터널로 연결해 public internet 노출을 최소화했습니다.

또한 backend, RDS, Redis를 Multi-AZ 기반으로 구성하고, 배포는 Blue-Green 방식으로 운영해 장애와 배포 리스크를 줄였습니다. 거래 처리에서는 멱등키, Redis lock, Core Banking 중심 원장 확정, FDS 심사를 함께 사용해 중복 거래와 원장 불일치 가능성을 낮췄습니다.

NOVA는 외국인 사용자의 생활 정착을 돕는 서비스이면서도, 금융 서비스의 핵심인 신뢰성과 고가용성을 놓치지 않는 것을 목표로 합니다.

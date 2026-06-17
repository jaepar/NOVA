# [우리FISA 6기] 클라우드 서비스 과정 3팀

## 1. 프로젝트 개요

### 주제

**NOVA**는 **외국인등록증 발급 전 금융 공백**을 겪는 외국인을 위한 **비대면 금융·생활 밀착 서비스**입니다. **여권 OCR, liveness, 정부 신원 정보 검증**을 기반으로 **임시 제한 계좌**를 개설하고, **이체·월렛·해외송금** 같은 최소 금융 기능과 **구인구직·병원 예약** 같은 생활 서비스를 제공합니다.

### 프로젝트 기획 배경

한국에 입국한 외국인은 **외국인등록증 발급 전까지 일반 금융 서비스 이용이 어렵고**, 계좌 개설·송금·생활 정착 과정에서 **오프라인 방문과 언어 장벽**을 동시에 겪습니다. NOVA는 **비대면 신원 인증과 제한 계좌 개설**을 먼저 제공해 **초기 금융 접근성**을 확보하고, 이후 외국인등록증 등록 시 **한도 해제와 해외송금**까지 확장되는 흐름을 설계했습니다.

또한 금융 기능을 단독으로 제공하는 데 그치지 않고, **구직 정보와 AI 병원 예약 상담**을 함께 제공해 외국인의 생활 정착 과정에서 반복적으로 발생하는 불편을 **하나의 서비스 흐름** 안에서 해결하고자 했습니다.

### 기술 스택

- **Frontend(프론트엔드)**: React, TypeScript, Vite, Zustand, Tailwind CSS
- **Backend(클라우드 메인 API 서버)**: Java 21, Spring Boot, Spring Security, Spring Data JPA, Spring Session, **ElastiCache Redis**
- **AI Server(병원 예약 챗봇 서버)**: FastAPI, LangGraph, LangChain, OpenAI API
- **Core Banking(계정계 서버)**: Java 21, Spring Boot, JPA, MySQL
- **Gateway(온프레미스 내부 API 서버)**: Java 21, Spring Boot, JPA, MySQL, **HMAC-SHA256**
- **FDS(이상거래 탐지 서버)**: Python, FastAPI, **Isolation Forest**
- **Infra(인프라)**: AWS VPC, ALB, WAF, Route 53, RDS Multi-AZ, RDS Proxy, **ElastiCache Redis**, S3, Cognito, Secrets Manager, Systems Manager, Transit Gateway, Site-to-Site VPN, Vercel, OpenStack
- **External Services(외부 서비스)**: AWS Rekognition, CLOVA OCR, Korea Exim API, SMTP

## 2. 아키텍처

### 2-1. 시스템 아키텍처

**NOVA는 사용자 접근 계층은 클라우드에 두고, 금융 원장과 정부 신원 DB는 온프레미스 경계 안에 분리한 하이브리드 아키텍처 구조**입니다.
사용자는 **Vercel**에 배포된 프론트엔드에 접속하고, **Route 53, WAF, ALB**를 거쳐 **AWS private subnet의 Backend/AI 서버**로 요청이 전달됩니다.

<img width="1077" height="690" alt="스크린샷 2026-06-17 오전 9 02 37" src="https://github.com/user-attachments/assets/b96f4f49-e41a-4521-b075-fe16f40f6fae" />

#### 클라우드 영역

AWS 내부에서는 Backend 서버가 **Blue-Green Auto Scaling 구조**로 배치되어 **CPU 사용량이 70%를 초과하면 추가 인스턴스를 확장**해 트래픽을 분산 처리합니다.
RDS는 **Multi-AZ 기반 Primary/Standby 구조**로 구성해 장애 발생 시 **자동 Failover**가 가능하도록 했고, Redis 역시 **Primary/Replica 구조**를 통해 세션·락·멱등 처리 데이터의 가용성을 높였습니다. S3는 **여권/외국인등록증 이미지와 구직 포트폴리오 파일 저장소**로 사용되며, 개발자 접근은 **Bastion Host**를 통해 private subnet 내부로 제한됩니다.

#### 온프레미스 영역

온프레미스 영역은 **OpenStack VM 기반**으로 구성되며, 외국인 신원 확인을 위한 **Government DB(법무부 등 대외 신원 정보 DB)**, 계좌·거래 원장을 처리하는 **Core Banking Server(계정계 서버)**, Core Banking DB, 해외송금 이상거래를 탐지하는 **FDS Server**, 클라우드와 온프레미스 내부망을 연결하는 **On-Premise Gateway**가 배치됩니다.
클라우드 Backend는 **Transit Gateway와 Site-to-Site VPN**을 통해 On-Premise Gateway에 접근하며, **Government DB나 Core Banking DB의 접속 정보를 직접 보유하지 않습니다.** 이 구조를 통해 **개인정보와 금융 원장 데이터를 온프레미스 경계에 격리**하고, 클라우드는 서비스 API와 사용자 경험을 담당하도록 역할을 분리했습니다.


### 2-2. 소프트웨어 아키텍처

소프트웨어는 **Frontend, Cloud Backend, AI Server, On-Premise Gateway, CoreBanking, FDS**로 역할을 분리했습니다. Frontend는 화면 구성, 라우팅, 약관 상태, API 호출을 담당하고, **금융 금액 확정이나 원장성 판단은 수행하지 않습니다.**

<img width="1137" height="707" alt="스크린샷 2026-06-17 오전 12 58 00" src="https://github.com/user-attachments/assets/29eeef81-f9df-4da1-8cd5-84a00884fea8" />

#### Cloud Backend

Cloud Backend는 **인증, 사용자, 금융, 생활 API의 진입점**입니다. KYC, 계좌 개설 요청, 이체 사전 조회, 월렛 충전, 해외송금 요청, 병원/구직 기능을 제공하지만, **금융 원장 확정은 CoreBanking에 위임**합니다. CoreBanking 연동은 **`backend/global/corebanking/client` 단일 클라이언트**를 통해 수행해 도메인 서비스가 온프레미스 API에 직접 분산 의존하지 않도록 했습니다.

#### AI Server

AI Server는 **병원 예약 챗봇**을 담당합니다. 사용자의 자연어 요청을 **LangGraph 기반 ReAct 에이전트**가 해석하고, 병원 목록 조회, 예약 가능 시간 조회, 예약 생성/변경/취소를 Backend Hospital API 호출로 실행합니다. **AI 서버는 금융 원장이나 사용자 인증 상태를 직접 변경하지 않습니다.**

#### On-Premise Gateway

On-Premise Gateway는 클라우드 Backend가 온프레미스 내부 자원에 접근하기 위한 **내부 API 진입점**입니다. 외부 요청은 먼저 Nginx를 통해 리버스 프록시되며, 실제 **Government DB 조회 요청 처리와 검증 로직은 Gateway Spring Boot 서버**에서 수행됩니다. Backend가 OCR 식별번호를 정규화한 뒤 **HMAC-SHA256 해시**를 생성해 Gateway에 전달하면, Gateway는 Government DB에서 **해시 키로만 신원 정보를 조회**합니다. **원문 주민등록번호/외국인등록번호는 HTTP 요청·응답과 DB 저장값에 포함하지 않습니다.**

#### CoreBanking / FDS

CoreBanking은 **계좌 개설, 비밀번호 검증, 이체, 거래내역, 해외송금 원장 처리**를 담당합니다. FDS는 해외송금 원장 스냅샷을 심사하고 **SUCCESS/FAILED 판정만 반환**하며, 실패 상태 반영과 환급은 CoreBanking에서 처리합니다.

FDS Server는 CoreBanking에서 전달한 해외송금 원장 스냅샷을 기반으로 **이상거래 여부를 심사하는 온프레미스 Python 서버**입니다. 해외송금 요청이 생성되면 CoreBanking은 거래 상태를 **PENDING**으로 저장한 뒤 FDS에 심사를 요청하고, FDS는 거래 금액, 국가, 통화, 송금 목적 등 요청 데이터를 모델 입력값으로 사용해 이상거래 점수를 계산합니다. FDS는 **금융 원장을 직접 수정하지 않고 SUCCESS 또는 FAILED 판정과 실패 사유만 반환**하며, 송금 상태 변경과 환급 처리는 **CoreBanking에서 최종 수행**합니다.


## 3. 주요 기능 소개

### 3-1. 핵심 기술 소개

- **비대면 KYC**: 여권 OCR, 외국인등록증 OCR, liveness, Government DB 검증을 조합해 **신원 인증 단계**를 구성했습니다.
- **Core Banking 분리**: 금융 원장성 데이터는 **CoreBanking에서만 최종 확정**하고, Backend는 사용자·서비스 흐름과 온프레미스 연동 조율을 담당합니다.
- **Redis 멱등·락 처리**: 이체와 월렛 충전에서 **멱등키 결과 캐시, 처리중 락, 계좌 단위 락**을 사용해 중복 요청과 동시 차감을 방지합니다.
- **FDS 비동기 심사**: 해외송금 생성 후 **PENDING 상태**로 저장하고, FDS 판정 결과에 따라 **SUCCESS 또는 FAILED 및 환급 처리**를 수행합니다.
- **LangGraph 병원 예약 에이전트**: 자연어 상담을 **도구 호출 기반 예약 API 실행**으로 연결해 병원 검색, 슬롯 조회, 예약 생성/변경/취소를 지원합니다.

<img width="1228" height="663" alt="스크린샷 2026-06-17 오전 11 47 46" src="https://github.com/user-attachments/assets/b5f837d8-f511-4a8b-a481-b2fd88faa863" />

### 3-2. 통합 워크플로우 다이어그램

서비스 진입 후 사용자는 **회원가입과 로그인**을 거쳐 **인증서 발급**을 수행합니다. 인증서가 발급되면 **제한 계좌를 생성**할 수 있고, 제한 계좌 상태에서는 **이체, 거래 조회, 간편 결제 충전** 같은 기본 금융 기능을 사용할 수 있습니다. 외국인등록증을 등록해 **Government DB 검증**을 통과하면 **해외송금과 한도 해제** 같은 확장 금융 기능으로 이어집니다.

금융 흐름과 별개로, 인증서 발급 이후에는 **구인구직과 병원 예약** 같은 생활 서비스도 사용할 수 있습니다. 병원 예약은 사용자가 자연어로 요청하면 **AI Server가 대화 맥락을 유지하면서 Backend 병원 예약 API를 호출**하는 방식으로 통합됩니다.

<img width="1362" height="498" alt="서비스 워크플로우" src="https://github.com/user-attachments/assets/bb7c116a-27cf-47f1-998f-f7b85abbaad2" />


### 3-3. 세부 기능 소개

#### 기능 1. 외국인등록증 기반 Government DB 신원 검증

- 기능 설명: **외국인등록증 OCR 결과의 이름, 식별번호, 발급일**을 사용자 정보 및 **Government DB 조회 결과**와 비교해 외국인등록증 등록 여부를 확정합니다. Backend는 식별번호에서 숫자만 남긴 뒤 **HMAC-SHA256 해시**를 생성하고, Gateway는 이 해시로 Government DB를 조회합니다.

- 핵심 코드(스크립트):
```java
// backend/domain/user/service/IdentityVerificationService.java
// OCR 식별번호 원문을 직접 전달하지 않고, 숫자 정규화 후 HMAC 해시로 Government DB 조회를 요청합니다.
String registrationNumberHash =
    registrationNumberHmacHasher.hash(normalizeDigits(idCard.residentRegistrationNumber()));
GovermentIdentityResponse governmentIdentity =
    governmentIdentityClient.lookupByRegistrationNumberHash(registrationNumberHash);
boolean identityMatchWithGovDb = isSameIdentity(idCard, governmentIdentity);

// Government DB 신원 정보와 OCR 결과가 일치하지 않으면 외국인등록증 검증을 실패 처리합니다.
if (!identityMatchWithGovDb) {
    return IdentityVerificationResponse.builder()
        .ocrDocumentType(OcrDocumentType.ID_CARD)
        .nameMatchWithUser(true)
        .identityMatchWithGovDb(false)
        .verificationStatus("FAILED")
        .failureReasonCode("GOVERNMENT_IDENTITY_MISMATCH")
        .build();
}

user.registerResidenceCard();
notificationService.deleteResidenceCardPeriodNotification(user);
```

```java
// gateway/domain/foreigner/service/ForeignerService.java
// Gateway는 원문 등록번호가 아니라 Backend가 전달한 HMAC 해시를 조회 키로 사용합니다.
@Transactional(readOnly = true)
public GovernmentIdentityResponse lookupIdentity(GovernmentIdentityLookupRequest request) {
    Foreigner foreigner = foreignerRepository.findByRegistrationNumberHash(request.registrationNumberHash())
        .orElseThrow(() -> new CustomException(GOVERNMENT_IDENTITY_NOT_FOUND));

    return GovernmentIdentityResponse.from(foreigner);
}
```
- 코드 링크: https://github.com/jaepar/NOVA/blob/main/backend/src/main/java/woorifisa/project/backend/domain/user/service/IdentityVerificationService.java, https://github.com/jaepar/NOVA/blob/main/gateway/src/main/java/woorifisa/project/gateway/domain/foreigner/service/ForeignerService.java

#### 기능 2. 제한 계좌 개설 및 CoreBanking 계좌 동기화

- 기능 설명: **인증서 발급 완료 사용자만 계좌 개설을 요청**할 수 있습니다. Backend는 사용자와 계좌 상품 정보를 CoreBanking에 전달하고, CoreBanking은 **고객 정보 갱신, 계좌번호 생성, 계좌 비밀번호 암호화, 초기 이체 한도 설정**을 수행합니다. 생성된 계좌 식별자는 Backend의 **`account_ref`에 동기화**됩니다.

- 핵심 코드(스크립트):
```java
// backend/domain/banking/service/BankingService.java
// 인증서 발급이 완료되지 않은 사용자는 계좌 개설 흐름에 진입할 수 없습니다.
if (user.getCertificateStatus() != CertificateStatus.ISSUED) {
    throw new CustomException(BANKING_CERTIFICATE_REQUIRED);
}

// 실제 계좌 생성은 CoreBanking에 위임하고, Backend는 생성 결과만 동기화합니다.
CoreBankingCreateAccountResponse created = coreBankingClient.createAccount(
    CoreBankingCreateAccountRequest.of(user, request)
);

// CoreBanking에서 생성된 계좌 식별자를 Backend의 account_ref에 저장합니다.
AccountRef accountRef = AccountRef.builder()
    .user(user)
    .customerId(created.customerId())
    .accountId(created.accountId())
    .hasAccount(true)
    .accountName(created.accountName())
    .accountNumber(created.accountNumber())
    .balance(0)
    .hasLimit(true)
    .transferLimit(created.transferLimit())
    .build();
accountRefRepository.save(accountRef);
```

```java
// coreBanking/domain/account/service/AccountService.java
// CoreBanking이 계좌번호 생성, 비밀번호 암호화, 제한 한도 설정을 최종 수행합니다.
String rawAccountNumber = generateUniqueAccountNumber();
Account account = Account.builder()
    .customer(customer)
    .accountType(resolveAccountType(request.accountType()))
    .hasLimit(true)
    .accountNumber(rawAccountNumber)
    .accountName(request.accountName())
    .balance(0)
    .password(passwordEncoder.encode(request.accountPassword()))
    .transferLimit(300_000)
    .bankCode(BankCode.WOORI)
    .build();
```
- 코드 링크: https://github.com/jaepar/NOVA/blob/main/backend/src/main/java/woorifisa/project/backend/domain/banking/service/BankingService.java,
https://github.com/jaepar/NOVA/blob/main/coreBanking/src/main/java/woorifisa/project/coreBanking/domain/account/service/AccountService.java

#### 기능 3. Redis 멱등키와 계좌 단위 락 기반 계좌 이체

- 기능 설명: 이체 요청은 프론트엔드에서 전달한 **멱등키**를 기준으로 중복 처리를 방지합니다. Backend는 Redis에 **처리중 락과 결과 캐시**를 저장하고, 같은 출금 계좌에 대한 동시 차감을 막기 위해 **계좌 단위 락**을 추가로 획득합니다. **계좌 비밀번호 검증 후 CoreBanking에 이체를 요청**하며, 통신 장애가 발생하면 **`externalRequestId` 조회**로 처리 여부를 복구합니다.

- 핵심 코드(스크립트):
```java
// backend/domain/banking/service/BankingService.java
// 요청 멱등키를 Redis 처리중 락으로 등록해 동일 요청의 중복 실행을 차단합니다.
String processingKey = formatProcessingKey(idempotencyKey);
Boolean acquired = stringRedisTemplate.opsForValue()
    .setIfAbsent(processingKey, PROCESSING_VALUE, PROCESSING_TTL);
if (!Boolean.TRUE.equals(acquired)) {
    throw new CustomException(BANKING_TRANSFER_PROCESSING);
}

AccountRef accountRef = accountRefRepository
    .findByUser_UserIdAndAccountNumber(userId, request.withdrawAccountId())
    .orElseThrow(() -> new CustomException(BANKING_ACCOUNT_NOT_FOUND));

// 출금이 발생하기 전 CoreBanking 계좌 비밀번호 검증을 반드시 통과해야 합니다.
coreBankingClient.verifyAccountPassword(
    CoreBankingPasswordVerifyRequest.of(accountRef.getAccountId(), request.accountPassword())
);

// 같은 출금 계좌에 대한 동시 차감을 막기 위해 계좌 단위 락을 추가로 획득합니다.
String accountProcessingKey = formatAccountProcessingKey(accountRef.getAccountId());
Boolean accountLockAcquired = stringRedisTemplate.opsForValue()
    .setIfAbsent(accountProcessingKey, PROCESSING_VALUE, PROCESSING_TTL);
if (!Boolean.TRUE.equals(accountLockAcquired)) {
    throw new CustomException(BANKING_TRANSFER_PROCESSING);
}
```

```java
// coreBanking/domain/accountTransaction/service/AccountTransactionService.java
// externalRequestId로 이미 처리된 원장 변경 요청은 재처리하지 않습니다.
if (accountTransactionRepository.existsByExternalRequestId(request.externalRequestId())) {
    return;
}

// CoreBanking에서 출금/입금 계좌와 잔액을 기준으로 원장 변경 가능 여부를 최종 판단합니다.
Account withdrawAccount = accountRepository.findByAccountNumber(request.withdrawAccountId())
    .orElseThrow(() -> new CustomException(ACCOUNT_TRANSFER_WITHDRAW_ACCOUNT_NOT_FOUND));

Account depositAccount = accountRepository.findByAccountNumber(request.depositAccountId())
    .orElseThrow(() -> new CustomException(ACCOUNT_TRANSFER_DEPOSIT_ACCOUNT_NOT_FOUND));

if (withdrawAccount.getBalance() < request.transferAmount()) {
    throw new CustomException(ACCOUNT_TRANSFER_INSUFFICIENT_BALANCE);
}
```
- 코드 링크: https://github.com/jaepar/NOVA/blob/main/backend/src/main/java/woorifisa/project/backend/domain/banking/service/BankingService.java, https://github.com/jaepar/NOVA/blob/main/coreBanking/src/main/java/woorifisa/project/coreBanking/domain/accountTransaction/service/AccountTransactionService.java

#### 기능 4. 해외송금 생성, FDS 비동기 심사, 실패 시 환급

- 기능 설명: Backend는 해외송금 요청을 CoreBanking으로 전달하고, CoreBanking은 **계좌 잔액을 차감한 뒤 해외송금 원장을 PENDING 상태로 저장**합니다. 이후 FDS 서버에 **비동기 심사**를 요청하고, FDS가 SUCCESS를 반환하면 송금을 성공 처리합니다. **FAILED 또는 통신 실패**가 발생하면 송금 상태를 실패로 변경하고 **차감 금액을 계좌로 환급**합니다.

- 핵심 코드(스크립트):
```java
// coreBanking/domain/globalTransaction/service/GlobalTransactionService.java
// 해외송금 요청이 들어오면 먼저 계좌 잔액을 차감하고 출금 거래내역을 기록합니다.
account.debit(krwAmount);
accountTransactionRepository.save(AccountTransaction.builder()
    .account(account)
    .transactionFlow(TransactionFlow.WITHDRAWAL)
    .transactionType(TransactionType.GLOBAL_REMITTANCE)
    .counterParty(GLOBAL_REMITTANCE_COUNTERPARTY)
    .amount(krwAmount)
    .balanceAfter(account.getBalance())
    .externalRequestId(request.externalRequestId())
    .build());

// 해외송금 원장은 즉시 성공 처리하지 않고 PENDING 상태로 저장한 뒤 FDS 비동기 심사로 넘깁니다.
GlobalTransaction globalTransaction = globalTransactionRepository.save(
    GlobalTransaction.builder()
        .customer(customer)
        .account(account)
        .externalRequestId(request.externalRequestId())
        .status(GlobalTransactionStatus.PENDING)
        .build()
);
globalTransactionFdsService.screenAsync(globalTransaction.getGlobalTransactionId());
```

```java
// coreBanking/domain/globalTransaction/service/GlobalTransactionFdsService.java
// FDS 판정이 SUCCESS이면 송금을 성공 처리하고, 위험 거래이면 실패 및 환급 흐름으로 전환합니다.
FdsGlobalTransactionScreeningResponse response = fdsClient.screen(
    FdsGlobalTransactionScreeningRequest.from(globalTransaction)
);
if (response.status() == GlobalTransactionStatus.SUCCESS) {
    globalTransaction.markSuccess();
    return;
}
failAndRefund(globalTransaction, response.failureReason());
```

```python
# fds/app/main.py
# Isolation Forest 기반 anomaly score로 위험 거래 여부를 판단해 SUCCESS 또는 FAILED만 반환합니다.
anomaly_score = fds_model.score(request)
risky = fds_model.is_risky(anomaly_score)
response = GlobalTransactionScreeningResponse(
    globalTransactionId=request.globalTransactionId,
    status="FAILED" if risky else "SUCCESS",
    anomalyScore=anomaly_score,
    threshold=THRESHOLD,
    failureReason="FDS_RISK_DETECTED" if risky else None,
)
```
- 코드 링크: https://github.com/jaepar/NOVA/blob/main/backend/src/main/java/woorifisa/project/backend/domain/banking/service/BankingService.java, https://github.com/jaepar/NOVA/blob/main/coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/service/GlobalTransactionService.java, https://github.com/jaepar/NOVA/blob/main/coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/service/GlobalTransactionFdsService.java, https://github.com/jaepar/NOVA/blob/main/fds/app/main.py

#### 기능 5. LangGraph 기반 AI 병원 예약 상담

- 기능 설명: AI Server는 병원 예약 대화를 **세션 단위로 관리**하고, **LangGraph ReAct 에이전트**가 사용자 발화를 분석해 병원 조회, 예약 가능 슬롯 조회, 예약 생성, 예약 변경/취소 도구를 호출합니다. **실제 예약 데이터 변경은 Backend Hospital API에서 수행**되며, AI 서버는 대화 맥락과 도구 호출 흐름을 관리합니다.

- 핵심 코드(스크립트):
```python
# ai/app/services/hospital_chat_service.py
# 대화 세션 상태를 유지하면서 LangGraph 병원 예약 에이전트에 사용자 발화를 전달합니다.
agent_result = self.hospital_chat_agent.run_turn(
    conversation_id=conversation_id,
    user_message=message,
    conversation_messages=conversation_messages,
    jsessionid=jsessionid,
    persisted_state=persisted_state,
    response_language=response_language,
)
self.session_store.set_graph_state(conversation_id, agent_result["state"])
self.session_store.append_message(conversation_id, "assistant", agent_result["message"])
```

```python
# ai/app/agent.py
# agent와 execute_tools 노드를 순환시켜 필요한 병원 예약 API 도구를 반복 호출할 수 있게 구성합니다.
graph_builder = StateGraph(HospitalAgentState)
graph_builder.add_node("agent", self._agent_node)
graph_builder.add_node("execute_tools", self._execute_tools)
graph_builder.add_node("finish", self._finish)
graph_builder.add_edge(START, "agent")
graph_builder.add_conditional_edges(
    "agent",
    self._route_after_agent,
    {
        "execute_tools": "execute_tools",
        "finish": "finish",
        "fallback": "fallback",
    },
)
graph_builder.add_edge("execute_tools", "agent")
```

```java
// backend/domain/hospital/service/HospitalService.java
// 예약 가능 슬롯을 조회하고, 이미 사용된 슬롯이면 예약 생성을 차단합니다.
HospitalAvailableSlot hospitalAvailableSlot = hospitalAvailableSlotRepository
    .findByHospitalHospitalIdAndAvailableAt(hospital.getHospitalId(), request.reservedAt())
    .orElseThrow(() -> new CustomException(HOSPITAL_AVAILABLE_SLOT_NOT_FOUND));

if (!hospitalAvailableSlot.isAvailable()) {
    throw new CustomException(HOSPITAL_AVAILABLE_SLOT_NOT_FOUND);
}

// 예약 가능 슬롯을 불가 상태로 전환한 뒤 실제 예약 데이터를 저장합니다.
hospitalAvailableSlot.markUnavailable();
reservationRepository.save(
    Reservation.builder()
        .user(user)
        .hospital(hospitalAvailableSlot.getHospital())
        .reservedAt(request.reservedAt())
        .status(ReservationStatus.RESERVED)
        .build()
);
```
- 코드 링크: https://github.com/jaepar/NOVA/blob/main/ai/app/services/hospital_chat_service.py, https://github.com/jaepar/NOVA/blob/main/ai/app/agent.py, https://github.com/jaepar/NOVA/blob/main/backend/src/main/java/woorifisa/project/backend/domain/hospital/service/HospitalService.java

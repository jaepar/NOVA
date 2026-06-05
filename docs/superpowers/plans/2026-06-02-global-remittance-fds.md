# Global Remittance FDS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `fds-server → coreBanking → backend` 순서로 해외송금 FDS 심사, 원장 상태 갱신, 사용자 API를 구현한다.

**Architecture:** `fds-server`는 루트 `fds` 폴더의 Python FastAPI 서버이며 Isolation Forest 심사 결과만 반환한다. CoreBanking은 해외송금 원장 저장, 선출금, FDS 비동기 호출, 실패 환급, 상태 갱신을 담당한다. Backend는 사용자 세션 기준 본인 계좌 검증과 CoreBanking API 연동만 담당한다.

**Tech Stack:** Python, FastAPI, pytest, scikit-learn, Java 17, Spring Boot, Spring Data JPA, RestClient, Redis, JUnit 5, Mockito

---

## 선행 조건

- 설계 문서: `docs/superpowers/specs/2026-06-02-global-remittance-fds-design.md`
- FDS API 문서: `fds/docs/rest_api.md`
- CoreBanking API 문서: `coreBanking/docs/rest_api.md`
- Backend API 문서: `backend/docs/rest_api.md`
- 코드 변경 전 사용자에게 실행 여부를 확인한다.
- 코드 외 문서/설명은 한글로 작성하고 파일은 UTF-8 인코딩을 유지한다.

## 파일 구조

### FDS Server

- Create: `fds/requirements.txt`
- Create: `fds/app/main.py`
- Create: `fds/app/schemas.py`
- Create: `fds/app/model.py`
- Create: `fds/tests/test_screening_api.py`

### CoreBanking

- Modify: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/entity/GlobalTransaction.java`
- Modify: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/entity/enums/GlobalTransactionStatus.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/entity/enums/GlobalTransactionFailureReason.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/repository/GlobalTransactionRepository.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/dto/request/CreateGlobalTransactionRequest.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/dto/response/CreateGlobalTransactionResponse.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/dto/response/GlobalTransactionStatusResponse.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/dto/response/GlobalTransactionListItemResponse.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/fds/dto/FdsGlobalTransactionScreeningRequest.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/fds/dto/FdsGlobalTransactionScreeningResponse.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/fds/client/FdsClient.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/fds/client/RestFdsClient.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/service/GlobalTransactionFdsService.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/service/GlobalTransactionService.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/controller/GlobalTransactionController.java`
- Modify: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/accountTransaction/entity/enums/TransactionType.java`
- Modify: `coreBanking/src/main/java/woorifisa/project/coreBanking/global/response/status/BaseResponseStatus.java`
- Modify: `coreBanking/src/main/resources/application-local.yaml`
- Modify: `coreBanking/src/main/resources/application-dev.yaml`
- Modify: `coreBanking/src/main/resources/application-prod.yaml`

### Backend

- Create: `backend/src/main/java/woorifisa/project/backend/domain/banking/dto/request/CreateGlobalTransactionRequest.java`
- Create: `backend/src/main/java/woorifisa/project/backend/domain/banking/dto/response/CreateGlobalTransactionResponse.java`
- Create: `backend/src/main/java/woorifisa/project/backend/domain/banking/dto/response/GlobalTransactionListItemResponse.java`
- Create: `backend/src/main/java/woorifisa/project/backend/domain/banking/dto/corebanking/request/CoreBankingCreateGlobalTransactionRequest.java`
- Create: `backend/src/main/java/woorifisa/project/backend/domain/banking/dto/corebanking/response/CoreBankingCreateGlobalTransactionResponse.java`
- Create: `backend/src/main/java/woorifisa/project/backend/domain/banking/dto/corebanking/response/CoreBankingGlobalTransactionListItemResponse.java`
- Modify: `backend/src/main/java/woorifisa/project/backend/global/corebanking/client/CoreBankingClient.java`
- Modify: `backend/src/main/java/woorifisa/project/backend/global/corebanking/client/RestCoreBankingClient.java`
- Modify: `backend/src/main/java/woorifisa/project/backend/domain/banking/service/BankingService.java`
- Modify: `backend/src/main/java/woorifisa/project/backend/domain/banking/controller/BankingController.java`

---

### Task 1: FDS Server FastAPI 심사 API

**Files:**
- Create: `fds/requirements.txt`
- Create: `fds/app/main.py`
- Create: `fds/app/schemas.py`
- Create: `fds/app/model.py`
- Create: `fds/tests/test_screening_api.py`

- [ ] **Step 1: Write the failing test**

Create `fds/tests/test_screening_api.py`:

```python
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def payload():
    return {
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
        "receiverPhone": "+12125550100",
        "swiftCode": "BOFAUS3N",
        "receiverAccountNum": "1234567890",
        "routingNumber": "026009593",
        "bankName": "Bank of America",
        "remitReason": "LIVING_EXPENSE",
    }


def test_screening_returns_success_or_failed():
    response = client.post("/fds/global-transactions/screenings", json=payload())

    assert response.status_code == 200
    body = response.json()
    assert body["globalTransactionId"] == 1
    assert body["status"] in {"SUCCESS", "FAILED"}
    assert "anomalyScore" in body
    assert "threshold" in body


def test_screening_rejects_invalid_payload():
    invalid = payload()
    invalid.pop("globalTransactionId")

    response = client.post("/fds/global-transactions/screenings", json=invalid)

    assert response.status_code == 422
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd fds && python -m pytest tests/test_screening_api.py -q`

Expected: `app` package does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `fds/requirements.txt`:

```text
fastapi
uvicorn
pytest
httpx
scikit-learn
numpy
```

Create `fds/app/schemas.py`:

```python
from typing import Literal

from pydantic import BaseModel


class GlobalTransactionScreeningRequest(BaseModel):
    globalTransactionId: int
    customerId: int
    accountId: int
    remitPurpose: str | None = None
    targetCountry: str
    currency: str
    remitAmount: str
    mediaryFeePayer: str
    exchangeRate: float
    krwAmount: str
    senderEngName: str
    senderPhone: str
    senderAddressDetail: str | None = None
    senderDistrict: str | None = None
    senderCity: str | None = None
    senderZipCode: str | None = None
    senderCountry: str | None = None
    receiverEngName: str
    receiverAddressDetail: str | None = None
    receiverDistrict: str | None = None
    receiverPhone: str | None = None
    swiftCode: str | None = None
    receiverAccountNum: str
    routingNumber: str | None = None
    bankName: str | None = None
    remitReason: str


class GlobalTransactionScreeningResponse(BaseModel):
    globalTransactionId: int
    status: Literal["SUCCESS", "FAILED"]
    failureReason: str | None
    anomalyScore: float
    threshold: float
```

Create `fds/app/model.py`:

```python
from sklearn.ensemble import IsolationForest

from app.schemas import GlobalTransactionScreeningRequest

THRESHOLD = -0.2
_baseline = [[500000, 1300.0, 3], [1000000, 1350.0, 3], [1500000, 1400.0, 3], [2000000, 1450.0, 3]]
_model = IsolationForest(contamination=0.25, random_state=42)
_model.fit(_baseline)


def _features(request: GlobalTransactionScreeningRequest) -> list[float]:
    return [float(request.krwAmount), float(request.exchangeRate), float(len(request.currency))]


def score(request: GlobalTransactionScreeningRequest) -> float:
    return float(_model.score_samples([_features(request)])[0])


def is_risky(request: GlobalTransactionScreeningRequest) -> bool:
    return score(request) < THRESHOLD
```

Create `fds/app/main.py`:

```python
from fastapi import FastAPI

from app.model import THRESHOLD, is_risky, score
from app.schemas import GlobalTransactionScreeningRequest, GlobalTransactionScreeningResponse

app = FastAPI(title="NOVA FDS Server")


@app.post("/fds/global-transactions/screenings", response_model=GlobalTransactionScreeningResponse)
def screen_global_transaction(request: GlobalTransactionScreeningRequest) -> GlobalTransactionScreeningResponse:
    anomaly_score = score(request)
    if is_risky(request):
        return GlobalTransactionScreeningResponse(
            globalTransactionId=request.globalTransactionId,
            status="FAILED",
            failureReason="FDS_RISK_DETECTED",
            anomalyScore=anomaly_score,
            threshold=THRESHOLD,
        )
    return GlobalTransactionScreeningResponse(
        globalTransactionId=request.globalTransactionId,
        status="SUCCESS",
        failureReason=None,
        anomalyScore=anomaly_score,
        threshold=THRESHOLD,
    )
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd fds && python -m pytest tests/test_screening_api.py -q`

Expected: `2 passed`.

---

### Task 2: CoreBanking 상태 enum과 원장 필드

**Files:**
- Modify: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/entity/enums/GlobalTransactionStatus.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/entity/enums/GlobalTransactionFailureReason.java`
- Modify: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/entity/GlobalTransaction.java`
- Test: `coreBanking/src/test/java/woorifisa/project/coreBanking/domain/globalTransaction/entity/GlobalTransactionTest.java`

- [ ] **Step 1: Write the failing test**

Create `GlobalTransactionTest.java` to assert `PENDING`, `SUCCESS`, `FAILED`, `externalRequestId`, and `failureReason` behavior.

```java
@Test
@DisplayName("FDS 실패이면 상태는 FAILED이고 실패 사유를 남긴다")
void markFailed() {
    GlobalTransaction transaction = GlobalTransaction.builder()
            .externalRequestId("global-remittance-1")
            .status(GlobalTransactionStatus.PENDING)
            .build();

    transaction.markFailed(GlobalTransactionFailureReason.FDS_RISK_DETECTED);

    assertThat(transaction.getStatus()).isEqualTo(GlobalTransactionStatus.FAILED);
    assertThat(transaction.getFailureReason()).isEqualTo(GlobalTransactionFailureReason.FDS_RISK_DETECTED);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd coreBanking && bash ./gradlew test --tests woorifisa.project.coreBanking.domain.globalTransaction.entity.GlobalTransactionTest`

Expected: missing enum, fields, and methods cause compile failure.

- [ ] **Step 3: Write minimal implementation**

Use `GlobalTransactionStatus { PENDING, SUCCESS, FAILED }`, create `GlobalTransactionFailureReason`, add `externalRequestId`, `failureReason`, `markSuccess()`, and `markFailed(...)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd coreBanking && bash ./gradlew test --tests woorifisa.project.coreBanking.domain.globalTransaction.entity.GlobalTransactionTest`

Expected: `BUILD SUCCESSFUL`.

---

### Task 3: CoreBanking RestFdsClient와 설정

**Files:**
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/fds/client/FdsClient.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/fds/client/RestFdsClient.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/fds/dto/FdsGlobalTransactionScreeningRequest.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/fds/dto/FdsGlobalTransactionScreeningResponse.java`
- Modify: `coreBanking/src/main/resources/application-local.yaml`
- Modify: `coreBanking/src/main/resources/application-dev.yaml`
- Modify: `coreBanking/src/main/resources/application-prod.yaml`
- Test: `coreBanking/src/test/java/woorifisa/project/coreBanking/domain/globalTransaction/fds/client/RestFdsClientTest.java`

- [ ] **Step 1: Write the failing test**

Test that `RestFdsClient` calls `POST /fds/global-transactions/screenings`, maps `SUCCESS`, and throws on null/invalid response.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd coreBanking && bash ./gradlew test --tests woorifisa.project.coreBanking.domain.globalTransaction.fds.client.RestFdsClientTest`

Expected: `RestFdsClient` missing.

- [ ] **Step 3: Write minimal implementation**

Create `FdsClient.screen(...)`, DTO records, and `RestFdsClient` using `RestClient.Builder`, `@Value("${app.fds.base-url}")`, and `ParameterizedTypeReference<FdsGlobalTransactionScreeningResponse>`.

Set each CoreBanking application profile:

```yaml
app:
  fds:
    base-url: ${FDS_BASE_URL:http://localhost:8001}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd coreBanking && bash ./gradlew test --tests woorifisa.project.coreBanking.domain.globalTransaction.fds.client.RestFdsClientTest`

Expected: `BUILD SUCCESSFUL`.

---

### Task 4: CoreBanking 해외송금 저장과 멱등 처리

**Files:**
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/repository/GlobalTransactionRepository.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/dto/request/CreateGlobalTransactionRequest.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/dto/response/CreateGlobalTransactionResponse.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/service/GlobalTransactionService.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/service/GlobalTransactionFdsService.java`
- Modify: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/accountTransaction/entity/enums/TransactionType.java`
- Modify: `coreBanking/src/main/java/woorifisa/project/coreBanking/global/response/status/BaseResponseStatus.java`
- Test: `coreBanking/src/test/java/woorifisa/project/coreBanking/domain/globalTransaction/service/GlobalTransactionServiceTest.java`

- [ ] **Step 1: Write the failing test**

Create tests for: new request saves withdrawal and `PENDING` ledger, duplicate `externalRequestId` returns existing ledger without additional withdrawal, insufficient balance throws.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd coreBanking && bash ./gradlew test --tests woorifisa.project.coreBanking.domain.globalTransaction.service.GlobalTransactionServiceTest`

Expected: DTO, repository, service, and FDS service missing.

- [ ] **Step 3: Write minimal implementation**

Create `GlobalTransactionRepository.findByExternalRequestId(...)`, `CreateGlobalTransactionRequest`, `CreateGlobalTransactionResponse`, and `GlobalTransactionService.create(...)`. `create(...)` checks idempotency, loads customer/account, parses `krwAmount`, saves withdrawal `AccountTransaction`, debits account, saves `GlobalTransaction` as `PENDING`, and calls `globalTransactionFdsService.screenAsync(saved)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd coreBanking && bash ./gradlew test --tests woorifisa.project.coreBanking.domain.globalTransaction.service.GlobalTransactionServiceTest`

Expected: `BUILD SUCCESSFUL`.

---

### Task 5: CoreBanking FDS 결과 처리와 실패 환급

**Files:**
- Modify: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/service/GlobalTransactionFdsService.java`
- Test: `coreBanking/src/test/java/woorifisa/project/coreBanking/domain/globalTransaction/service/GlobalTransactionFdsServiceTest.java`

- [ ] **Step 1: Write the failing test**

Create tests for: FDS `SUCCESS` marks success, FDS `FAILED` marks failed and refunds, FDS exception marks failed with `FDS_COMMUNICATION_FAILED` and refunds.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd coreBanking && bash ./gradlew test --tests woorifisa.project.coreBanking.domain.globalTransaction.service.GlobalTransactionFdsServiceTest`

Expected: result handling not implemented.

- [ ] **Step 3: Write minimal implementation**

Implement `@Async @Transactional screenAsync(GlobalTransaction transaction)`. On `SUCCESS`, call `markSuccess()`. On `FAILED` or exception, call `markFailed(reason)`, credit `krwAmount`, and save `GLOBAL_REMITTANCE_REFUND` transaction with `externalRequestId + ":refund"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd coreBanking && bash ./gradlew test --tests woorifisa.project.coreBanking.domain.globalTransaction.service.GlobalTransactionFdsServiceTest`

Expected: `BUILD SUCCESSFUL`.

---

### Task 6: CoreBanking 조회 API와 컨트롤러

**Files:**
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/dto/response/GlobalTransactionStatusResponse.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/dto/response/GlobalTransactionListItemResponse.java`
- Create: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/controller/GlobalTransactionController.java`
- Modify: `coreBanking/src/main/java/woorifisa/project/coreBanking/domain/globalTransaction/service/GlobalTransactionService.java`
- Test: `coreBanking/src/test/java/woorifisa/project/coreBanking/domain/globalTransaction/controller/GlobalTransactionControllerTest.java`

- [ ] **Step 1: Write the failing test**

Write `@WebMvcTest(GlobalTransactionController.class)` tests for `POST /global-transactions`, `GET /global-transactions/{globalTransactionId}`, and `GET /global-transactions?customerId=1001`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd coreBanking && bash ./gradlew test --tests woorifisa.project.coreBanking.domain.globalTransaction.controller.GlobalTransactionControllerTest`

Expected: controller and response DTOs missing.

- [ ] **Step 3: Write minimal implementation**

Create controller with `CB-008`, `CB-009`, and `CB-012` endpoints using `BaseResponse`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd coreBanking && bash ./gradlew test --tests woorifisa.project.coreBanking.domain.globalTransaction.controller.GlobalTransactionControllerTest`

Expected: `BUILD SUCCESSFUL`.

---

### Task 7: Backend CoreBanking 해외송금 연동

**Files:**
- Create: `backend/src/main/java/woorifisa/project/backend/domain/banking/dto/corebanking/request/CoreBankingCreateGlobalTransactionRequest.java`
- Create: `backend/src/main/java/woorifisa/project/backend/domain/banking/dto/corebanking/response/CoreBankingCreateGlobalTransactionResponse.java`
- Create: `backend/src/main/java/woorifisa/project/backend/domain/banking/dto/corebanking/response/CoreBankingGlobalTransactionListItemResponse.java`
- Modify: `backend/src/main/java/woorifisa/project/backend/global/corebanking/client/CoreBankingClient.java`
- Modify: `backend/src/main/java/woorifisa/project/backend/global/corebanking/client/RestCoreBankingClient.java`
- Test: `backend/src/test/java/woorifisa/project/backend/global/corebanking/client/RestCoreBankingClientTest.java`

- [ ] **Step 1: Write the failing test**

Add tests that `createGlobalTransaction()` posts to `/global-transactions` and `findGlobalTransactionsByCustomerId()` gets `/global-transactions?customerId=1001`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && bash ./gradlew test --tests woorifisa.project.backend.global.corebanking.client.RestCoreBankingClientTest`

Expected: client methods missing.

- [ ] **Step 3: Write minimal implementation**

Add `createGlobalTransaction(...)` and `findGlobalTransactionsByCustomerId(...)` to `CoreBankingClient` and implement both in `RestCoreBankingClient` with existing `BaseResponse` mapping.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && bash ./gradlew test --tests woorifisa.project.backend.global.corebanking.client.RestCoreBankingClientTest`

Expected: `BUILD SUCCESSFUL`.

---

### Task 8: Backend 사용자 API와 서비스

**Files:**
- Create: `backend/src/main/java/woorifisa/project/backend/domain/banking/dto/request/CreateGlobalTransactionRequest.java`
- Create: `backend/src/main/java/woorifisa/project/backend/domain/banking/dto/response/CreateGlobalTransactionResponse.java`
- Create: `backend/src/main/java/woorifisa/project/backend/domain/banking/dto/response/GlobalTransactionListItemResponse.java`
- Modify: `backend/src/main/java/woorifisa/project/backend/domain/banking/service/BankingService.java`
- Modify: `backend/src/main/java/woorifisa/project/backend/domain/banking/controller/BankingController.java`
- Test: `backend/src/test/java/woorifisa/project/backend/domain/banking/service/BankingServiceTest.java`
- Test: `backend/src/test/java/woorifisa/project/backend/domain/banking/controller/BankingControllerTest.java`

- [ ] **Step 1: Write the failing service test**

Add tests that current user can create a remittance only for their own `AccountRef`, service creates `externalRequestId` from idempotency key, and list retrieval uses current user's linked customer identifier.

- [ ] **Step 2: Run service test to verify it fails**

Run: `cd backend && bash ./gradlew test --tests woorifisa.project.backend.domain.banking.service.BankingServiceTest`

Expected: methods and DTOs missing.

- [ ] **Step 3: Write minimal service implementation**

Add `createGlobalTransaction(Long userId, String idempotencyKey, CreateGlobalTransactionRequest request)` and `findGlobalTransactions(Long userId)`. Use `accountRefRepository.findByUser_UserIdAndAccountId(...)` for ownership and delegate ledger mutation to CoreBanking.

- [ ] **Step 4: Write the failing controller test**

Add MockMvc tests for `POST /banking/global-transactions` requiring `X-Idempotency-Key` and `GET /banking/global-transactions`.

- [ ] **Step 5: Write minimal controller implementation**

Add `POST /banking/global-transactions` and `GET /banking/global-transactions` to `BankingController` using session principal and `BaseResponse`.

- [ ] **Step 6: Run tests to verify they pass**

Run:

```bash
cd backend
bash ./gradlew test --tests woorifisa.project.backend.domain.banking.service.BankingServiceTest
bash ./gradlew test --tests woorifisa.project.backend.domain.banking.controller.BankingControllerTest
```

Expected: both commands show `BUILD SUCCESSFUL`.

---

### Task 9: 회귀 검증과 문서 동기화

**Files:**
- Modify if implementation changes contract: `fds/docs/rest_api.md`
- Modify if implementation changes contract: `coreBanking/docs/rest_api.md`
- Modify if implementation changes contract: `backend/docs/rest_api.md`
- Modify if entity differs from plan: `coreBanking/docs/erd.md`

- [ ] **Step 1: FDS 테스트 실행**

Run: `cd fds && python -m pytest -q`

Expected: all tests pass.

- [ ] **Step 2: CoreBanking 타깃 테스트 실행**

Run: `cd coreBanking && bash ./gradlew test --tests woorifisa.project.coreBanking.domain.globalTransaction.*`

Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 3: Backend 타깃 테스트 실행**

Run: `cd backend && bash ./gradlew test --tests woorifisa.project.backend.domain.banking.* --tests woorifisa.project.backend.global.corebanking.client.RestCoreBankingClientTest`

Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 4: 컴파일 점검**

Run:

```bash
cd coreBanking
bash ./gradlew compileJava
cd ../backend
bash ./gradlew compileJava
```

Expected: both commands show `BUILD SUCCESSFUL`.

- [ ] **Step 5: 문서 충돌 검색**

Run:

```bash
rg "REQUESTED|REVIEWING|APPROVED|REJECTED|COMPLETED" coreBanking docs fds backend/docs
rg "fds-server|folder: fds|FDS-001|CB-008|BANK-009|failure_reason" AGENTS.md docs coreBanking/docs backend/docs fds/docs
```

Expected: first command returns no overseas-remittance status conflicts. Second command returns the updated FDS and remittance contracts.

---

## Self-Review

- Spec coverage: 계획은 FDS 우선 구현, 상태 enum 3개, `failure_reason`, 선출금, 실패 환급, 중복 방지, 비동기 FDS, 사용자별 목록 조회, `fds-server` API를 모두 포함한다.
- Placeholder scan: 구현 단계마다 파일, 테스트, 명령, 기대 결과를 명시했다. 실제 은행 송금 처리는 구현 범위 밖이라 계획에 포함하지 않았다.
- Type consistency: 상태는 Java/Python/API 문서에서 `PENDING | SUCCESS | FAILED`를 사용한다. FDS 응답은 `SUCCESS | FAILED`만 반환한다. 실패 사유는 DB 컬럼 `failure_reason`과 JSON 필드 `failureReason`으로 구분한다.

# Hospital Reservation Cancel API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 병원 예약 취소 API `PATCH /hospital/reservations/{reservation_id}`를 추가하고, 취소 시 슬롯을 다시 예약 가능 상태로 복구한다.

**Architecture:** `hospital` 도메인에서 `Reservation`은 삭제하지 않고 `status`로 상태를 관리한다. 컨트롤러는 `action=CANCEL` 요청만 받아 `BaseResponse.ok(null)`을 반환한다. 서비스는 본인 예약인지 확인한 뒤 예약 상태를 `CANCELED`로 바꾸고 대응 슬롯을 `is_available=true`로 복구한다.

**Tech Stack:** Spring Boot, Spring MVC, Spring Security, Spring Data JPA, JUnit 5, Mockito, JPA Enum mapping

---

## 파일 구조

- 생성: `src/main/java/woorifisa/project/backend/domain/hospital/entity/enums/ReservationStatus.java`
- 생성: `src/main/java/woorifisa/project/backend/domain/hospital/dto/request/UpdateReservationRequest.java`
- 생성: `src/test/java/woorifisa/project/backend/domain/hospital/controller/HospitalReservationCancelControllerTest.java`
- 수정: `src/test/java/woorifisa/project/backend/domain/hospital/service/HospitalReservationServiceTest.java`
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/entity/Reservation.java`
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/entity/HospitalAvailableSlot.java`
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/repository/ReservationRepository.java`
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/controller/HospitalController.java`
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/service/HospitalService.java`
- 수정: `src/main/java/woorifisa/project/backend/global/response/status/BaseExceptionResponseStatus.java`
- 수정: `docs/erd.md`
- 수정: `docs/rest_api.md`

### Task 1: 컨트롤러 RED 테스트 작성

**Files:**
- Create: `src/test/java/woorifisa/project/backend/domain/hospital/controller/HospitalReservationCancelControllerTest.java`

- [ ] **Step 1: 컨트롤러 실패 테스트를 작성한다**

```java
package woorifisa.project.backend.domain.hospital.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.UNAUTHORIZED_SESSION;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.ServletWebSecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import woorifisa.project.backend.domain.hospital.service.HospitalService;
import woorifisa.project.backend.global.auth.security.SessionAuthenticationEntryPoint;
import woorifisa.project.backend.global.auth.security.SessionAuthenticationFilter;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.config.SecurityConfig;

@WebMvcTest(HospitalController.class)
@Import({SecurityConfig.class, SessionAuthenticationFilter.class, SessionAuthenticationEntryPoint.class})
@ImportAutoConfiguration({
    SecurityAutoConfiguration.class,
    ServletWebSecurityAutoConfiguration.class,
    SecurityFilterAutoConfiguration.class
})
class HospitalReservationCancelControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HospitalService hospitalService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @DisplayName("인증 사용자는 예약을 취소할 수 있다")
    void cancelReservation() throws Exception {
        mockMvc.perform(patch("/hospital/reservations/{reservationId}", 1L)
                .with(authentication(authToken()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "action": "CANCEL"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.code").value("20000"))
            .andExpect(jsonPath("$.data").doesNotExist());

        verify(hospitalService).cancelReservation(eq(1L), eq(1L));
    }

    @Test
    @DisplayName("비인증 사용자는 예약을 취소할 수 없다")
    void cancelReservationUnauthorized() throws Exception {
        mockMvc.perform(patch("/hospital/reservations/{reservationId}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "action": "CANCEL"
                    }
                    """))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.code").value(UNAUTHORIZED_SESSION.getCode()))
            .andExpect(jsonPath("$.message").value(UNAUTHORIZED_SESSION.getMessage()))
            .andExpect(jsonPath("$.data").doesNotExist());
    }

    private UsernamePasswordAuthenticationToken authToken() {
        return new UsernamePasswordAuthenticationToken(
            new SessionUserPrincipal(1L),
            null,
            AuthorityUtils.NO_AUTHORITIES
        );
    }
}
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.controller.HospitalReservationCancelControllerTest"`

Expected: FAIL with missing endpoint, missing request DTO, or missing `cancelReservation(...)`.

### Task 2: 서비스 RED 테스트 작성

**Files:**
- Modify: `src/test/java/woorifisa/project/backend/domain/hospital/service/HospitalReservationServiceTest.java`

- [ ] **Step 1: 서비스 실패 테스트를 추가한다**

추가할 테스트 항목:

- 본인 예약이면 상태를 `CANCELED`로 바꾸고 슬롯을 `true`로 복구한다
- 예약이 없으면 예외를 던진다
- 본인 예약이 아니면 예외를 던진다
- 이미 `CANCELED` 상태면 예외를 던진다

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.service.HospitalReservationServiceTest"`

Expected: FAIL with missing `status`, missing `cancelReservation(...)`, or missing slot recovery method.

### Task 3: 최소 구현으로 GREEN 만들기

**Files:**
- Create: `src/main/java/woorifisa/project/backend/domain/hospital/entity/enums/ReservationStatus.java`
- Create: `src/main/java/woorifisa/project/backend/domain/hospital/dto/request/UpdateReservationRequest.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/entity/Reservation.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/entity/HospitalAvailableSlot.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/repository/ReservationRepository.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/controller/HospitalController.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/service/HospitalService.java`
- Modify: `src/main/java/woorifisa/project/backend/global/response/status/BaseExceptionResponseStatus.java`

- [ ] **Step 1: 예약 상태 enum과 요청 DTO를 추가한다**

```java
public enum ReservationStatus {
    RESERVED,
    CANCELED
}
```

```java
public record UpdateReservationRequest(
    String action
) {
}
```

- [ ] **Step 2: `Reservation` 엔티티에 상태 컬럼과 상태 전이 메서드를 추가한다**

추가 내용:
- `@Enumerated(EnumType.STRING)`
- `ReservationStatus status`
- `cancel()` 메서드

신규 예약 생성 시 기본값은 `RESERVED`로 설정한다.

- [ ] **Step 3: 슬롯 복구 메서드를 추가한다**

`HospitalAvailableSlot`에:

```java
public void markAvailable() {
    this.isAvailable = true;
}
```

- [ ] **Step 4: 예약 조회용 리포지토리 메서드를 추가한다**

예:

```java
Optional<Reservation> findByReservationIdAndUserUserId(Long reservationId, Long userId);
```

또는 서비스 검증 흐름에 맞는 최소 조회 메서드를 추가한다.

- [ ] **Step 5: 예외 코드를 추가한다**

최소 후보:
- 예약 없음
- 본인 예약 아님 또는 조회 불가
- 이미 취소된 예약
- 유효하지 않은 action

예외 명은 `HOSPITAL_*` 계열로 추가한다.

- [ ] **Step 6: 서비스 취소 로직을 추가한다**

핵심 흐름:

1. 예약 조회
2. 본인 예약인지 확인
3. 상태가 `RESERVED`인지 확인
4. 슬롯 조회
5. 예약 `CANCELED` 처리
6. 슬롯 `markAvailable()`

- [ ] **Step 7: 컨트롤러 취소 엔드포인트를 추가한다**

예:

```java
@PatchMapping("/reservations/{reservationId}")
public BaseResponse<Void> updateReservation(
    @AuthenticationPrincipal SessionUserPrincipal principal,
    @PathVariable Long reservationId,
    @RequestBody UpdateReservationRequest request
) {
    hospitalService.cancelReservation(principal.userId(), reservationId);
    return BaseResponse.ok(null);
}
```

현재 1차 범위에서는 `action=CANCEL`만 허용하고, 다른 action이면 예외 처리한다.

- [ ] **Step 8: 타깃 테스트를 다시 실행한다**

Run:
- `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.controller.HospitalReservationCancelControllerTest"`
- `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.service.HospitalReservationServiceTest"`

Expected: PASS

### Task 4: 문서와 회귀 검증

**Files:**
- Modify: `docs/erd.md`
- Modify: `docs/rest_api.md`

- [ ] **Step 1: ERD 문서를 상태 컬럼 기준으로 수정한다**

반영 내용:
- `reservation.status`
- enum 값 `RESERVED`, `CANCELED`

- [ ] **Step 2: REST API 문서를 취소 중심으로 수정한다**

반영 내용:
- `PATCH /hospital/reservations/{reservation_id}`
- 요청 `action=CANCEL`
- 응답 `data = null`

- [ ] **Step 3: hospital 범위 테스트를 실행한다**

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.*"`

Expected: PASS

- [ ] **Step 4: 컴파일 검증을 실행한다**

Run: `cmd /c gradlew.bat compileJava`

Expected: BUILD SUCCESSFUL

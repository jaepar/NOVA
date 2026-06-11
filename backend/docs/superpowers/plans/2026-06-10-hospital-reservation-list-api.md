# Hospital Reservation List API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 로그인 사용자의 병원 예약 내역을 조회하는 `GET /hospital/reservations` API를 추가한다.

**Architecture:** 컨트롤러는 세션 사용자 기준으로 예약 목록을 조회하고 `BaseResponse`로 감싼 DTO를 반환한다. 서비스는 `ReservationRepository`에서 사용자 예약을 최신순으로 조회하고, DTO 변환 책임은 응답 DTO 쪽 정적 팩토리 메서드로 둔다.

**Tech Stack:** Spring Boot, Spring MVC, Spring Security, Spring Data JPA, JUnit 5, Mockito, Jackson

---

## 파일 구조

- 생성: `src/main/java/woorifisa/project/backend/domain/hospital/dto/response/ReservationListItem.java`
- 생성: `src/main/java/woorifisa/project/backend/domain/hospital/dto/response/ReservationListResponse.java`
- 생성: `src/test/java/woorifisa/project/backend/domain/hospital/controller/HospitalReservationListControllerTest.java`
- 수정: `src/test/java/woorifisa/project/backend/domain/hospital/service/HospitalReservationServiceTest.java`
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/repository/ReservationRepository.java`
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/controller/HospitalController.java`
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/service/HospitalService.java`
- 수정: `docs/rest_api.md`

### Task 1: 컨트롤러 RED 테스트 작성

**Files:**
- Create: `src/test/java/woorifisa/project/backend/domain/hospital/controller/HospitalReservationListControllerTest.java`

- [ ] **Step 1: 컨트롤러 실패 테스트를 작성한다**

```java
package woorifisa.project.backend.domain.hospital.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.UNAUTHORIZED_SESSION;

import java.time.LocalDateTime;
import java.util.List;

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

import woorifisa.project.backend.domain.hospital.dto.response.ReservationListItem;
import woorifisa.project.backend.domain.hospital.dto.response.ReservationListResponse;
import woorifisa.project.backend.domain.hospital.entity.enums.ReservationStatus;
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
class HospitalReservationListControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HospitalService hospitalService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @DisplayName("인증 사용자는 본인 예약 목록을 조회할 수 있다")
    void findReservations() throws Exception {
        when(hospitalService.findReservations(1L)).thenReturn(new ReservationListResponse(List.of(
            new ReservationListItem(
                1L,
                2L,
                "강남튼튼정형외과",
                "이준호",
                LocalDateTime.of(2026, 6, 10, 14, 0),
                ReservationStatus.RESERVED
            )
        )));

        mockMvc.perform(get("/hospital/reservations")
                .with(authentication(authToken()))
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.items", hasSize(1)))
            .andExpect(jsonPath("$.data.items[0].reservation_id").value(1))
            .andExpect(jsonPath("$.data.items[0].hospital_id").value(2))
            .andExpect(jsonPath("$.data.items[0].hospital_name").value("강남튼튼정형외과"))
            .andExpect(jsonPath("$.data.items[0].doctor_name").value("이준호"))
            .andExpect(jsonPath("$.data.items[0].reserved_at").value("2026-06-10T14:00:00"))
            .andExpect(jsonPath("$.data.items[0].status").value("RESERVED"));

        verify(hospitalService).findReservations(1L);
    }

    @Test
    @DisplayName("비인증 사용자는 예약 목록을 조회할 수 없다")
    void findReservationsUnauthorized() throws Exception {
        mockMvc.perform(get("/hospital/reservations")
                .accept(MediaType.APPLICATION_JSON))
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

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.controller.HospitalReservationListControllerTest"`

Expected: FAIL with missing endpoint, missing DTO, or missing `findReservations(...)`.

### Task 2: 서비스 RED 테스트 작성

**Files:**
- Modify: `src/test/java/woorifisa/project/backend/domain/hospital/service/HospitalReservationServiceTest.java`

- [ ] **Step 1: 서비스 실패 테스트를 추가한다**

추가할 테스트 항목:

- 사용자 예약 목록을 최신순으로 반환한다
- 병원명/의사명/상태가 응답에 포함된다

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.service.HospitalReservationServiceTest"`

Expected: FAIL with missing repository method, missing DTO, or missing `findReservations(...)`.

### Task 3: 최소 구현으로 GREEN 만들기

**Files:**
- Create: `src/main/java/woorifisa/project/backend/domain/hospital/dto/response/ReservationListItem.java`
- Create: `src/main/java/woorifisa/project/backend/domain/hospital/dto/response/ReservationListResponse.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/repository/ReservationRepository.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/controller/HospitalController.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/service/HospitalService.java`

- [ ] **Step 1: 예약 목록 응답 DTO를 추가한다**

필드:
- `reservation_id`
- `hospital_id`
- `hospital_name`
- `doctor_name`
- `reserved_at`
- `status`

DTO 변환 책임은 정적 팩토리 메서드로 둔다.

- [ ] **Step 2: 사용자 기준 예약 목록 조회 메서드를 리포지토리에 추가한다**

예:

```java
List<Reservation> findAllByUserUserIdOrderByReservedAtDesc(Long userId);
```

- [ ] **Step 3: 서비스에 예약 목록 조회 메서드를 추가한다**

예:

```java
public ReservationListResponse findReservations(Long userId) {
    return ReservationListResponse.from(
        reservationRepository.findAllByUserUserIdOrderByReservedAtDesc(userId)
    );
}
```

- [ ] **Step 4: 컨트롤러에 조회 엔드포인트를 추가한다**

예:

```java
@GetMapping("/reservations")
public BaseResponse<ReservationListResponse> findReservations(
    @AuthenticationPrincipal SessionUserPrincipal principal
) {
    return BaseResponse.ok(hospitalService.findReservations(principal.userId()));
}
```

- [ ] **Step 5: 타깃 테스트를 다시 실행한다**

Run:
- `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.controller.HospitalReservationListControllerTest"`
- `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.service.HospitalReservationServiceTest"`

Expected: PASS

### Task 4: 문서와 회귀 검증

**Files:**
- Modify: `docs/rest_api.md`

- [ ] **Step 1: REST API 문서를 세션 사용자 기준 경로로 수정한다**

반영 내용:
- `GET /hospital/reservations`
- 응답 필드 6개

- [ ] **Step 2: hospital 범위 테스트를 실행한다**

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.*"`

Expected: PASS

- [ ] **Step 3: 컴파일 검증을 실행한다**

Run: `cmd /c gradlew.bat compileJava`

Expected: BUILD SUCCESSFUL

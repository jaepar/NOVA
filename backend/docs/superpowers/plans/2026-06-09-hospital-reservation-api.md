# Hospital Reservation API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `reserved_at` 기반 병원 예약 생성 API `POST /hospital/reservations`를 추가한다.

**Architecture:** `hospital` 도메인에서 컨트롤러는 인증 사용자 요청을 받고 `BaseResponse.ok(null)`만 반환한다. 서비스는 사용자와 병원을 조회한 뒤 `Reservation`을 생성하고 저장한다. `Reservation`은 문자열 `rsv_date` 대신 `LocalDateTime reservedAt`을 사용한다.

**Tech Stack:** Spring Boot, Spring MVC, Spring Security, Spring Data JPA, JUnit 5, Mockito, Jackson, Java Time

---

## 파일 구조

- 생성: `src/test/java/woorifisa/project/backend/domain/hospital/controller/HospitalReservationControllerTest.java`
- 생성: `src/test/java/woorifisa/project/backend/domain/hospital/service/HospitalReservationServiceTest.java`
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/controller/HospitalController.java`
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/service/HospitalService.java`
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/entity/Reservation.java`
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/dto/request/CreateReservationRequest.java`
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/dto/response/CreateReservationResponse.java`
- 수정: `src/main/java/woorifisa/project/backend/global/response/status/BaseExceptionResponseStatus.java`
- 수정: `docs/erd.md`
- 수정: `docs/rest_api.md`

### Task 1: 컨트롤러 RED 테스트 작성

**Files:**
- Create: `src/test/java/woorifisa/project/backend/domain/hospital/controller/HospitalReservationControllerTest.java`

- [ ] **Step 1: 컨트롤러 실패 테스트를 작성한다**

```java
package woorifisa.project.backend.domain.hospital.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

import woorifisa.project.backend.domain.hospital.dto.request.CreateReservationRequest;
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
class HospitalReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @MockitoBean
    private HospitalService hospitalService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @DisplayName("인증 사용자는 병원 예약을 생성할 수 있다")
    void createReservation() throws Exception {
        CreateReservationRequest request = new CreateReservationRequest(
            1L,
            java.time.LocalDateTime.of(2026, 6, 10, 14, 0)
        );

        mockMvc.perform(post("/hospital/reservations")
                .with(authentication(authToken()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.code").value("20000"))
            .andExpect(jsonPath("$.data").doesNotExist());

        verify(hospitalService).createReservation(eq(1L), eq(request));
    }

    @Test
    @DisplayName("비인증 사용자는 병원 예약을 생성할 수 없다")
    void createReservationUnauthorized() throws Exception {
        CreateReservationRequest request = new CreateReservationRequest(
            1L,
            java.time.LocalDateTime.of(2026, 6, 10, 14, 0)
        );

        mockMvc.perform(post("/hospital/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
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

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.controller.HospitalReservationControllerTest"`

Expected: FAIL with missing `createReservation(...)`, missing request fields, or missing `/hospital/reservations` endpoint.

### Task 2: 서비스 RED 테스트 작성

**Files:**
- Create: `src/test/java/woorifisa/project/backend/domain/hospital/service/HospitalReservationServiceTest.java`

- [ ] **Step 1: 서비스 실패 테스트를 작성한다**

```java
package woorifisa.project.backend.domain.hospital.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.HOSPITAL_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.USER_NOT_FOUND;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import woorifisa.project.backend.domain.hospital.dto.request.CreateReservationRequest;
import woorifisa.project.backend.domain.hospital.entity.Hospital;
import woorifisa.project.backend.domain.hospital.repository.HospitalRepository;
import woorifisa.project.backend.domain.hospital.repository.ReservationRepository;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.exception.CustomException;

class HospitalReservationServiceTest {

    @Test
    @DisplayName("병원과 사용자가 존재하면 예약을 저장한다")
    void createReservation() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        ReservationRepository reservationRepository = mock(ReservationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        HospitalService hospitalService = new HospitalService(hospitalRepository, reservationRepository, userRepository);
        CreateReservationRequest request = new CreateReservationRequest(
            1L,
            LocalDateTime.of(2026, 6, 10, 14, 0)
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(mock(User.class)));
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(mock(Hospital.class)));

        hospitalService.createReservation(1L, request);

        verify(userRepository).findById(1L);
        verify(hospitalRepository).findById(1L);
        verify(reservationRepository).save(any());
    }

    @Test
    @DisplayName("병원이 없으면 예외를 던진다")
    void createReservationHospitalNotFound() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        ReservationRepository reservationRepository = mock(ReservationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        HospitalService hospitalService = new HospitalService(hospitalRepository, reservationRepository, userRepository);
        CreateReservationRequest request = new CreateReservationRequest(
            999L,
            LocalDateTime.of(2026, 6, 10, 14, 0)
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(mock(User.class)));
        when(hospitalRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> hospitalService.createReservation(1L, request))
            .isInstanceOf(CustomException.class)
            .extracting("exceptionStatus")
            .isEqualTo(HOSPITAL_NOT_FOUND);
    }

    @Test
    @DisplayName("사용자가 없으면 예외를 던진다")
    void createReservationUserNotFound() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        ReservationRepository reservationRepository = mock(ReservationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        HospitalService hospitalService = new HospitalService(hospitalRepository, reservationRepository, userRepository);
        CreateReservationRequest request = new CreateReservationRequest(
            1L,
            LocalDateTime.of(2026, 6, 10, 14, 0)
        );

        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> hospitalService.createReservation(1L, request))
            .isInstanceOf(CustomException.class)
            .extracting("exceptionStatus")
            .isEqualTo(USER_NOT_FOUND);
    }
}
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.service.HospitalReservationServiceTest"`

Expected: FAIL with missing constructor, missing `createReservation(...)`, missing `HOSPITAL_NOT_FOUND`, or `CreateReservationRequest` fields mismatch.

### Task 3: 최소 구현으로 GREEN 만들기

**Files:**
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/entity/Reservation.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/dto/request/CreateReservationRequest.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/controller/HospitalController.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/service/HospitalService.java`
- Modify: `src/main/java/woorifisa/project/backend/global/response/status/BaseExceptionResponseStatus.java`

- [ ] **Step 1: 병원 예약 요청 DTO를 추가한다**

```java
package woorifisa.project.backend.domain.hospital.dto.request;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateReservationRequest(
    @JsonProperty("hospital_id")
    Long hospitalId,
    @JsonProperty("reserved_at")
    LocalDateTime reservedAt
) {
}
```

- [ ] **Step 2: `Reservation` 엔티티를 `reserved_at` 기준으로 변경한다**

```java
package woorifisa.project.backend.domain.hospital.entity;

import java.time.LocalDateTime;

// 기존 import 유지

@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "reservation")
public class Reservation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Long reservationId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Column(name = "reserved_at", nullable = false)
    private LocalDateTime reservedAt;
}
```

- [ ] **Step 3: 병원 예외 코드를 추가한다**

```java
HOSPITAL_NOT_FOUND("HOSPITAL-001", "병원 정보를 찾을 수 없습니다."),
```
위치는 도메인 예외 분류 흐름에 맞춰 `user`와 `job` 사이 또는 별도 hospital 주석 블록으로 정리한다.

- [ ] **Step 4: 서비스 최소 구현을 추가한다**

```java
package woorifisa.project.backend.domain.hospital.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.HOSPITAL_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.USER_NOT_FOUND;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import woorifisa.project.backend.domain.hospital.dto.request.CreateReservationRequest;
import woorifisa.project.backend.domain.hospital.dto.response.HospitalListResponse;
import woorifisa.project.backend.domain.hospital.entity.Hospital;
import woorifisa.project.backend.domain.hospital.entity.Reservation;
import woorifisa.project.backend.domain.hospital.entity.enums.DepartmentType;
import woorifisa.project.backend.domain.hospital.repository.HospitalRepository;
import woorifisa.project.backend.domain.hospital.repository.ReservationRepository;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.exception.CustomException;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public HospitalListResponse findHospitals(DepartmentType type) {
        List<Hospital> hospitals = type == null
            ? hospitalRepository.findAll()
            : hospitalRepository.findAllByType(type);

        return HospitalListResponse.from(hospitals);
    }

    public void createReservation(Long userId, CreateReservationRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new CustomException(USER_NOT_FOUND));

        Hospital hospital = hospitalRepository.findById(request.hospitalId())
            .orElseThrow(() -> new CustomException(HOSPITAL_NOT_FOUND));

        reservationRepository.save(
            Reservation.builder()
                .user(user)
                .hospital(hospital)
                .reservedAt(request.reservedAt())
                .build()
        );
    }
}
```

- [ ] **Step 5: 컨트롤러 최소 구현을 추가한다**

```java
@PostMapping("/reservations")
public BaseResponse<Void> createReservation(
    @AuthenticationPrincipal SessionUserPrincipal principal,
    @RequestBody CreateReservationRequest request
) {
    hospitalService.createReservation(principal.userId(), request);
    return BaseResponse.ok(null);
}
```

- [ ] **Step 6: 타깃 테스트를 다시 실행한다**

Run:
- `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.controller.HospitalReservationControllerTest"`
- `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.service.HospitalReservationServiceTest"`

Expected: PASS

### Task 4: 문서와 회귀 검증

**Files:**
- Modify: `docs/erd.md`
- Modify: `docs/rest_api.md`

- [ ] **Step 1: ERD 문서를 `reserved_at` 기준으로 수정한다**

예시:

```md
  RESERVATION {
    BIGINT reservation_id PK
    BIGINT user_id FK
    BIGINT hospital_id FK
    DATETIME reserved_at
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }
```

- [ ] **Step 2: REST API 문서를 예약 생성 계약에 맞춘다**

반영 내용:
- `POST /hospital/reservations`
- 요청 필드 `hospital_id`, `reserved_at`
- 성공 응답 `data = null`

- [ ] **Step 3: hospital 범위 테스트를 실행한다**

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.*"`

Expected: PASS

- [ ] **Step 4: 컴파일 검증을 실행한다**

Run: `cmd /c gradlew.bat compileJava`

Expected: BUILD SUCCESSFUL

### Task 5: 최종 점검

**Files:**
- Review: `src/main/java/woorifisa/project/backend/domain/hospital/*`
- Review: `docs/erd.md`
- Review: `docs/rest_api.md`

- [ ] **Step 1: 범위 밖 기능이 들어가지 않았는지 확인한다**

Check:
- 예약 충돌 검증 없음
- 의사 시간 검증 테이블 없음
- 예약 조회/변경/취소 없음

- [ ] **Step 2: 최종 변경 파일만 남았는지 확인한다**

Run: `git status --short`

Expected: 병원 예약 생성 API와 직접 관련된 파일만 표시된다.

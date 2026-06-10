# Hospital List API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `GET /hospital` 병원 목록 조회 API를 추가하고, 선택형 `type` 필터를 지원한다.

**Architecture:** `hospital` 도메인 안에서 컨트롤러는 요청/응답만 처리하고, 서비스는 `type` 유무에 따라 전체 조회 또는 진료과 필터 조회를 선택한다. JPA 리포지토리는 `findAll()`과 `findAllByType(...)`를 사용하고, 응답은 엔티티 대신 DTO로 매핑한다.

**Tech Stack:** Spring Boot, Spring MVC, Spring Security, Spring Data JPA, JUnit 5, Mockito

---

## 파일 구조

- 생성: `src/test/java/woorifisa/project/backend/domain/hospital/controller/HospitalControllerTest.java`
- 생성: `src/test/java/woorifisa/project/backend/domain/hospital/service/HospitalServiceTest.java`
- 생성: `src/main/java/woorifisa/project/backend/domain/hospital/dto/response/HospitalItem.java`
- 생성: `src/main/java/woorifisa/project/backend/domain/hospital/dto/response/HospitalListResponse.java`
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/controller/HospitalController.java`
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/service/HospitalService.java`
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/repository/HospitalRepository.java`
- 수정: `docs/rest_api.md`

### Task 1: 컨트롤러 RED 테스트 작성

**Files:**
- Create: `src/test/java/woorifisa/project/backend/domain/hospital/controller/HospitalControllerTest.java`
- Test: `src/test/java/woorifisa/project/backend/domain/hospital/controller/HospitalControllerTest.java`

- [ ] **Step 1: 컨트롤러 실패 테스트를 작성한다**

```java
package woorifisa.project.backend.domain.hospital.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.UNAUTHORIZED_SESSION;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.ServletWebSecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import woorifisa.project.backend.domain.hospital.dto.response.HospitalItem;
import woorifisa.project.backend.domain.hospital.dto.response.HospitalListResponse;
import woorifisa.project.backend.domain.hospital.entity.enums.DepartmentType;
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
class HospitalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HospitalService hospitalService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @DisplayName("인증 사용자는 전체 병원 목록을 조회할 수 있다")
    void findHospitals() throws Exception {
        when(hospitalService.findHospitals(null)).thenReturn(new HospitalListResponse(List.of(
            new HospitalItem(
                1L,
                "우리내과",
                DepartmentType.INTERNAL_MEDICINE,
                "김의사",
                "서울 중구",
                "09:00",
                "18:00",
                "13:00-14:00",
                "일요일"
            )
        )));

        mockMvc.perform(get("/hospital")
                .with(authentication(authToken()))
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.items", hasSize(1)))
            .andExpect(jsonPath("$.data.items[0].hospital_id").value(1))
            .andExpect(jsonPath("$.data.items[0].type").value("INTERNAL_MEDICINE"));

        verify(hospitalService).findHospitals(null);
    }

    @Test
    @DisplayName("인증 사용자는 type 필터로 병원 목록을 조회할 수 있다")
    void findHospitalsByType() throws Exception {
        when(hospitalService.findHospitals(DepartmentType.ORTHOPEDICS))
            .thenReturn(new HospitalListResponse(List.of()));

        mockMvc.perform(get("/hospital")
                .param("type", "ORTHOPEDICS")
                .with(authentication(authToken()))
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.items", hasSize(0)));

        verify(hospitalService).findHospitals(eq(DepartmentType.ORTHOPEDICS));
    }

    @Test
    @DisplayName("비인증 사용자는 병원 목록을 조회할 수 없다")
    void findHospitalsUnauthorized() throws Exception {
        mockMvc.perform(get("/hospital")
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

Run: `bash ./gradlew test --tests "woorifisa.project.backend.domain.hospital.controller.HospitalControllerTest"`

Expected: FAIL with missing DTO, missing `findHospitals(...)`, or missing `GET /hospital` endpoint.

- [ ] **Step 3: 실패 원인이 설계와 맞는지 확인한다**

Expected check:
- `HospitalController`에 `GET /hospital`가 아직 없음
- `HospitalService.findHospitals(...)`가 아직 없음
- 응답 DTO가 아직 없음

### Task 2: 서비스 RED 테스트 작성

**Files:**
- Create: `src/test/java/woorifisa/project/backend/domain/hospital/service/HospitalServiceTest.java`
- Test: `src/test/java/woorifisa/project/backend/domain/hospital/service/HospitalServiceTest.java`

- [ ] **Step 1: 서비스 실패 테스트를 작성한다**

```java
package woorifisa.project.backend.domain.hospital.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import woorifisa.project.backend.domain.hospital.dto.response.HospitalListResponse;
import woorifisa.project.backend.domain.hospital.entity.Hospital;
import woorifisa.project.backend.domain.hospital.entity.enums.DepartmentType;
import woorifisa.project.backend.domain.hospital.repository.HospitalRepository;

class HospitalServiceTest {

    @Test
    @DisplayName("type이 없으면 전체 병원 목록을 조회한다")
    void findHospitalsWithoutType() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        HospitalService hospitalService = new HospitalService(hospitalRepository);
        when(hospitalRepository.findAll()).thenReturn(List.of(
            Hospital.builder()
                .hospitalId(1L)
                .name("우리내과")
                .type(DepartmentType.INTERNAL_MEDICINE)
                .doctorName("김의사")
                .address("서울 중구")
                .openTime("09:00")
                .closeTime("18:00")
                .breakTime("13:00-14:00")
                .dayOff("일요일")
                .build()
        ));

        HospitalListResponse response = hospitalService.findHospitals(null);

        verify(hospitalRepository).findAll();
        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).hospitalId()).isEqualTo(1L);
        assertThat(response.items().get(0).type()).isEqualTo(DepartmentType.INTERNAL_MEDICINE);
    }

    @Test
    @DisplayName("type이 있으면 해당 진료과 병원 목록만 조회한다")
    void findHospitalsWithType() {
        HospitalRepository hospitalRepository = mock(HospitalRepository.class);
        HospitalService hospitalService = new HospitalService(hospitalRepository);
        when(hospitalRepository.findAllByType(DepartmentType.DENTAL)).thenReturn(List.of(
            Hospital.builder()
                .hospitalId(2L)
                .name("미소치과")
                .type(DepartmentType.DENTAL)
                .doctorName("박의사")
                .address("서울 강남구")
                .openTime("10:00")
                .closeTime("19:00")
                .breakTime("13:00-14:00")
                .dayOff("일요일")
                .build()
        ));

        HospitalListResponse response = hospitalService.findHospitals(DepartmentType.DENTAL);

        verify(hospitalRepository).findAllByType(DepartmentType.DENTAL);
        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).hospitalId()).isEqualTo(2L);
        assertThat(response.items().get(0).name()).isEqualTo("미소치과");
    }
}
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

Run: `bash ./gradlew test --tests "woorifisa.project.backend.domain.hospital.service.HospitalServiceTest"`

Expected: FAIL with missing constructor, missing DTO, or missing `findAllByType(...)`.

- [ ] **Step 3: 실패 원인이 설계와 맞는지 확인한다**

Expected check:
- `HospitalService`가 repository 의존성만 받도록 바뀌어야 함
- `HospitalRepository.findAllByType(...)`가 아직 없음
- DTO 매핑 메서드가 아직 없음

### Task 3: 최소 구현으로 GREEN 만들기

**Files:**
- Create: `src/main/java/woorifisa/project/backend/domain/hospital/dto/response/HospitalItem.java`
- Create: `src/main/java/woorifisa/project/backend/domain/hospital/dto/response/HospitalListResponse.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/controller/HospitalController.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/service/HospitalService.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/repository/HospitalRepository.java`

- [ ] **Step 1: 응답 DTO를 추가한다**

```java
package woorifisa.project.backend.domain.hospital.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import woorifisa.project.backend.domain.hospital.entity.enums.DepartmentType;

public record HospitalItem(
    @JsonProperty("hospital_id")
    Long hospitalId,
    String name,
    DepartmentType type,
    @JsonProperty("doctor_name")
    String doctorName,
    String address,
    @JsonProperty("open_time")
    String openTime,
    @JsonProperty("close_time")
    String closeTime,
    @JsonProperty("break_time")
    String breakTime,
    @JsonProperty("day_off")
    String dayOff
) {
}
```

```java
package woorifisa.project.backend.domain.hospital.dto.response;

import java.util.List;

public record HospitalListResponse(
    List<HospitalItem> items
) {
}
```

- [ ] **Step 2: 리포지토리에 진료과 조건 조회 메서드를 추가한다**

```java
package woorifisa.project.backend.domain.hospital.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import woorifisa.project.backend.domain.hospital.entity.Hospital;
import woorifisa.project.backend.domain.hospital.entity.enums.DepartmentType;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    List<Hospital> findAllByType(DepartmentType type);
}
```

- [ ] **Step 3: 서비스 최소 구현을 추가한다**

```java
package woorifisa.project.backend.domain.hospital.service;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import woorifisa.project.backend.domain.hospital.dto.response.HospitalItem;
import woorifisa.project.backend.domain.hospital.dto.response.HospitalListResponse;
import woorifisa.project.backend.domain.hospital.entity.Hospital;
import woorifisa.project.backend.domain.hospital.entity.enums.DepartmentType;
import woorifisa.project.backend.domain.hospital.repository.HospitalRepository;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public HospitalListResponse findHospitals(DepartmentType type) {
        List<Hospital> hospitals = type == null
            ? hospitalRepository.findAll()
            : hospitalRepository.findAllByType(type);

        return new HospitalListResponse(
            hospitals.stream()
                .map(this::toItem)
                .toList()
        );
    }

    private HospitalItem toItem(Hospital hospital) {
        return new HospitalItem(
            hospital.getHospitalId(),
            hospital.getName(),
            hospital.getType(),
            hospital.getDoctorName(),
            hospital.getAddress(),
            hospital.getOpenTime(),
            hospital.getCloseTime(),
            hospital.getBreakTime(),
            hospital.getDayOff()
        );
    }
}
```

- [ ] **Step 4: 컨트롤러 최소 구현을 추가한다**

```java
package woorifisa.project.backend.domain.hospital.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import woorifisa.project.backend.domain.hospital.dto.response.HospitalListResponse;
import woorifisa.project.backend.domain.hospital.entity.enums.DepartmentType;
import woorifisa.project.backend.domain.hospital.service.HospitalService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/hospital")
public class HospitalController {

    private final HospitalService hospitalService;

    @GetMapping
    public BaseResponse<HospitalListResponse> findHospitals(
        @AuthenticationPrincipal SessionUserPrincipal principal,
        @RequestParam(required = false) DepartmentType type
    ) {
        return BaseResponse.ok(hospitalService.findHospitals(type));
    }
}
```

- [ ] **Step 5: 컨트롤러/서비스 타깃 테스트를 다시 실행한다**

Run:
- `bash ./gradlew test --tests "woorifisa.project.backend.domain.hospital.controller.HospitalControllerTest"`
- `bash ./gradlew test --tests "woorifisa.project.backend.domain.hospital.service.HospitalServiceTest"`

Expected: PASS

### Task 4: 문서와 회귀 검증

**Files:**
- Modify: `docs/rest_api.md`

- [ ] **Step 1: API 문서를 현재 구현과 맞춘다**

`HOSPITAL-004` 설명을 아래 의미로 맞춘다.

```md
| `HOSPITAL-004` | 병원 목록 확인 | GET | `/` | O | USER | `type` 쿼리 파라미터 선택 지원 |
```
```

- [ ] **Step 2: hospital 타깃 테스트를 한 번 더 실행한다**

Run: `bash ./gradlew test --tests "woorifisa.project.backend.domain.hospital.*"`

Expected: PASS

- [ ] **Step 3: 컴파일 검증을 실행한다**

Run: `bash ./gradlew compileJava`

Expected: BUILD SUCCESSFUL

- [ ] **Step 4: 필요 시 전체 테스트를 실행한다**

Run: `bash ./gradlew test`

Expected: 전체 테스트가 기존 기준에서 통과하거나, 무관한 기존 실패가 있으면 그 증거를 기록한다.

### Task 5: 마무리 점검

**Files:**
- Review: `src/main/java/woorifisa/project/backend/domain/hospital/controller/HospitalController.java`
- Review: `src/main/java/woorifisa/project/backend/domain/hospital/service/HospitalService.java`
- Review: `docs/rest_api.md`

- [ ] **Step 1: 리팩터링 범위를 확인한다**

Check:
- 동작 변경 없는 이름 정리만 허용
- 무관한 예약 API 작업 금지
- 엔티티 직접 응답 금지 유지

- [ ] **Step 2: 최종 변경 파일만 남았는지 확인한다**

Run: `git status --short`

Expected: 병원 목록 조회 API와 직접 관련된 파일만 표시된다.

# 병원 예약 가능 시간 조회 API 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 특정 병원과 특정 날짜를 기준으로 30분 단위 예약 슬롯 목록을 조회하는 API를 추가한다.

**Architecture:** 기존 `hospital` 도메인 안에서 컨트롤러는 `hospital_id + date` 요청을 받고, 서비스는 병원 존재 여부와 날짜 범위를 검증한 뒤 슬롯을 조회한다. 응답 변환은 기존 원칙대로 DTO 정적 팩토리 메서드에서 처리하고, 슬롯이 없는 경우에는 빈 목록을 반환한다.

**Tech Stack:** Spring Boot, Spring MVC, Spring Data JPA, JUnit 5, Mockito, MockMvc

---

## 파일 구조

- 생성: `src/main/java/woorifisa/project/backend/domain/hospital/dto/response/HospitalAvailableSlotItem.java`
  - 슬롯 1건 응답 DTO
- 생성: `src/main/java/woorifisa/project/backend/domain/hospital/dto/response/HospitalAvailableSlotResponse.java`
  - 날짜 기준 슬롯 목록 응답 DTO
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/controller/HospitalController.java`
  - 신규 조회 엔드포인트 추가
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/service/HospitalService.java`
  - 슬롯 조회 서비스 메서드 추가
- 수정: `src/main/java/woorifisa/project/backend/domain/hospital/repository/HospitalAvailableSlotRepository.java`
  - 날짜 범위 슬롯 조회 메서드 추가
- 생성: `src/test/java/woorifisa/project/backend/domain/hospital/controller/HospitalAvailableSlotControllerTest.java`
  - 컨트롤러 RED/GREEN 검증
- 수정: `src/test/java/woorifisa/project/backend/domain/hospital/service/HospitalReservationServiceTest.java`
  - 서비스 RED/GREEN 검증 추가
- 수정: `src/test/java/woorifisa/project/backend/domain/hospital/dto/response/HospitalResponseDtoTest.java`
  - DTO 변환 테스트 추가
- 수정: `docs/rest_api.md`
  - 신규 API 계약 반영

### Task 1: 컨트롤러 조회 계약 추가

**Files:**
- Create: `src/test/java/woorifisa/project/backend/domain/hospital/controller/HospitalAvailableSlotControllerTest.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/controller/HospitalController.java`

- [ ] **Step 1: 실패하는 컨트롤러 테스트 작성**

```java
@WebMvcTest(HospitalController.class)
@Import({SecurityConfig.class, SessionAuthenticationFilter.class, SessionAuthenticationEntryPoint.class})
@ImportAutoConfiguration({
    SecurityAutoConfiguration.class,
    ServletWebSecurityAutoConfiguration.class,
    SecurityFilterAutoConfiguration.class
})
class HospitalAvailableSlotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HospitalService hospitalService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @DisplayName("인증 사용자는 특정 날짜의 병원 예약 가능 시간을 조회할 수 있다")
    void findAvailableSlots() throws Exception {
        when(hospitalService.findAvailableSlots(1L, LocalDate.of(2026, 6, 11)))
            .thenReturn(new HospitalAvailableSlotResponse(
                1L,
                LocalDate.of(2026, 6, 11),
                List.of(
                    new HospitalAvailableSlotItem(LocalDateTime.of(2026, 6, 11, 9, 0), true),
                    new HospitalAvailableSlotItem(LocalDateTime.of(2026, 6, 11, 9, 30), false)
                )
            ));

        mockMvc.perform(get("/hospital/{hospitalId}/available-slots", 1L)
                .with(authentication(authToken()))
                .queryParam("date", "2026-06-11")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.hospital_id").value(1))
            .andExpect(jsonPath("$.data.date").value("2026-06-11"))
            .andExpect(jsonPath("$.data.items", hasSize(2)))
            .andExpect(jsonPath("$.data.items[0].available_at").value("2026-06-11T09:00:00"))
            .andExpect(jsonPath("$.data.items[0].is_available").value(true))
            .andExpect(jsonPath("$.data.items[1].available_at").value("2026-06-11T09:30:00"))
            .andExpect(jsonPath("$.data.items[1].is_available").value(false));

        verify(hospitalService).findAvailableSlots(1L, LocalDate.of(2026, 6, 11));
    }

    @Test
    @DisplayName("비인증 사용자는 병원 예약 가능 시간을 조회할 수 없다")
    void findAvailableSlotsUnauthorized() throws Exception {
        mockMvc.perform(get("/hospital/{hospitalId}/available-slots", 1L)
                .queryParam("date", "2026-06-11")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.code").value(UNAUTHORIZED_SESSION.getCode()))
            .andExpect(jsonPath("$.message").value(UNAUTHORIZED_SESSION.getMessage()))
            .andExpect(jsonPath("$.data").doesNotExist());
    }
}
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.controller.HospitalAvailableSlotControllerTest"`

Expected: FAIL with missing endpoint, missing DTO, or missing `findAvailableSlots(...)`.

- [ ] **Step 3: 컨트롤러 최소 구현 추가**

```java
@GetMapping("/{hospitalId}/available-slots")
public BaseResponse<HospitalAvailableSlotResponse> findAvailableSlots(
    @AuthenticationPrincipal SessionUserPrincipal principal,
    @PathVariable Long hospitalId,
    @RequestParam LocalDate date
) {
    return BaseResponse.ok(hospitalService.findAvailableSlots(hospitalId, date));
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.controller.HospitalAvailableSlotControllerTest"`

Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/test/java/woorifisa/project/backend/domain/hospital/controller/HospitalAvailableSlotControllerTest.java src/main/java/woorifisa/project/backend/domain/hospital/controller/HospitalController.java
git commit -m "test: add hospital available slot controller coverage"
```

### Task 2: 서비스와 저장소 조회 로직 추가

**Files:**
- Modify: `src/test/java/woorifisa/project/backend/domain/hospital/service/HospitalReservationServiceTest.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/service/HospitalService.java`
- Modify: `src/main/java/woorifisa/project/backend/domain/hospital/repository/HospitalAvailableSlotRepository.java`

- [ ] **Step 1: 실패하는 서비스 테스트 작성**

```java
@Test
@DisplayName("특정 병원의 특정 날짜 슬롯을 시간순으로 조회한다")
void findAvailableSlots() {
    HospitalRepository hospitalRepository = mock(HospitalRepository.class);
    HospitalAvailableSlotRepository hospitalAvailableSlotRepository = mock(HospitalAvailableSlotRepository.class);
    ReservationRepository reservationRepository = mock(ReservationRepository.class);
    UserRepository userRepository = mock(UserRepository.class);
    HospitalService hospitalService = new HospitalService(
        hospitalRepository,
        hospitalAvailableSlotRepository,
        reservationRepository,
        userRepository
    );
    Hospital hospital = Hospital.builder()
        .hospitalId(1L)
        .build();
    HospitalAvailableSlot first = HospitalAvailableSlot.builder()
        .slotId(1L)
        .hospital(hospital)
        .availableAt(LocalDateTime.of(2026, 6, 11, 9, 0))
        .isAvailable(true)
        .build();
    HospitalAvailableSlot second = HospitalAvailableSlot.builder()
        .slotId(2L)
        .hospital(hospital)
        .availableAt(LocalDateTime.of(2026, 6, 11, 9, 30))
        .isAvailable(false)
        .build();

    when(hospitalRepository.findById(1L)).thenReturn(Optional.of(hospital));
    when(hospitalAvailableSlotRepository
        .findAllByHospitalHospitalIdAndAvailableAtBetweenOrderByAvailableAtAsc(
            1L,
            LocalDate.of(2026, 6, 11).atStartOfDay(),
            LocalDate.of(2026, 6, 12).atStartOfDay()
        ))
        .thenReturn(List.of(first, second));

    HospitalAvailableSlotResponse response = hospitalService.findAvailableSlots(1L, LocalDate.of(2026, 6, 11));

    assertThat(response.hospitalId()).isEqualTo(1L);
    assertThat(response.date()).isEqualTo(LocalDate.of(2026, 6, 11));
    assertThat(response.items()).hasSize(2);
    assertThat(response.items().get(0).availableAt()).isEqualTo(LocalDateTime.of(2026, 6, 11, 9, 0));
    assertThat(response.items().get(0).isAvailable()).isTrue();
    assertThat(response.items().get(1).availableAt()).isEqualTo(LocalDateTime.of(2026, 6, 11, 9, 30));
    assertThat(response.items().get(1).isAvailable()).isFalse();
}

@Test
@DisplayName("병원이 없으면 예약 가능 시간을 조회할 수 없다")
void findAvailableSlotsHospitalNotFound() {
    HospitalRepository hospitalRepository = mock(HospitalRepository.class);
    HospitalAvailableSlotRepository hospitalAvailableSlotRepository = mock(HospitalAvailableSlotRepository.class);
    ReservationRepository reservationRepository = mock(ReservationRepository.class);
    UserRepository userRepository = mock(UserRepository.class);
    HospitalService hospitalService = new HospitalService(
        hospitalRepository,
        hospitalAvailableSlotRepository,
        reservationRepository,
        userRepository
    );

    when(hospitalRepository.findById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> hospitalService.findAvailableSlots(1L, LocalDate.of(2026, 6, 11)))
        .isInstanceOf(CustomException.class)
        .extracting("exceptionStatus")
        .isEqualTo(HOSPITAL_NOT_FOUND);
}

@Test
@DisplayName("슬롯이 없으면 빈 목록을 반환한다")
void findAvailableSlotsEmpty() {
    HospitalRepository hospitalRepository = mock(HospitalRepository.class);
    HospitalAvailableSlotRepository hospitalAvailableSlotRepository = mock(HospitalAvailableSlotRepository.class);
    ReservationRepository reservationRepository = mock(ReservationRepository.class);
    UserRepository userRepository = mock(UserRepository.class);
    HospitalService hospitalService = new HospitalService(
        hospitalRepository,
        hospitalAvailableSlotRepository,
        reservationRepository,
        userRepository
    );
    Hospital hospital = Hospital.builder()
        .hospitalId(1L)
        .build();

    when(hospitalRepository.findById(1L)).thenReturn(Optional.of(hospital));
    when(hospitalAvailableSlotRepository
        .findAllByHospitalHospitalIdAndAvailableAtBetweenOrderByAvailableAtAsc(
            1L,
            LocalDate.of(2026, 6, 11).atStartOfDay(),
            LocalDate.of(2026, 6, 12).atStartOfDay()
        ))
        .thenReturn(List.of());

    HospitalAvailableSlotResponse response = hospitalService.findAvailableSlots(1L, LocalDate.of(2026, 6, 11));

    assertThat(response.hospitalId()).isEqualTo(1L);
    assertThat(response.date()).isEqualTo(LocalDate.of(2026, 6, 11));
    assertThat(response.items()).isEmpty();
}
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.service.HospitalReservationServiceTest"`

Expected: FAIL with missing repository method, missing DTO, or missing `findAvailableSlots(...)`.

- [ ] **Step 3: 저장소와 서비스 최소 구현 추가**

```java
List<HospitalAvailableSlot> findAllByHospitalHospitalIdAndAvailableAtBetweenOrderByAvailableAtAsc(
    Long hospitalId,
    LocalDateTime startAt,
    LocalDateTime endAt
);
```

```java
public HospitalAvailableSlotResponse findAvailableSlots(Long hospitalId, LocalDate date) {
    hospitalRepository.findById(hospitalId)
        .orElseThrow(() -> new CustomException(HOSPITAL_NOT_FOUND));

    LocalDateTime startAt = date.atStartOfDay();
    LocalDateTime endAt = date.plusDays(1).atStartOfDay();

    return HospitalAvailableSlotResponse.from(
        hospitalId,
        date,
        hospitalAvailableSlotRepository
            .findAllByHospitalHospitalIdAndAvailableAtBetweenOrderByAvailableAtAsc(
                hospitalId,
                startAt,
                endAt
            )
    );
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.service.HospitalReservationServiceTest"`

Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/test/java/woorifisa/project/backend/domain/hospital/service/HospitalReservationServiceTest.java src/main/java/woorifisa/project/backend/domain/hospital/service/HospitalService.java src/main/java/woorifisa/project/backend/domain/hospital/repository/HospitalAvailableSlotRepository.java
git commit -m "feat: add hospital available slot query service"
```

### Task 3: DTO 변환 책임 추가

**Files:**
- Create: `src/main/java/woorifisa/project/backend/domain/hospital/dto/response/HospitalAvailableSlotItem.java`
- Create: `src/main/java/woorifisa/project/backend/domain/hospital/dto/response/HospitalAvailableSlotResponse.java`
- Modify: `src/test/java/woorifisa/project/backend/domain/hospital/dto/response/HospitalResponseDtoTest.java`

- [ ] **Step 1: 실패하는 DTO 테스트 작성**

```java
@Test
@DisplayName("HospitalAvailableSlotItem이 엔티티에서 변환된다")
void hospitalAvailableSlotItemFrom() {
    Hospital hospital = Hospital.builder()
        .hospitalId(1L)
        .build();
    HospitalAvailableSlot slot = HospitalAvailableSlot.builder()
        .slotId(1L)
        .hospital(hospital)
        .availableAt(LocalDateTime.of(2026, 6, 11, 9, 0))
        .isAvailable(true)
        .build();

    HospitalAvailableSlotItem item = HospitalAvailableSlotItem.from(slot);

    assertThat(item.availableAt()).isEqualTo(LocalDateTime.of(2026, 6, 11, 9, 0));
    assertThat(item.isAvailable()).isTrue();
}

@Test
@DisplayName("HospitalAvailableSlotResponse가 엔티티 목록에서 변환된다")
void hospitalAvailableSlotResponseFrom() {
    Hospital hospital = Hospital.builder()
        .hospitalId(1L)
        .build();
    HospitalAvailableSlot slot = HospitalAvailableSlot.builder()
        .slotId(1L)
        .hospital(hospital)
        .availableAt(LocalDateTime.of(2026, 6, 11, 9, 0))
        .isAvailable(true)
        .build();

    HospitalAvailableSlotResponse response = HospitalAvailableSlotResponse.from(
        1L,
        LocalDate.of(2026, 6, 11),
        List.of(slot)
    );

    assertThat(response.hospitalId()).isEqualTo(1L);
    assertThat(response.date()).isEqualTo(LocalDate.of(2026, 6, 11));
    assertThat(response.items()).hasSize(1);
    assertThat(response.items().get(0).availableAt()).isEqualTo(LocalDateTime.of(2026, 6, 11, 9, 0));
    assertThat(response.items().get(0).isAvailable()).isTrue();
}
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.dto.response.HospitalResponseDtoTest"`

Expected: FAIL with missing DTO classes or missing `from(...)`.

- [ ] **Step 3: DTO 최소 구현 추가**

```java
public record HospitalAvailableSlotItem(
    @JsonProperty("available_at")
    LocalDateTime availableAt,
    @JsonProperty("is_available")
    boolean isAvailable
) {
    public static HospitalAvailableSlotItem from(HospitalAvailableSlot slot) {
        return new HospitalAvailableSlotItem(
            slot.getAvailableAt(),
            slot.isAvailable()
        );
    }
}
```

```java
public record HospitalAvailableSlotResponse(
    @JsonProperty("hospital_id")
    Long hospitalId,
    LocalDate date,
    List<HospitalAvailableSlotItem> items
) {
    public static HospitalAvailableSlotResponse from(
        Long hospitalId,
        LocalDate date,
        List<HospitalAvailableSlot> slots
    ) {
        return new HospitalAvailableSlotResponse(
            hospitalId,
            date,
            slots.stream()
                .map(HospitalAvailableSlotItem::from)
                .toList()
        );
    }
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.dto.response.HospitalResponseDtoTest"`

Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/main/java/woorifisa/project/backend/domain/hospital/dto/response/HospitalAvailableSlotItem.java src/main/java/woorifisa/project/backend/domain/hospital/dto/response/HospitalAvailableSlotResponse.java src/test/java/woorifisa/project/backend/domain/hospital/dto/response/HospitalResponseDtoTest.java
git commit -m "feat: add hospital available slot response dto"
```

### Task 4: 문서 동기화와 회귀 검증

**Files:**
- Modify: `docs/rest_api.md`

- [ ] **Step 1: REST API 문서 갱신**

```markdown
| `HOSPITAL-005` | 병원 예약 가능 시간 조회 | GET | `/{hospital_id}/available-slots` | O | USER | 쿼리 `date`, 응답 `hospital_id`, `date`, `items[].available_at`, `items[].is_available` |
```

- [ ] **Step 2: 타깃 테스트 재실행**

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.controller.HospitalAvailableSlotControllerTest"`

Expected: PASS

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.service.HospitalReservationServiceTest"`

Expected: PASS

Run: `cmd /c gradlew.bat test --tests "woorifisa.project.backend.domain.hospital.dto.response.HospitalResponseDtoTest"`

Expected: PASS

- [ ] **Step 3: 컴파일 검증**

Run: `cmd /c gradlew.bat compileJava`

Expected: PASS

- [ ] **Step 4: 커밋**

```bash
git add docs/rest_api.md
git commit -m "docs: add hospital available slot api contract"
```

## Self-Review

- 설계 요구사항인 `병원 + 날짜 기준 슬롯 조회`, `is_available 포함`, `병원 없음 예외`, `슬롯 없으면 빈 목록 반환`이 모두 Task 1~4에 반영되어 있다.
- placeholder 없이 테스트 코드, 구현 코드, 실행 명령, 기대 결과를 모두 구체적으로 적었다.
- 타입과 메서드 이름은 `findAvailableSlots`, `HospitalAvailableSlotResponse`, `HospitalAvailableSlotItem`으로 전 구간 일관되게 맞췄다.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-10-hospital-available-slot-query-api.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?

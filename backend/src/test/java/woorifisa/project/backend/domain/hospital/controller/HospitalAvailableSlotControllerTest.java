package woorifisa.project.backend.domain.hospital.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.UNAUTHORIZED_SESSION;

import java.time.LocalDate;
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

import woorifisa.project.backend.domain.hospital.dto.response.HospitalAvailableSlotItem;
import woorifisa.project.backend.domain.hospital.dto.response.HospitalAvailableSlotResponse;
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

    private UsernamePasswordAuthenticationToken authToken() {
        return new UsernamePasswordAuthenticationToken(
            new SessionUserPrincipal(1L),
            null,
            AuthorityUtils.NO_AUTHORITIES
        );
    }
}

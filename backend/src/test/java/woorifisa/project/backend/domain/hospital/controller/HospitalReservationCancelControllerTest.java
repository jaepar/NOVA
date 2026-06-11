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
import java.time.LocalDateTime;

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

        verify(hospitalService).updateReservation(
            eq(1L),
            eq(1L),
            eq("CANCEL"),
            eq(null)
        );
    }

    @Test
    @DisplayName("인증 사용자는 예약 시간을 변경할 수 있다")
    void changeReservation() throws Exception {
        LocalDateTime reservedAt = LocalDateTime.of(2026, 6, 11, 15, 0);

        mockMvc.perform(patch("/hospital/reservations/{reservationId}", 1L)
                .with(authentication(authToken()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "action": "CHANGE",
                      "reserved_at": "2026-06-11T15:00:00"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.code").value("20000"))
            .andExpect(jsonPath("$.data").doesNotExist());

        verify(hospitalService).updateReservation(
            eq(1L),
            eq(1L),
            eq("CHANGE"),
            eq(reservedAt)
        );
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

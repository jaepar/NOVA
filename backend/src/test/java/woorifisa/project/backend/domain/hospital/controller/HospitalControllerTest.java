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
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;

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

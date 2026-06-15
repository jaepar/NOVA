package woorifisa.project.backend.global.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import woorifisa.project.backend.global.auth.controller.AuthController;
import woorifisa.project.backend.global.auth.security.SessionAuthenticationEntryPoint;
import woorifisa.project.backend.global.auth.security.SessionAuthenticationFilter;
import woorifisa.project.backend.global.auth.service.AuthService;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, WebConfig.class, SessionAuthenticationFilter.class, SessionAuthenticationEntryPoint.class})
@ImportAutoConfiguration({
        SecurityAutoConfiguration.class,
        ServletWebSecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
})
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @DisplayName("Security filter chain allows deployed frontend CORS preflight requests")
    void securityFilterChainAllowsDeployedFrontendCorsPreflightRequests() throws Exception {
        mockMvc.perform(options("/auth/me")
                        .header(HttpHeaders.ORIGIN, "https://nova-bank.site")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "https://nova-bank.site"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"));
    }

    @Test
    @DisplayName("Security filter chain adds CORS headers to unauthorized deployed frontend requests")
    void securityFilterChainAddsCorsHeadersToUnauthorizedDeployedFrontendRequests() throws Exception {
        mockMvc.perform(get("/auth/me")
                        .header(HttpHeaders.ORIGIN, "https://nova-bank.site"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "https://nova-bank.site"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"));
    }
}

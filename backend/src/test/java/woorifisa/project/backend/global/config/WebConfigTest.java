package woorifisa.project.backend.global.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Method;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

class WebConfigTest {

    @Test
    @DisplayName("배포 프론트 도메인과 로컬 개발 도메인을 CORS origin으로 허용한다")
    void addCorsMappingsAllowsFrontendOrigins() throws Exception {
        CorsRegistry registry = new CorsRegistry();

        new WebConfig().addCorsMappings(registry);

        CorsConfiguration corsConfiguration = getCorsConfigurations(registry).get("/**");
        assertThat(corsConfiguration).isNotNull();
        assertThat(corsConfiguration.getAllowedOrigins()).containsExactlyInAnyOrder(
                "https://nova-bank.site",
                "https://www.nova-bank.site",
                "http://localhost:5173"
        );
        assertThat(corsConfiguration.getAllowCredentials()).isTrue();
        assertThat(corsConfiguration.getAllowedMethods()).containsExactly(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        );
        assertThat(corsConfiguration.getAllowedHeaders()).containsExactly("*");
    }

    @SuppressWarnings("unchecked")
    private Map<String, CorsConfiguration> getCorsConfigurations(CorsRegistry registry) throws Exception {
        Method method = CorsRegistry.class.getDeclaredMethod("getCorsConfigurations");
        method.setAccessible(true);
        return (Map<String, CorsConfiguration>) method.invoke(registry);
    }
}

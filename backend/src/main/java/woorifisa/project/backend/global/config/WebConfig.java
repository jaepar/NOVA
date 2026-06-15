package woorifisa.project.backend.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final String DEPLOYED_FRONTEND_ORIGIN = "https://nova-bank.site";
    private static final String DEPLOYED_WWW_FRONTEND_ORIGIN = "https://www.nova-bank.site";
    private static final String HTTP_PREFIX = "http://";
    private static final String LOCAL_ADDRESS = "localhost";
    private static final String FRONTEND_PORT = "5173";

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        DEPLOYED_FRONTEND_ORIGIN,
                        DEPLOYED_WWW_FRONTEND_ORIGIN,
                        HTTP_PREFIX + LOCAL_ADDRESS + ":" + FRONTEND_PORT
                )
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}

package woorifisa.project.backend.global.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(KycPassportOcrProperties.class)
public class KycPassportOcrConfig {
}

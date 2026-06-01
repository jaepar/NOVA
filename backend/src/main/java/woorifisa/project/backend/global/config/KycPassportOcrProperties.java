package woorifisa.project.backend.global.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "kyc.verification.passport-ocr")
public record KycPassportOcrProperties(
	String url,
	String secret
) {
}
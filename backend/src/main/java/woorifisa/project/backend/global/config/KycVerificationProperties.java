package woorifisa.project.backend.global.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "kyc.verification")
public record KycVerificationProperties(
        Rekognition rekognition
) {
    public record Rekognition(
            String region,
            String outputBucket,
            String outputPrefix,
            Float livenessThreshold,
            Float similarityThreshold,
            Integer auditImagesLimit
    ) {
    }
}


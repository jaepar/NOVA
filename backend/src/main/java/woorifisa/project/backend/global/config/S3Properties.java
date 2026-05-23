package woorifisa.project.backend.global.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cloud.aws")
public record S3Properties(
        Credentials credentials,
        S3 s3
) {
    public record Credentials(
            String accessKey,
            String secretKey
    ) {
    }

    public record S3(
            String region,
            String bucket,
            String baseUrl
    ) {
    }
}

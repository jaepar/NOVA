package woorifisa.project.backend.global.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.RekognitionClientBuilder;

@Configuration
@EnableConfigurationProperties({S3Properties.class, KycVerificationProperties.class})
public class RekognitionConfig {

    @Bean
    public RekognitionClient rekognitionClient(
            S3Properties s3Properties,
            KycVerificationProperties kycVerificationProperties
    ) {
        KycVerificationProperties.Rekognition rekognition = kycVerificationProperties.rekognition();
        String region = hasText(rekognition.region()) ? rekognition.region() : s3Properties.s3().region();

        RekognitionClientBuilder builder = RekognitionClient.builder()
                .region(Region.of(region));

        S3Properties.Credentials credentials = s3Properties.credentials();
        if (credentials != null
                && hasText(credentials.accessKey())
                && hasText(credentials.secretKey())) {
            builder.credentialsProvider(
                    StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(credentials.accessKey(), credentials.secretKey())
                    )
            );
        }

        return builder.build();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}


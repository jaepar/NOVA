package woorifisa.project.backend.domain.user.service;

import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import woorifisa.project.backend.domain.user.dto.request.FaceMatchRequest;
import woorifisa.project.backend.domain.user.dto.response.LivenessFinalizeResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessSessionResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessVerificationResponse;
import woorifisa.project.backend.global.config.KycVerificationProperties;
import woorifisa.project.backend.global.exception.CustomException;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.CompareFacesRequest;
import software.amazon.awssdk.services.rekognition.model.CompareFacesResponse;
import software.amazon.awssdk.services.rekognition.model.CreateFaceLivenessSessionRequest;
import software.amazon.awssdk.services.rekognition.model.CreateFaceLivenessSessionRequestSettings;
import software.amazon.awssdk.services.rekognition.model.CreateFaceLivenessSessionResponse;
import software.amazon.awssdk.services.rekognition.model.GetFaceLivenessSessionResultsRequest;
import software.amazon.awssdk.services.rekognition.model.GetFaceLivenessSessionResultsResponse;
import software.amazon.awssdk.services.rekognition.model.Image;
import software.amazon.awssdk.services.rekognition.model.LivenessOutputConfig;
import software.amazon.awssdk.services.rekognition.model.S3Object;

import java.time.Instant;
import java.util.Comparator;
import java.util.UUID;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.KYC_OUTPUT_BUCKET_NOT_CONFIGURED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.LIVENESS_REFERENCE_IMAGE_NOT_FOUND;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private static final String PASS = "PASS";
    private static final String FAIL = "FAIL";

    private final RekognitionClient rekognitionClient;
    private final KycVerificationProperties kycVerificationProperties;

    public LivenessSessionResponse createLivenessSession(
            Long userId
    ) {
        KycVerificationProperties.Rekognition rekognition = kycVerificationProperties.rekognition();
        if (rekognition == null || rekognition.outputBucket() == null || rekognition.outputBucket().isBlank()) {
            throw new CustomException(KYC_OUTPUT_BUCKET_NOT_CONFIGURED);
        }
        String clientRequestToken = UUID.randomUUID().toString();

        CreateFaceLivenessSessionRequestSettings settings = CreateFaceLivenessSessionRequestSettings.builder()
                .outputConfig(
                        LivenessOutputConfig.builder()
                                .s3Bucket(rekognition.outputBucket())
                                .s3KeyPrefix(rekognition.outputPrefix())
                                .build()
                )
                .auditImagesLimit(rekognition.auditImagesLimit())
                .build();

        CreateFaceLivenessSessionRequest sessionRequest = CreateFaceLivenessSessionRequest.builder()
                .clientRequestToken(clientRequestToken)
                .settings(settings)
                .build();

        CreateFaceLivenessSessionResponse response = rekognitionClient.createFaceLivenessSession(sessionRequest);
        log.info("liveness session created. userId={}, sessionId={}", userId, response.sessionId());

        return new LivenessSessionResponse(
                response.sessionId(),
                Instant.now().plusSeconds(180)
        );
    }

    public LivenessVerificationResponse getLivenessResult(Long userId, String sessionId) {
        GetFaceLivenessSessionResultsResponse response = getLivenessSessionResults(sessionId);

        float confidence = response.confidence() == null ? 0f : response.confidence();
        float threshold = livenessThreshold();
        String decision = confidence >= threshold && response.statusAsString().equalsIgnoreCase("SUCCEEDED") ? PASS : FAIL;
        String reasonCode = decision.equals(PASS) ? "LIVENESS_PASSED" : "LOW_LIVENESS_SCORE";

        log.info("liveness evaluated. userId={}, sessionId={}, status={}, confidence={}, threshold={}, decision={}",
                userId, sessionId, response.statusAsString(), confidence, threshold, decision);

        return new LivenessVerificationResponse(
                sessionId,
                response.statusAsString(),
                confidence,
                decision,
                reasonCode
        );
    }

    public LivenessVerificationResponse compareFaceWithRegisteredImage(
            Long userId,
            String sessionId,
            FaceMatchRequest request
    ) {
        GetFaceLivenessSessionResultsResponse livenessResult = getLivenessSessionResults(sessionId);

        if (livenessResult.referenceImage() == null || livenessResult.referenceImage().s3Object() == null) {
            throw new CustomException(LIVENESS_REFERENCE_IMAGE_NOT_FOUND);
        }

        S3Object sourceS3 = livenessResult.referenceImage().s3Object();

        CompareFacesResponse compareFacesResponse = rekognitionClient.compareFaces(
                CompareFacesRequest.builder()
                        .sourceImage(
                                Image.builder()
                                        .s3Object(
                                                S3Object.builder()
                                                        .bucket(sourceS3.bucket())
                                                        .name(sourceS3.name())
                                                        .build()
                                        )
                                        .build()
                        )
                        .targetImage(
                                Image.builder()
                                        .s3Object(
                                                S3Object.builder()
                                                        .bucket(request.registeredImageBucket())
                                                        .name(request.registeredImageKey())
                                                        .build()
                                        )
                                        .build()
                        )
                        .build()
        );

        float similarity = compareFacesResponse.faceMatches().stream()
                .map(match -> match.similarity() == null ? 0f : match.similarity())
                .max(Comparator.naturalOrder())
                .orElse(0f);

        float threshold = similarityThreshold();
        String decision = similarity >= threshold ? PASS : FAIL;
        String reasonCode = decision.equals(PASS) ? "FACE_MATCH_PASSED" : "LOW_FACE_SIMILARITY";

        log.info("face match evaluated. userId={}, sessionId={}, similarity={}, threshold={}, decision={}",
                userId, sessionId, similarity, threshold, decision);

        return new LivenessVerificationResponse(sessionId, "FACE_MATCH", similarity, decision, reasonCode);
    }

    public LivenessFinalizeResponse finalizeVerification(
            Long userId,
            String sessionId,
            FaceMatchRequest request
    ) {
        LivenessVerificationResponse livenessResult = getLivenessResult(userId, sessionId);
        LivenessVerificationResponse faceMatchResult = compareFaceWithRegisteredImage(userId, sessionId, request);

        boolean passed = PASS.equals(livenessResult.decision()) && PASS.equals(faceMatchResult.decision());
        String decision = passed ? PASS : FAIL;
        String reasonCode = passed ? "VERIFICATION_PASSED" : "VERIFICATION_FAILED";

        return new LivenessFinalizeResponse(
                sessionId,
                livenessResult.score(),
                faceMatchResult.score(),
                decision,
                reasonCode
        );
    }

    private GetFaceLivenessSessionResultsResponse getLivenessSessionResults(String sessionId) {
        return rekognitionClient.getFaceLivenessSessionResults(
                GetFaceLivenessSessionResultsRequest.builder()
                        .sessionId(sessionId)
                        .build()
        );
    }

    private float livenessThreshold() {
        KycVerificationProperties.Rekognition rekognition = kycVerificationProperties.rekognition();
        return rekognition.livenessThreshold() == null ? 90f : rekognition.livenessThreshold();
    }

    private float similarityThreshold() {
        KycVerificationProperties.Rekognition rekognition = kycVerificationProperties.rekognition();
        return rekognition.similarityThreshold() == null ? 85f : rekognition.similarityThreshold();
    }
}

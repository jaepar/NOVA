package woorifisa.project.backend.domain.user.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import woorifisa.project.backend.domain.user.dto.request.FaceMatchRequest;
import woorifisa.project.backend.domain.user.dto.response.LivenessFinalizeResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessSessionResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessVerificationResponse;
import woorifisa.project.backend.global.config.KycVerificationProperties;
import woorifisa.project.backend.global.exception.CustomException;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.CompareFacesMatch;
import software.amazon.awssdk.services.rekognition.model.CompareFacesRequest;
import software.amazon.awssdk.services.rekognition.model.CompareFacesResponse;
import software.amazon.awssdk.services.rekognition.model.AuditImage;
import software.amazon.awssdk.services.rekognition.model.CreateFaceLivenessSessionRequest;
import software.amazon.awssdk.services.rekognition.model.CreateFaceLivenessSessionResponse;
import software.amazon.awssdk.services.rekognition.model.GetFaceLivenessSessionResultsRequest;
import software.amazon.awssdk.services.rekognition.model.GetFaceLivenessSessionResultsResponse;
import software.amazon.awssdk.services.rekognition.model.LivenessSessionStatus;
import software.amazon.awssdk.services.rekognition.model.S3Object;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.KYC_OUTPUT_BUCKET_NOT_CONFIGURED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.LIVENESS_REFERENCE_IMAGE_NOT_FOUND;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private RekognitionClient rekognitionClient;

    private UserService userService;

    @BeforeEach
    void setUp() {
        KycVerificationProperties.Rekognition rekognition = new KycVerificationProperties.Rekognition(
                "ap-northeast-1",
                "nova-kyc-output",
                "liveness",
                90f,
                85f,
                2
        );
        KycVerificationProperties properties = new KycVerificationProperties(rekognition);
        userService = new UserService(rekognitionClient, properties);
    }

    @Test
    @DisplayName("Liveness 세션 생성 시 sessionId를 반환한다")
    void createLivenessSessionSuccess() {
        when(rekognitionClient.createFaceLivenessSession(any(CreateFaceLivenessSessionRequest.class)))
                .thenReturn(CreateFaceLivenessSessionResponse.builder().sessionId("session-123").build());

        LivenessSessionResponse response = userService.createLivenessSession(1L);

        assertThat(response.sessionId()).isEqualTo("session-123");
        assertThat(response.expiresAt()).isNotNull();
    }

    @Test
    @DisplayName("Liveness 점수가 임계치 이상이면 PASS를 반환한다")
    void getLivenessResultPass() {
        when(rekognitionClient.getFaceLivenessSessionResults(any(GetFaceLivenessSessionResultsRequest.class)))
                .thenReturn(GetFaceLivenessSessionResultsResponse.builder()
                        .status(LivenessSessionStatus.SUCCEEDED)
                        .confidence(95f)
                        .build());

        LivenessVerificationResponse response = userService.getLivenessResult(1L, "session-123");

        assertThat(response.decision()).isEqualTo("PASS");
        assertThat(response.reasonCode()).isEqualTo("LIVENESS_PASSED");
        assertThat(response.score()).isEqualTo(95f);
    }

    @Test
    @DisplayName("Liveness 참조 이미지가 없으면 동일인 비교는 예외를 던진다")
    void compareFaceThrowsWhenReferenceImageMissing() {
        when(rekognitionClient.getFaceLivenessSessionResults(any(GetFaceLivenessSessionResultsRequest.class)))
                .thenReturn(GetFaceLivenessSessionResultsResponse.builder()
                        .status(LivenessSessionStatus.SUCCEEDED)
                        .confidence(95f)
                        .build());

        assertThatThrownBy(() -> userService.compareFaceWithRegisteredImage(
                1L,
                "session-123",
                new FaceMatchRequest("bucket", "key.jpg")
        ))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(LIVENESS_REFERENCE_IMAGE_NOT_FOUND);
    }

    @Test
    @DisplayName("Liveness와 FaceMatch가 모두 통과하면 finalize는 PASS를 반환한다")
    void finalizePassWhenBothPass() {
        when(rekognitionClient.getFaceLivenessSessionResults(any(GetFaceLivenessSessionResultsRequest.class)))
                .thenReturn(GetFaceLivenessSessionResultsResponse.builder()
                        .status(LivenessSessionStatus.SUCCEEDED)
                        .confidence(96f)
                        .referenceImage(
                                AuditImage.builder()
                                        .s3Object(S3Object.builder().bucket("nova-kyc-output").name("liveness/ref.jpg").build())
                                        .build()
                        )
                        .build());
        when(rekognitionClient.compareFaces(any(CompareFacesRequest.class)))
                .thenReturn(CompareFacesResponse.builder()
                        .faceMatches(List.of(
                                CompareFacesMatch.builder().similarity(90f).build()
                        ))
                        .build());

        LivenessFinalizeResponse response = userService.finalizeVerification(
                1L,
                "session-123",
                new FaceMatchRequest("bucket", "registered.jpg")
        );

        assertThat(response.decision()).isEqualTo("PASS");
        assertThat(response.reasonCode()).isEqualTo("VERIFICATION_PASSED");
        assertThat(response.livenessScore()).isEqualTo(96f);
        assertThat(response.similarityScore()).isEqualTo(90f);
    }

    @Test
    @DisplayName("KYC 버킷 설정이 비어 있으면 세션 생성 시 예외를 던진다")
    void createLivenessSessionThrowsWhenOutputBucketEmpty() {
        KycVerificationProperties.Rekognition rekognition = new KycVerificationProperties.Rekognition(
                "ap-northeast-1",
                "",
                "liveness",
                90f,
                85f,
                2
        );
        UserService service = new UserService(rekognitionClient, new KycVerificationProperties(rekognition));

        assertThatThrownBy(() -> service.createLivenessSession(1L))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(KYC_OUTPUT_BUCKET_NOT_CONFIGURED);
    }
}

package woorifisa.project.backend.domain.user.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import woorifisa.project.backend.domain.user.dto.request.FaceMatchRequest;
import woorifisa.project.backend.domain.user.dto.response.LivenessFinalizeResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessSessionResponse;
import woorifisa.project.backend.domain.user.dto.response.LivenessVerificationResponse;
import woorifisa.project.backend.domain.user.service.UserService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserControllerTest {

    private final UserService userService = mock(UserService.class);
    private final UserController userController = new UserController(userService);

    @Test
    @DisplayName("Liveness 세션 생성 API는 성공 응답을 반환한다")
    void createLivenessSessionReturnsSuccess() {
        SessionUserPrincipal principal = new SessionUserPrincipal(1L);
        LivenessSessionResponse payload = new LivenessSessionResponse("session-123", Instant.now());
        when(userService.createLivenessSession(1L)).thenReturn(payload);

        BaseResponse<LivenessSessionResponse> response = userController.createLivenessSession(principal);

        verify(userService).createLivenessSession(1L);
        assertThat(response.getSuccess()).isTrue();
        assertThat(response.getCode()).isEqualTo("20000");
        assertThat(response.getData()).isEqualTo(payload);
    }

    @Test
    @DisplayName("Liveness 결과 조회 API는 성공 응답을 반환한다")
    void getLivenessResultReturnsSuccess() {
        SessionUserPrincipal principal = new SessionUserPrincipal(1L);
        LivenessVerificationResponse payload = new LivenessVerificationResponse(
                "session-123", "SUCCEEDED", 95f, "PASS", "LIVENESS_PASSED"
        );
        when(userService.getLivenessResult(1L, "session-123")).thenReturn(payload);

        BaseResponse<LivenessVerificationResponse> response = userController.getLivenessResult(principal, "session-123");

        verify(userService).getLivenessResult(1L, "session-123");
        assertThat(response.getSuccess()).isTrue();
        assertThat(response.getCode()).isEqualTo("20000");
        assertThat(response.getData()).isEqualTo(payload);
    }

    @Test
    @DisplayName("Liveness 동일인 비교 API는 성공 응답을 반환한다")
    void compareFaceReturnsSuccess() {
        SessionUserPrincipal principal = new SessionUserPrincipal(1L);
        FaceMatchRequest request = new FaceMatchRequest("bucket", "registered.jpg");
        LivenessVerificationResponse payload = new LivenessVerificationResponse(
                "session-123", "FACE_MATCH", 89f, "PASS", "FACE_MATCH_PASSED"
        );
        when(userService.compareFaceWithRegisteredImage(1L, "session-123", request)).thenReturn(payload);

        BaseResponse<LivenessVerificationResponse> response = userController.compareFaceWithRegisteredImage(
                principal, "session-123", request
        );

        verify(userService).compareFaceWithRegisteredImage(1L, "session-123", request);
        assertThat(response.getSuccess()).isTrue();
        assertThat(response.getCode()).isEqualTo("20000");
        assertThat(response.getData()).isEqualTo(payload);
    }

    @Test
    @DisplayName("Liveness 최종 확정 API는 성공 응답을 반환한다")
    void finalizeReturnsSuccess() {
        SessionUserPrincipal principal = new SessionUserPrincipal(1L);
        FaceMatchRequest request = new FaceMatchRequest("bucket", "registered.jpg");
        LivenessFinalizeResponse payload = new LivenessFinalizeResponse(
                "session-123", 95f, 89f, "PASS", "VERIFICATION_PASSED"
        );
        when(userService.finalizeVerification(1L, "session-123", request)).thenReturn(payload);

        BaseResponse<LivenessFinalizeResponse> response = userController.finalizeLivenessVerification(
                principal, "session-123", request
        );

        verify(userService).finalizeVerification(1L, "session-123", request);
        assertThat(response.getSuccess()).isTrue();
        assertThat(response.getCode()).isEqualTo("20000");
        assertThat(response.getData()).isEqualTo(payload);
    }
}


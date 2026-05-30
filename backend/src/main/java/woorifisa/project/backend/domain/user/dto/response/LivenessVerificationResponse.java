package woorifisa.project.backend.domain.user.dto.response;

public record LivenessVerificationResponse(
        String sessionId,
        String status,
        Float score,
        String decision,
        String reasonCode
) {
}


package woorifisa.project.backend.domain.user.dto.response;

public record LivenessFinalizeResponse(
        String sessionId,
        Float livenessScore,
        Float similarityScore,
        String decision,
        String reasonCode
) {
}


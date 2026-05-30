package woorifisa.project.backend.domain.user.dto.response;

import java.time.Instant;

public record LivenessSessionResponse(
        String sessionId,
        Instant expiresAt
) {
}


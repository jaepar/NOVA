package woorifisa.project.backend.domain.user.dto.request;

import jakarta.validation.constraints.NotBlank;

public record FaceMatchRequest(
        @NotBlank
        String registeredImageBucket,
        @NotBlank
        String registeredImageKey
) {
}


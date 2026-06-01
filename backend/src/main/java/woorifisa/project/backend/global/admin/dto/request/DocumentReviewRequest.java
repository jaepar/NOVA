package woorifisa.project.backend.global.admin.dto.request;

import jakarta.validation.constraints.NotBlank;

public record DocumentReviewRequest(
	@NotBlank(message = "targetStatus는 필수입니다.")
	String targetStatus,
	String missing
) {
}

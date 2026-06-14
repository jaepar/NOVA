package woorifisa.project.backend.global.admin.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import woorifisa.project.backend.domain.user.entity.enums.DocumentRejectionReasonCode;

public record DocumentReviewRequest(
	@NotBlank(message = "targetStatus는 필수입니다.")
	String targetStatus,
	List<DocumentRejectionReasonCode> rejectionReasonCodes
) {
}

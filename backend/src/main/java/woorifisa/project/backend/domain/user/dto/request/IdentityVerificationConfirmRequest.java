package woorifisa.project.backend.domain.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record IdentityVerificationConfirmRequest(
	@NotNull
	OcrDocumentType ocrDocumentType,

	@NotBlank
	String name,

	@NotBlank
	String residentRegistrationNumber,

	@NotBlank
	String issueDate
) {
}

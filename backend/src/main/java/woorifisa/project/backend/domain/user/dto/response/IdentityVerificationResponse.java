package woorifisa.project.backend.domain.user.dto.response;

import lombok.Builder;
import woorifisa.project.backend.domain.user.dto.request.OcrDocumentType;

@Builder
public record IdentityVerificationResponse(
	OcrDocumentType ocrDocumentType,
	Object result,
	Boolean nameMatchWithUser,
	Boolean identityMatchWithGovDb,
	String verificationStatus,
	String failureReasonCode
) {
}

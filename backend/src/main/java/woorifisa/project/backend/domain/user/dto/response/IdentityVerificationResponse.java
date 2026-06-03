package woorifisa.project.backend.domain.user.dto.response;

import lombok.Builder;
import woorifisa.project.backend.domain.user.dto.request.OcrDocumentType;
import woorifisa.project.backend.domain.user.dto.response.ocr.IdCardOcrResponse;
import woorifisa.project.backend.domain.user.dto.response.ocr.PassportResponse;

@Builder
public record IdentityVerificationResponse(
	OcrDocumentType ocrDocumentType,
	PassportResponse passport,
	IdCardOcrResponse idCard,
	Boolean nameMatchWithUser,
	Boolean identityMatchWithGovDb,
	String verificationStatus,
	String failureReasonCode
) {
}

package woorifisa.project.backend.domain.user.dto.response;

import lombok.Builder;
import woorifisa.project.backend.domain.user.dto.request.OcrDocumentType;

@Builder
public record IdentityOcrResponse(
	OcrDocumentType ocrDocumentType,
	Object result,
	Boolean nameMatchWithUser
) {
}

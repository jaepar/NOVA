package woorifisa.project.backend.domain.user.dto.response;

import java.util.List;

public record CorrectionDocumentResponse(
	String documentType,
	String status,
	List<String> rejectionReasonCodes
) {
}

package woorifisa.project.backend.domain.user.dto.response.ocr;

public record IdCardOcrResponse(
	String name,
	String residentRegistrationNumber,
	String issueDate
) {
}

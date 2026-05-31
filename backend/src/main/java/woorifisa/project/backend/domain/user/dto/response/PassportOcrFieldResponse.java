package woorifisa.project.backend.domain.user.dto.response;

// OCR 결과의 단일 필드(이름/추출 텍스트/신뢰도) DTO
public record PassportOcrFieldResponse(
	String name,
	String text,
	Float confidence
) {
}
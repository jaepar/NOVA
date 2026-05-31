package woorifisa.project.backend.domain.user.dto.response;

import java.util.List;
import java.util.Map;

// 네이버 OCR 원본 응답 구조 매핑을 위한 DTO
public record PassportOcrRawResponse(
	String version,
	String requestId,
	Long timestamp,
	List<Image> images
) {
	// OCR 이미지 단위 응답
	public record Image(
		String uid,
		String name,
		String inferResult,
		String message,
		ValidationResult validationResult,
		List<Field> fields,
		Map<String, Object> idCard,
		Map<String, Object> passport
	) {
	}

	// 검증 결과
	public record ValidationResult(
		String result
	) {
	}

	// 일반 OCR 필드
	public record Field(
		String name,
		String valueType,
		String inferText,
		Float inferConfidence
	) {
	}
}
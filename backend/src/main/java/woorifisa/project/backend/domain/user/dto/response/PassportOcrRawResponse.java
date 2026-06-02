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
		IdCard idCard
	) {
	}

	public record IdCard(
		Meta meta,
		Result result
	) {
	}

	public record Meta(
		String estimatedLanguage
	) {
	}

	public record Result(
		Boolean isConfident,
		Map<String, Object> pp,
		String idtype
	) {
	}
}
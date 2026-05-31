package woorifisa.project.backend.domain.user.dto.response;

import java.util.List;

// 프론트 응답용 여권 OCR DTO
public record PassportOcrResponse(
	boolean success,
	List<PassportOcrFieldResponse> fields,
	PassportOcrRawResponse raw
) {
}
package woorifisa.project.backend.domain.user.dto.response;

import lombok.Builder;

@Builder
// 프론트 응답용 여권 OCR DTO
public record PassportResponse(
	String type,
	String issueCountry,
	String num,
	String surName,
	String givenName,
	String nationality,
	String birthDate,
	String sex,
	String issueDate,
	String expireDate,
	String authority
) {
}
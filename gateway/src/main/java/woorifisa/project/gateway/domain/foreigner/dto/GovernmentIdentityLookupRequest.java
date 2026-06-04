package woorifisa.project.gateway.domain.foreigner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record GovernmentIdentityLookupRequest(
	@NotBlank
	@Pattern(regexp = "^[0-9a-fA-F]{64}$", message = "식별번호 해시는 64자리 hex 형식이어야 합니다.")
	String registrationNumberHash
) {
}

package woorifisa.project.coreBanking.domain.customer.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateCustomerRequest(
	@NotNull
	@Positive
	Long userId,

	@NotBlank
	String name,

	@NotBlank
	@Email
	String email
) {
}

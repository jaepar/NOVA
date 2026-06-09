package woorifisa.project.coreBanking.domain.account.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateAccountRequest(
	@NotBlank String accountType,
	@NotBlank String accountName,
	@NotNull @Valid CustomerInfo customerInfo,
	@NotBlank String job,
	@NotNull @Valid TransactionInfo transactionInfo,
	@NotNull Boolean hasForeignTax,
	@NotBlank String accountPassword
) {
	public record CustomerInfo(
		@NotBlank String name,
		@NotBlank String email,
		@NotBlank String address,
		@NotBlank String addressDetail
	) {}

	public record TransactionInfo(
		@NotBlank String purpose,
		@NotBlank String source
	) {}
}

package woorifisa.project.coreBanking.domain.account.dto.response;

public record CreateAccountResponse(
	Long accountId,
	Long customerId,
	String accountName,
	String accountNumber
) {
	public static CreateAccountResponse of(
		Long accountId,
		Long customerId,
		String accountName,
		String accountNumber
	) {
		return new CreateAccountResponse(accountId, customerId, accountName, accountNumber);
	}
}

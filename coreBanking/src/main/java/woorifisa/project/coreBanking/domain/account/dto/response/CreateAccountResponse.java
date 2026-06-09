package woorifisa.project.coreBanking.domain.account.dto.response;

public record CreateAccountResponse(
	Long accountId,
	Long customerId,
	String accountName,
	String accountNumber,
	Integer transferLimit
) {
	public static CreateAccountResponse of(
		Long accountId,
		Long customerId,
		String accountName,
		String accountNumber,
		Integer transferLimit
	) {
		return new CreateAccountResponse(accountId, customerId, accountName, accountNumber, transferLimit);
	}
}

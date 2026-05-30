package woorifisa.project.coreBanking.domain.account.dto.response;

public record CreateAccountResponse(Long accountId) {
	public static CreateAccountResponse of(Long accountId) {
		return new CreateAccountResponse(accountId);
	}
}

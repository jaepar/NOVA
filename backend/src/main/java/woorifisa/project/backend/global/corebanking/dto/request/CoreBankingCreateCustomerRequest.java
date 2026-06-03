package woorifisa.project.backend.global.corebanking.dto.request;

import woorifisa.project.backend.domain.user.entity.User;

public record CoreBankingCreateCustomerRequest(
	Long userId,
	String name,
	String email
) {
	public static CoreBankingCreateCustomerRequest from(User user) {
		return new CoreBankingCreateCustomerRequest(
			user.getUserId(),
			user.getName(),
			user.getEmail()
		);
	}
}

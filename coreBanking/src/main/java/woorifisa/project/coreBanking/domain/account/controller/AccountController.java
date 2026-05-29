package woorifisa.project.coreBanking.domain.account.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import woorifisa.project.coreBanking.domain.account.dto.request.AccountPasswordVerifyRequest;
import woorifisa.project.coreBanking.domain.account.dto.request.CreateAccountRequest;
import woorifisa.project.coreBanking.domain.account.dto.request.RecipientLookupRequest;
import woorifisa.project.coreBanking.domain.account.dto.response.CreateAccountResponse;
import woorifisa.project.coreBanking.domain.account.dto.response.RecipientLookupResponse;
import woorifisa.project.coreBanking.domain.account.service.AccountService;
import woorifisa.project.coreBanking.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/accounts")
public class AccountController {

	private final AccountService accountService;

	// 수취인 조회
	@PostMapping("/recipients/lookup")
	public BaseResponse<RecipientLookupResponse> lookupRecipient(
		@Valid @RequestBody RecipientLookupRequest request
	) {
		return BaseResponse.ok(accountService.lookupRecipient(request));
	}

	// 계좌 비밀번호 검증
	@PostMapping("/password/verify")
	public BaseResponse<Void> verifyAccountPassword(
		@Valid @RequestBody AccountPasswordVerifyRequest request
	) {
		accountService.verifyAccountPassword(request);
		return BaseResponse.ok(null);
	}

	// 계좌 생성
	@PostMapping("/")
	public BaseResponse<CreateAccountResponse> createAccount(
		@Valid @RequestBody CreateAccountRequest request
	) {
		return BaseResponse.ok(accountService.createAccount(request));
	}
}

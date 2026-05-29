package woorifisa.project.coreBanking.domain.account.service;

import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.*;

import java.util.concurrent.ThreadLocalRandom;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import woorifisa.project.coreBanking.domain.account.dto.request.AccountPasswordVerifyRequest;
import woorifisa.project.coreBanking.domain.account.dto.request.CreateAccountRequest;
import woorifisa.project.coreBanking.domain.account.dto.request.RecipientLookupRequest;
import woorifisa.project.coreBanking.domain.account.dto.response.CreateAccountResponse;
import woorifisa.project.coreBanking.domain.account.dto.response.RecipientLookupResponse;
import woorifisa.project.coreBanking.domain.account.entity.Account;
import woorifisa.project.coreBanking.domain.account.entity.enums.AccountType;
import woorifisa.project.coreBanking.domain.account.entity.enums.BankCode;
import woorifisa.project.coreBanking.domain.account.repository.AccountRepository;
import woorifisa.project.coreBanking.domain.customer.entity.Customer;
import woorifisa.project.coreBanking.domain.customer.entity.enums.CustomerPurpose;
import woorifisa.project.coreBanking.domain.customer.entity.enums.FundSource;
import woorifisa.project.coreBanking.domain.customer.repository.CustomerRepository;
import woorifisa.project.coreBanking.global.exception.CustomException;

@Service
@Slf4j
@RequiredArgsConstructor
public class AccountService {

	private final AccountRepository accountRepository;
	private final CustomerRepository customerRepository;
	private final PasswordEncoder passwordEncoder;

	@Transactional(readOnly = true)
	public RecipientLookupResponse lookupRecipient(RecipientLookupRequest request) {
		// 해당 은행 코드에 대한
		BankCode bankCode = resolveBankCode(request.bankCode());

		// 은행 코드와 계좌 번호로 해당 계좌 찾는 메서드
		Account account = accountRepository.findByBankCodeAndAccountNumber(bankCode, request.accountNumber())
			.orElseThrow(() -> new CustomException(ACCOUNT_RECIPIENT_LOOKUP_ACCOUNT_NOT_FOUND));

		return RecipientLookupResponse.of(account.getCustomer().getName());
	}

	@Transactional(readOnly = true)
	public void verifyAccountPassword(AccountPasswordVerifyRequest request) {
		Account account = accountRepository.findById(request.accountId())
			.orElseThrow(() -> new CustomException(ACCOUNT_PASSWORD_VERIFY_ACCOUNT_NOT_FOUND));

		if (!passwordEncoder.matches(request.accountPassword(), account.getPassword())) {
			throw new CustomException(ACCOUNT_PASSWORD_VERIFY_NOT_MATCHED);
		}
	}

	private BankCode resolveBankCode(String bankCode) {
		try {
			return BankCode.valueOf(bankCode.trim().toUpperCase());
		} catch (RuntimeException exception) {
			throw new CustomException(ACCOUNT_RECIPIENT_LOOKUP_INVALID_REQUEST);
		}
	}

	private AccountType resolveAccountType(String accountType) {
		try {
			return AccountType.valueOf(accountType.trim().toUpperCase());
		} catch (RuntimeException exception) {
			throw new CustomException(ACCOUNT_CREATE_TYPE_INVALID);
		}
	}

	private CustomerPurpose resolvePurpose(String purpose) {
		try {
			return CustomerPurpose.valueOf(purpose.trim().toUpperCase());
		} catch (RuntimeException e) {
			throw new CustomException(ACCOUNT_CREATE_PURPOSE_INVALID);
		}
	}

	private FundSource resolveSource(String source) {
		try {
			return FundSource.valueOf(source.trim().toUpperCase());
		} catch (RuntimeException e) {
			throw new CustomException(ACCOUNT_CREATE_SOURCE_INVALID);
		}
	}

	private String generateUniqueAccountNumber() {  // 계좌 번호 생성 메서드
		for (int retry = 0; retry < 10; retry++) {  // 충돌시 재시도 횟수
			String serial8 = String.format("%08d", ThreadLocalRandom.current().nextInt(0, 100_000_000));
			String raw13 = AccountNumberGenerator.raw13(serial8);

			if (!accountRepository.existsByAccountNumber(raw13)) {  // 고유 번호라면
				log.info("[account_create:number_generated] retry={}, maskedAccountNumber={}", retry,
					maskAccountNumber(raw13));
				return raw13;
			}
			log.warn("[account_create:number_conflict] retry={}", retry);
		}
		log.error("[account_create:number_generation_failed]");
		throw new CustomException(ACCOUNT_NUMBER_GENERATION_FAILED);
	}

	@Transactional
	public CreateAccountResponse createAccount(CreateAccountRequest request) {
		log.info(
			"[account_create:requested] customerId={}, accountType={}, hasForeignTax={}",
			request.customerId(),
			request.accountType(),
			request.taxInfo().hasForeignTax()
		);

		boolean accountExists = accountRepository.existsByAccountNameAndCustomer_CustomerId(request.accountName(),
			request.customerId());
		if (accountExists) {  // 이미 동일한 상품을 가입했다면 계좌 생성 불가
			log.warn(
				"[account_create:rejected_duplicate_product] customerId={}, accountName={}",
				request.customerId(),
				request.accountName()
			);
			throw new CustomException(ACCOUNT_EXIST);
		}

		Customer customer = customerRepository.findById(request.customerId())
			.orElseThrow(() -> new CustomException(CUSTOMER_NOT_FOUND));
		log.info("[account_create:validated_customer] customerId={}", customer.getCustomerId());

		customer.updateProfile(
			request.customerInfo().name(),
			request.customerInfo().email(),
			request.customerInfo().address(),
			request.customerInfo().addressDetail(),
			request.job(),
			resolvePurpose(request.transactionInfo().purpose()),
			resolveSource(request.transactionInfo().source()),
			request.taxInfo().hasForeignTax()
		);
		log.info("[account_create:updated_customer_profile] customerId={}", customer.getCustomerId());

		String rawAccountNumber = generateUniqueAccountNumber();
		Account account = Account.builder()
			.customer(customer)
			.accountType(resolveAccountType(request.accountType()))
			.hasLimit(true)
			.accountNumber(rawAccountNumber)
			.accountName(request.accountName())
			.balance(0)
			.password(passwordEncoder.encode(request.accountPassword()))
			.dailyTransferLimit(300_000)
			.bankCode(BankCode.WOORI)
			.build();
		log.info(
			"[account_create:processing] customerId={}, maskedAccountNumber={}, dailyTransferLimit={}",
			customer.getCustomerId(),
			maskAccountNumber(rawAccountNumber),
			account.getDailyTransferLimit()
		);

		Account result = accountRepository.save(account);
		log.info(
			"[account_create:completed] accountId={}, customerId={}, maskedAccountNumber={}",
			result.getAccountId(),
			customer.getCustomerId(),
			maskAccountNumber(rawAccountNumber)
		);
		return CreateAccountResponse.of(result.getAccountId());
	}

	private String maskAccountNumber(String raw13) {  // 계좌 번호 마스킹
		if (raw13 == null || raw13.length() < 4) {
			return "****";
		}
		return raw13.substring(0, 4) + "*********";
	}
}

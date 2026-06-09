package woorifisa.project.coreBanking.domain.account.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.*;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import woorifisa.project.coreBanking.domain.account.dto.request.CreateAccountRequest;
import woorifisa.project.coreBanking.domain.account.dto.request.RecipientLookupRequest;
import woorifisa.project.coreBanking.domain.account.entity.Account;
import woorifisa.project.coreBanking.domain.account.entity.enums.AccountType;
import woorifisa.project.coreBanking.domain.account.entity.enums.BankCode;
import woorifisa.project.coreBanking.domain.account.repository.AccountRepository;
import woorifisa.project.coreBanking.domain.customer.entity.Customer;
import woorifisa.project.coreBanking.domain.customer.repository.CustomerRepository;
import woorifisa.project.coreBanking.global.exception.CustomException;

class AccountServiceTest {

	private final AccountRepository accountRepository = mock(AccountRepository.class);
	private final CustomerRepository customerRepository = mock(CustomerRepository.class);
	private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
	private final AccountService accountService = new AccountService(accountRepository, customerRepository,
		passwordEncoder);

	@Test
	@DisplayName("은행코드와 계좌번호로 수취인명을 조회한다")
	void lookupRecipientSuccess() {
		Account account = Account.builder()
			.accountId(2002L)
			.bankCode(BankCode.BUSAN)
			.accountNumber("1122261925003")
			.customer(Customer.builder().customerId(1002L).name("백민정").build())
			.build();

		when(accountRepository.findByBankCodeAndAccountNumber(BankCode.BUSAN, "1122261925003"))
			.thenReturn(Optional.of(account));

		var response = accountService.lookupRecipient(new RecipientLookupRequest("busan", "1122261925003"));

		assertThat(response.recipientName()).isEqualTo("백민정");
	}

	@Test
	@DisplayName("일치하는 계좌가 없으면 예외를 반환한다")
	void lookupRecipientNotFound() {
		when(accountRepository.findByBankCodeAndAccountNumber(BankCode.BUSAN, "1122261925003"))
			.thenReturn(Optional.empty());

		assertThatThrownBy(() -> accountService.lookupRecipient(new RecipientLookupRequest("BUSAN", "1122261925003")))
			.isInstanceOf(CustomException.class)
			.hasMessage(ACCOUNT_RECIPIENT_LOOKUP_ACCOUNT_NOT_FOUND.getMessage());
	}

	@Test
	@DisplayName("계좌 비밀번호가 일치하면 검증에 성공한다")
	void verifyAccountPasswordSuccess() {
		Account account = Account.builder()
			.accountId(1L)
			.password("$2a$10$hashed")
			.build();
		when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
		when(passwordEncoder.matches("1234", "$2a$10$hashed")).thenReturn(true);

		accountService.verifyAccountPassword(
			new woorifisa.project.coreBanking.domain.account.dto.request.AccountPasswordVerifyRequest(1L, "1234"));
	}

	@Test
	@DisplayName("계좌 비밀번호가 일치하지 않으면 예외를 반환한다")
	void verifyAccountPasswordNotMatched() {
		Account account = Account.builder()
			.accountId(1L)
			.password("$2a$10$hashed")
			.build();
		when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
		when(passwordEncoder.matches("9999", "$2a$10$hashed")).thenReturn(false);

		assertThatThrownBy(() -> accountService.verifyAccountPassword(
			new woorifisa.project.coreBanking.domain.account.dto.request.AccountPasswordVerifyRequest(1L, "9999")
		))
			.isInstanceOf(CustomException.class)
			.hasMessage(ACCOUNT_PASSWORD_VERIFY_NOT_MATCHED.getMessage());
	}

	@Test
	@DisplayName("계좌 개설 성공 시 계좌를 저장하고 생성 계좌 정보를 반환한다")
	void createAccountSuccess() {
		CreateAccountRequest request = new CreateAccountRequest(
			AccountType.DEMAND_DEPOSIT.name(),
			"우리 SUPER주거래 통장",
			new CreateAccountRequest.CustomerInfo(
				"PARK JAEHA",
				"abcdef@gmail.com",
				"서울특별시 광진구 능동로 120",
				"건국대학교 기숙사 101호"
			),
			"STUDENT",
			new CreateAccountRequest.TransactionInfo("SALARY_AND_LIVING_EXPENSES", "EARNED_AND_PENSION_INCOME"),
			false,
			"1234"
		);

		Customer customer = Customer.builder().customerId(1001L).name("PARK JAEHA").build();
		when(customerRepository.findByNameAndEmail("PARK JAEHA", "abcdef@gmail.com")).thenReturn(Optional.of(customer));
		when(passwordEncoder.encode("1234")).thenReturn("$2a$10$encoded");
		when(accountRepository.existsByAccountNumber(any())).thenReturn(false);
		when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> {
			Account saved = invocation.getArgument(0, Account.class);
			return Account.builder()
				.accountId(2001L)
				.customer(saved.getCustomer())
				.accountType(saved.getAccountType())
				.hasLimit(saved.getHasLimit())
				.accountNumber(saved.getAccountNumber())
				.accountName(saved.getAccountName())
				.balance(saved.getBalance())
				.password(saved.getPassword())
				.transferLimit(saved.getTransferLimit())
				.bankCode(saved.getBankCode())
				.build();
		});

		var response = accountService.createAccount(request);

		assertThat(response.accountId()).isEqualTo(2001L);
		assertThat(response.customerId()).isEqualTo(1001L);
		assertThat(response.accountName()).isEqualTo("우리 SUPER주거래 통장");
		assertThat(response.accountNumber()).hasSize(13);
		assertThat(response.transferLimit()).isEqualTo(300_000);
		verify(passwordEncoder).encode("1234");
		verify(accountRepository).save(any(Account.class));
	}

	@Test
	@DisplayName("계좌 개설 시 고객이 없으면 예외를 반환한다")
	void createAccountCustomerNotFound() {
		CreateAccountRequest request = new CreateAccountRequest(
			AccountType.DEMAND_DEPOSIT.name(),
			"우리 SUPER주거래 통장",
			new CreateAccountRequest.CustomerInfo(
				"PARK JAEHA",
				"abcdef@gmail.com",
				"서울특별시 광진구 능동로 120",
				"건국대학교 기숙사 101호"
			),
			"STUDENT",
			new CreateAccountRequest.TransactionInfo("SALARY_AND_LIVING_EXPENSES", "EARNED_AND_PENSION_INCOME"),
			false,
			"1234"
		);
		when(customerRepository.findByNameAndEmail("PARK JAEHA", "abcdef@gmail.com")).thenReturn(Optional.empty());

		assertThatThrownBy(() -> accountService.createAccount(request))
			.isInstanceOf(CustomException.class)
			.hasMessage(ACCOUNT_CREATE_CUSTOMER_NOT_FOUND.getMessage());
	}

	@Test
	@DisplayName("동일 고객 + 동일 상품명 계좌가 이미 있으면 ACCOUNT_EXIST 예외를 반환한다")
	void createAccountDuplicateProduct() {
		CreateAccountRequest request = new CreateAccountRequest(
			AccountType.DEMAND_DEPOSIT.name(),
			"우리 SUPER주거래 통장",
			new CreateAccountRequest.CustomerInfo(
				"PARK JAEHA",
				"abcdef@gmail.com",
				"서울특별시 광진구 능동로 120",
				"건국대학교 기숙사 101호"
			),
			"STUDENT",
			new CreateAccountRequest.TransactionInfo(
				"SALARY_AND_LIVING_EXPENSES",
				"EARNED_AND_PENSION_INCOME"
			),
			false,
			"1234"
		);

		when(customerRepository.findByNameAndEmail("PARK JAEHA", "abcdef@gmail.com"))
			.thenReturn(Optional.of(Customer.builder().customerId(1001L).build()));
		when(accountRepository.existsByAccountNameAndCustomer_CustomerId("우리 SUPER주거래 통장", 1001L)).thenReturn(true);

		assertThatThrownBy(() -> accountService.createAccount(request)).isInstanceOf(CustomException.class).hasMessage(
			ACCOUNT_EXIST.getMessage());
	}
}

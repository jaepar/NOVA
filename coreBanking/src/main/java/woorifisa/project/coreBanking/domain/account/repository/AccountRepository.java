package woorifisa.project.coreBanking.domain.account.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import jakarta.persistence.LockModeType;
import woorifisa.project.coreBanking.domain.account.entity.Account;
import woorifisa.project.coreBanking.domain.account.entity.enums.BankCode;

public interface AccountRepository extends JpaRepository<Account, Long> {

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	Optional<Account> findByAccountIdAndCustomer_CustomerId(Long accountId, Long customerId);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	Optional<Account> findByAccountId(Long accountId);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	Optional<Account> findByAccountNumber(String accountNumber);

	// 은행 코드와 계좌 번호로 계좌 확인
	Optional<Account> findByBankCodeAndAccountNumber(BankCode bankCode, String accountNumber);

	// 중복 계좌 생성 방지
	boolean existsByAccountNameAndCustomer_CustomerId(String accountName, Long customerId);

	boolean existsByAccountNumber(String accountNumber);
}

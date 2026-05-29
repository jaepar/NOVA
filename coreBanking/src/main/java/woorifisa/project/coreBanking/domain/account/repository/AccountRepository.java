package woorifisa.project.coreBanking.domain.account.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import woorifisa.project.coreBanking.domain.account.entity.Account;
import woorifisa.project.coreBanking.domain.account.entity.enums.BankCode;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Account> findByAccountIdAndCustomer_CustomerId(Long accountId, Long customerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Account> findByAccountId(Long accountId);

    // 은행 코드와 계좌 번호로 해당 계좌 찾는 메서드
    Optional<Account> findByBankCodeAndAccountNumber(BankCode bankCode, String accountNumber);
}

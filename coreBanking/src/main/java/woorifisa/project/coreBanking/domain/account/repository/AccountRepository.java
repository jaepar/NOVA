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
}

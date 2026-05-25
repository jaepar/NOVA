package woorifisa.project.backend.domain.banking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import woorifisa.project.backend.domain.banking.entity.AccountRef;

import java.util.Optional;

@Repository
public interface BankingRepository extends JpaRepository<AccountRef, Long> {

    // 사용자 ID와 계좌 ID로 출금 계좌 소유 여부를 조회한다.
    Optional<AccountRef> findByUser_UserIdAndAccountId(Long userId, Long accountId);
}

package woorifisa.project.backend.domain.banking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import woorifisa.project.backend.domain.banking.entity.AccountRef;

import java.util.Optional;

@Repository
public interface BankingRepository extends JpaRepository<AccountRef, Long> {

    // 사용자의 계좌 중 계좌가 등록되어 있고 한도 계좌인 첫 번째 항목을 반환한다.
    Optional<AccountRef> findFirstByUser_UserIdAndHasAccountTrueAndHasLimitTrue(Long userId);
}

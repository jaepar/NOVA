package woorifisa.project.backend.domain.banking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import woorifisa.project.backend.domain.banking.entity.AccountRef;

import java.util.Optional;

@Repository
public interface BankingRepository extends JpaRepository<AccountRef, Long> {

    // 사용자 ID로 월렛 생성 가능한 임시 제한 계좌를 조회한다.
    Optional<AccountRef> findFirstByUser_UserIdAndHasAccountTrueAndHasLimitTrue(Long userId);
}

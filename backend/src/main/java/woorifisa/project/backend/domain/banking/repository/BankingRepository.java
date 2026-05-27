package woorifisa.project.backend.domain.banking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import woorifisa.project.backend.domain.banking.entity.AccountRef;

import java.util.Optional;

@Repository
public interface BankingRepository extends JpaRepository<AccountRef, Long> {

    // 현재 로그인 사용자(userId)가 가진 출금계좌(accountId)인지 확인하면서 계좌 참조를 찾는 조회 메서드
    Optional<AccountRef> findByUser_UserIdAndAccountId(Long userId, Long accountId);

}

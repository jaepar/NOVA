package woorifisa.project.backend.domain.banking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import woorifisa.project.backend.domain.banking.entity.AccountRef;

import java.util.Optional;

@Repository
public interface AccountRefRepository extends JpaRepository<AccountRef, Long> {

    // 사용자의 계좌 중 계좌가 등록된 첫 번째 항목을 반환한다.
    Optional<AccountRef> findFirstByUser_UserIdAndHasAccountTrue(Long userId);

    boolean existsByUser_UserIdAndHasAccountTrue(Long userId);

    // 현재 로그인 사용자(userId)가 가진 출금계좌(accountId)인지 확인하면서 계좌 참조를 찾는 조회 메서드
    Optional<AccountRef> findByUser_UserIdAndAccountId(Long userId, Long accountId);

    // 현재 로그인 사용자(userId)가 가진 출금계좌(accountNumber)인지 확인하면서 계좌 참조를 찾는 조회 메서드
    Optional<AccountRef> findByUser_UserIdAndAccountNumber(Long userId, String accountNumber);

    // 사용자의 대표 계좌 1건을 계좌 참조 ID 오름차순으로 조회
    Optional<AccountRef> findFirstByUser_UserIdAndHasAccountTrueOrderByAccountRefIdAsc(Long userId);

}

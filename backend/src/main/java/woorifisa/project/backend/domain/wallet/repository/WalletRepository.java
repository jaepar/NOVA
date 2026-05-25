package woorifisa.project.backend.domain.wallet.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import woorifisa.project.backend.domain.wallet.entity.Wallet;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    // 사용자 ID로 월렛을 조회한다.
    Optional<Wallet> findByUser_UserId(Long userId);

    // 월렛 충전 확정을 위해 월렛을 조회한다.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select w from Wallet w where w.walletId = :walletId")
    Optional<Wallet> findByIdForUpdate(@Param("walletId") Long walletId);
}

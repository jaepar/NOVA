package woorifisa.project.backend.domain.wallet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;

import java.util.List;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    // 월렛 ID로 거래내역을 최신순 조회한다.
    List<WalletTransaction> findAllByWallet_WalletIdOrderByCreatedAtDesc(Long walletId);
}

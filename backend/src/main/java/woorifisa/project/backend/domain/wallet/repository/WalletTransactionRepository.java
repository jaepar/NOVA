package woorifisa.project.backend.domain.wallet.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    // 특정 월렛의 거래내역을 최신순으로 페이지 단위 조회
    Slice<WalletTransaction> findAllByWallet_WalletIdOrderByCreatedAtDesc(Long walletId, Pageable pageable);
}

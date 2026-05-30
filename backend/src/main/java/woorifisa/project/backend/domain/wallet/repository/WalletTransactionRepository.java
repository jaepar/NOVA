package woorifisa.project.backend.domain.wallet.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    Slice<WalletTransaction> findAllByWallet_WalletIdOrderByCreatedAtDesc(Long walletId, Pageable pageable);
}

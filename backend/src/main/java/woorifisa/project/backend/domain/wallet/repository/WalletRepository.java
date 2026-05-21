package woorifisa.project.backend.domain.wallet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import woorifisa.project.backend.domain.wallet.entity.Wallet;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByUser_UserId(Long userId);
}

package woorifisa.project.backend.domain.wallet.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.backend.domain.banking.repository.BankingRepository;
import woorifisa.project.backend.domain.wallet.dto.response.WalletStatusResponse;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionsResponse;
import woorifisa.project.backend.domain.wallet.entity.Wallet;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;
import woorifisa.project.backend.domain.wallet.repository.WalletRepository;
import woorifisa.project.backend.domain.wallet.repository.WalletTransactionRepository;
import woorifisa.project.backend.global.exception.CustomException;

import java.util.List;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class WalletService {

    // 프론트 분기용 상태값
    private static final String ACCOUNT_REQUIRED = "ACCOUNT_REQUIRED";

    private final WalletRepository walletRepository;
    private final BankingRepository bankingRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Transactional(readOnly = true)
    public WalletTransactionsResponse findWalletTransactions(Long userId) {
        Wallet wallet = walletRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new CustomException(WALLET_NOT_FOUND));
        List<WalletTransaction> transactions = walletTransactionRepository.findAllByWallet_WalletIdOrderByCreatedAtDesc(wallet.getWalletId());

        return WalletTransactionsResponse.from(wallet, transactions);
    }

    @Transactional(readOnly = true)
    public WalletStatusResponse findWalletStatus(Long userId) {
        return walletRepository.findByUser_UserId(userId)
                .map(WalletStatusResponse::from)
                .orElseGet(() -> findCreatableWalletStatus(userId));
    }

    private WalletStatusResponse findCreatableWalletStatus(Long userId) {
        return bankingRepository.findFirstByUser_UserIdAndHasAccountTrueAndHasLimitTrue(userId)
                .map(WalletStatusResponse::from)
                .orElseGet(() -> new WalletStatusResponse(
                        false,
                        false,
                        false,
                        null,
                        null,
                        null,
                        ACCOUNT_REQUIRED
                ));
    }
}

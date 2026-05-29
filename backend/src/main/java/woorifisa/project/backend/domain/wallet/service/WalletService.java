package woorifisa.project.backend.domain.wallet.service;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.banking.repository.BankingRepository;
import woorifisa.project.backend.domain.wallet.dto.request.WalletCreateRequest;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionsResponse;
import woorifisa.project.backend.domain.wallet.entity.Wallet;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;
import woorifisa.project.backend.domain.wallet.repository.WalletRepository;
import woorifisa.project.backend.domain.wallet.repository.WalletTransactionRepository;
import woorifisa.project.backend.global.exception.CustomException;

import java.util.List;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_ACCOUNT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_TERMS_REQUIRED;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final BankingRepository bankingRepository;

    @Transactional(readOnly = true)
    public WalletTransactionsResponse findWalletTransactions(Long userId) {
        Wallet wallet = walletRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new CustomException(WALLET_NOT_FOUND));
        List<WalletTransaction> transactions = walletTransactionRepository.findAllByWallet_WalletIdOrderByCreatedAtDesc(wallet.getWalletId());

        return WalletTransactionsResponse.from(wallet, transactions);
    }

    public void createWallet(Long userId, WalletCreateRequest request) {
        if (!Boolean.TRUE.equals(request.termsAgreed())) {
            throw new CustomException(WALLET_TERMS_REQUIRED);
        }

        if (walletRepository.findByUser_UserId(userId).isPresent()) {
            return;
        }

        try {
            createNewWallet(userId);
        } catch (DataIntegrityViolationException ignored) {
            // 동시 요청으로 이미 생성된 경우 무시
        }
    }

    private void createNewWallet(Long userId) {
        AccountRef accountRef = bankingRepository.findFirstByUser_UserIdAndHasAccountTrueAndHasLimitTrue(userId)
                .orElseThrow(() -> new CustomException(WALLET_ACCOUNT_NOT_FOUND));
        Wallet wallet = Wallet.builder()
                .user(accountRef.getUser())
                .userAccount(accountRef)
                .balance(0)
                .build();

        walletRepository.save(wallet);
    }
}

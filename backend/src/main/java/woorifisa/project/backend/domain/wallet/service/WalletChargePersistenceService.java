package woorifisa.project.backend.domain.wallet.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.backend.domain.wallet.entity.Wallet;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;
import woorifisa.project.backend.domain.wallet.entity.enums.TransactionFlow;
import woorifisa.project.backend.domain.wallet.repository.WalletRepository;
import woorifisa.project.backend.domain.wallet.repository.WalletTransactionRepository;
import woorifisa.project.backend.global.exception.CustomException;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class WalletChargePersistenceService {

    private static final String WALLET_CHARGE_COUNTERPARTY = "월렛 충전";

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Transactional
    public void completeWalletCharge(Long walletId, Integer chargeAmount) {
        // 지갑 잔액과 거래내역은 같은 트랜잭션 안에서 함께 확정한다.
        Wallet wallet = findWalletForCharge(walletId);
        wallet.charge(chargeAmount);
        saveChargeTransaction(wallet, chargeAmount);
    }

    private Wallet findWalletForCharge(Long walletId) {
        // 동시에 여러 충전이 들어와도 잔액 계산이 꼬이지 않도록 쓰기 락으로 조회한다.
        return walletRepository.findByIdForUpdate(walletId)
                .orElseThrow(() -> new CustomException(WALLET_NOT_FOUND));
    }

    private void saveChargeTransaction(Wallet wallet, Integer chargeAmount) {
        walletTransactionRepository.save(WalletTransaction.builder()
                .wallet(wallet)
                .transactionFlow(TransactionFlow.DEPOSIT)
                .counterparty(WALLET_CHARGE_COUNTERPARTY)
                .amount(chargeAmount)
                .build());
    }
}

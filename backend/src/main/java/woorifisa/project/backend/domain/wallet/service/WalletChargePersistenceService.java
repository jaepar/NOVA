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
        // pessimistic lock으로 월렛을 조회해 충전 확정 중 잔액 경합을 막는다.
        Wallet wallet = walletRepository.findByIdForUpdate(walletId)
                .orElseThrow(() -> new CustomException(WALLET_NOT_FOUND));

        wallet.charge(chargeAmount);

        // 사용자 거래내역에 표시할 월렛 충전 입금 내역을 저장한다.
        walletTransactionRepository.save(WalletTransaction.builder()
                .wallet(wallet)
                .transactionFlow(TransactionFlow.DEPOSIT)
                .counterparty(WALLET_CHARGE_COUNTERPARTY)
                .amount(chargeAmount)
                .build());
    }
}

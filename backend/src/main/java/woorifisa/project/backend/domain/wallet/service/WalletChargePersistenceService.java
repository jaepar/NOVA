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
        // On-Prem 계좌 차감 성공 이후 월렛 저장 트랜잭션 경계
        Wallet wallet = walletRepository.findByIdForUpdate(walletId)
                .orElseThrow(() -> new CustomException(WALLET_NOT_FOUND));

        wallet.charge(chargeAmount);

        // 사용자 사용내역 조회 화면에 표시할 월렛 충전 거래내역
        walletTransactionRepository.save(WalletTransaction.builder()
                .wallet(wallet)
                .transactionFlow(TransactionFlow.DEPOSIT)
                .counterparty(WALLET_CHARGE_COUNTERPARTY)
                .amount(chargeAmount)
                .build());
    }
}

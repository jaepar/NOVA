package woorifisa.project.backend.domain.wallet.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import woorifisa.project.backend.domain.wallet.entity.Wallet;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;
import woorifisa.project.backend.domain.wallet.entity.enums.TransactionFlow;
import woorifisa.project.backend.domain.wallet.repository.WalletRepository;
import woorifisa.project.backend.domain.wallet.repository.WalletTransactionRepository;
import woorifisa.project.backend.global.exception.CustomException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_INVALID_CHARGE_AMOUNT;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_NOT_FOUND;

class WalletChargePersistenceServiceTest {

    private final WalletRepository walletRepository = mock(WalletRepository.class);
    private final WalletTransactionRepository walletTransactionRepository = mock(WalletTransactionRepository.class);
    private final WalletChargePersistenceService walletChargePersistenceService = new WalletChargePersistenceService(
            walletRepository,
            walletTransactionRepository
    );

    @Test
    @DisplayName("월렛 충전 확정 시 잔액을 증가시키고 입금 거래내역을 저장한다")
    void success() {
        Wallet wallet = Wallet.builder()
                .walletId(10L)
                .balance(30000)
                .build();
        when(walletRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(wallet));

        walletChargePersistenceService.completeWalletCharge(10L, 10000);

        assertThat(wallet.getBalance()).isEqualTo(40000);
        ArgumentCaptor<WalletTransaction> transactionCaptor = forClass(WalletTransaction.class);
        verify(walletTransactionRepository).save(transactionCaptor.capture());
        assertThat(transactionCaptor.getValue().getTransactionFlow()).isEqualTo(TransactionFlow.DEPOSIT);
        assertThat(transactionCaptor.getValue().getCounterparty()).isEqualTo("월렛 충전");
        assertThat(transactionCaptor.getValue().getAmount()).isEqualTo(10000);
    }

    @Test
    @DisplayName("월렛이 없으면 충전 확정에 실패한다")
    void walletNotFound() {
        when(walletRepository.findByIdForUpdate(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> walletChargePersistenceService.completeWalletCharge(10L, 10000))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_NOT_FOUND));
    }

    @Test
    @DisplayName("월렛 잔액이 Integer 범위를 넘으면 충전 확정에 실패한다")
    void amountOverflow() {
        Wallet wallet = Wallet.builder()
                .walletId(10L)
                .balance(Integer.MAX_VALUE)
                .build();
        when(walletRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(wallet));

        assertThatThrownBy(() -> walletChargePersistenceService.completeWalletCharge(10L, 1))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_INVALID_CHARGE_AMOUNT));
    }
}

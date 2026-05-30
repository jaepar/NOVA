package woorifisa.project.backend.domain.wallet.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;
import org.springframework.test.util.ReflectionTestUtils;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionsResponse;
import woorifisa.project.backend.domain.wallet.entity.Wallet;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;
import woorifisa.project.backend.domain.wallet.entity.enums.TransactionFlow;
import woorifisa.project.backend.domain.wallet.repository.WalletRepository;
import woorifisa.project.backend.domain.wallet.repository.WalletTransactionRepository;
import woorifisa.project.backend.global.exception.CustomException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_NOT_FOUND;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletTransactionRepository walletTransactionRepository;

    @InjectMocks
    private WalletService walletService;

    @Test
    @DisplayName("사용자 월렛 잔액과 거래내역을 최신순으로 조회한다")
    void success() {
        Long userId = 1L;
        Wallet wallet = Wallet.builder()
                .walletId(10L)
                .balance(12500)
                .build();
        WalletTransaction first = walletTransaction(101L, wallet, TransactionFlow.DEPOSIT, "월렛 충전", 10000, LocalDateTime.of(2025, 5, 24, 10, 30));
        WalletTransaction second = walletTransaction(102L, wallet, TransactionFlow.WITHDRAWAL, "이마트24 강남역점", 2500, LocalDateTime.of(2025, 5, 24, 14, 22));

        PageRequest pageable = PageRequest.of(0, 2);
        Slice<WalletTransaction> transactions = new SliceImpl<>(List.of(second, first), pageable, true);
        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.of(wallet));
        when(walletTransactionRepository.findAllByWallet_WalletIdOrderByCreatedAtDesc(eq(10L), eq(pageable)))
                .thenReturn(transactions);

        WalletTransactionsResponse response = walletService.findWalletTransactions(userId, 0, 2);

        assertThat(response.balance()).isEqualTo(12500);
        assertThat(response.transactions()).hasSize(2);
        assertThat(response.page()).isEqualTo(0);
        assertThat(response.size()).isEqualTo(2);
        assertThat(response.hasNext()).isTrue();
        assertThat(response.transactions().get(0).walletTransactionId()).isEqualTo(102L);
        assertThat(response.transactions().get(0).transactionFlow()).isEqualTo(TransactionFlow.WITHDRAWAL);
        assertThat(response.transactions().get(0).counterparty()).isEqualTo("이마트24 강남역점");
        assertThat(response.transactions().get(0).amount()).isEqualTo(2500);
        assertThat(response.transactions().get(0).createdAt()).isEqualTo(LocalDateTime.of(2025, 5, 24, 14, 22));
    }

    @Test
    @DisplayName("사용자 월렛이 없으면 예외가 발생한다")
    void notFound() {
        Long userId = 1L;

        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> walletService.findWalletTransactions(userId, 0, 20))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(WALLET_NOT_FOUND);
    }

    private WalletTransaction walletTransaction(Long walletTransactionId, Wallet wallet, TransactionFlow transactionFlow, String counterparty, Integer amount, LocalDateTime createdAt) {
        WalletTransaction walletTransaction = WalletTransaction.builder()
                .walletTransactionId(walletTransactionId)
                .wallet(wallet)
                .transactionFlow(transactionFlow)
                .counterparty(counterparty)
                .amount(amount)
                .build();
        ReflectionTestUtils.setField(walletTransaction, "createdAt", createdAt);
        return walletTransaction;
    }
}

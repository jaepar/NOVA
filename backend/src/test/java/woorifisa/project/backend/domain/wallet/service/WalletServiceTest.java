package woorifisa.project.backend.domain.wallet.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.banking.repository.BankingRepository;
import woorifisa.project.backend.domain.wallet.dto.response.WalletStatusResponse;
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
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_NOT_FOUND;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private BankingRepository bankingRepository;

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

        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.of(wallet));
        when(walletTransactionRepository.findAllByWallet_WalletIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(second, first));

        WalletTransactionsResponse response = walletService.findWalletTransactions(userId);

        assertThat(response.balance()).isEqualTo(12500);
        assertThat(response.transactions()).hasSize(2);
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

        assertThatThrownBy(() -> walletService.findWalletTransactions(userId))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(WALLET_NOT_FOUND);
    }

    @Test
    @DisplayName("월렛이 있으면 월렛 홈 화면에 필요한 상태를 반환한다")
    void walletFound() {
        Long userId = 1L;
        AccountRef accountRef = AccountRef.builder()
                .accountId(2001L)
                .build();
        Wallet wallet = Wallet.builder()
                .walletId(10L)
                .userAccount(accountRef)
                .balance(12500)
                .build();

        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.of(wallet));

        WalletStatusResponse response = walletService.findWalletStatus(userId);

        assertThat(response.hasWallet()).isTrue();
        assertThat(response.canCreateWallet()).isFalse();
        assertThat(response.walletId()).isEqualTo(10L);
        assertThat(response.balance()).isEqualTo(12500);
        assertThat(response.linkedAccountId()).isEqualTo(2001L);
        assertThat(response.reason()).isNull();
    }

    @Test
    @DisplayName("월렛이 없고 임시 제한 계좌가 있으면 월렛 생성 가능 상태를 반환한다")
    void canCreate() {
        Long userId = 1L;
        AccountRef accountRef = AccountRef.builder()
                .accountId(2001L)
                .build();

        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.empty());
        when(bankingRepository.findFirstByUser_UserIdAndHasAccountTrueAndHasLimitTrue(userId)).thenReturn(Optional.of(accountRef));

        WalletStatusResponse response = walletService.findWalletStatus(userId);

        assertThat(response.hasWallet()).isFalse();
        assertThat(response.canCreateWallet()).isTrue();
        assertThat(response.walletId()).isNull();
        assertThat(response.balance()).isNull();
        assertThat(response.linkedAccountId()).isEqualTo(2001L);
        assertThat(response.reason()).isNull();
    }

    @Test
    @DisplayName("월렛과 임시 제한 계좌가 없으면 계좌 개설 필요 상태를 반환한다")
    void accountRequired() {
        Long userId = 1L;

        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.empty());
        when(bankingRepository.findFirstByUser_UserIdAndHasAccountTrueAndHasLimitTrue(userId)).thenReturn(Optional.empty());

        WalletStatusResponse response = walletService.findWalletStatus(userId);

        assertThat(response.hasWallet()).isFalse();
        assertThat(response.canCreateWallet()).isFalse();
        assertThat(response.walletId()).isNull();
        assertThat(response.balance()).isNull();
        assertThat(response.linkedAccountId()).isNull();
        assertThat(response.reason()).isEqualTo("ACCOUNT_REQUIRED");
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

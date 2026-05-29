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
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.wallet.dto.request.WalletCreateRequest;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_ACCOUNT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_TERMS_REQUIRED;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletTransactionRepository walletTransactionRepository;

    @Mock
    private BankingRepository bankingRepository;

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
    @DisplayName("약관에 동의하면 임시 제한 계좌를 연결해 월렛을 생성한다")
    void createWallet() {
        Long userId = 1L;
        User user = User.builder().userId(userId).build();
        AccountRef accountRef = AccountRef.builder()
                .accountRefId(20L)
                .user(user)
                .hasAccount(true)
                .hasLimit(true)
                .build();
        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.empty());
        when(bankingRepository.findFirstByUser_UserIdAndHasAccountTrueAndHasLimitTrue(userId))
                .thenReturn(Optional.of(accountRef));

        walletService.createWallet(userId, new WalletCreateRequest(true));

        verify(walletRepository).save(org.mockito.ArgumentMatchers.argThat(wallet ->
                wallet.getUser().equals(user)
                        && wallet.getUserAccount().equals(accountRef)
                        && wallet.getBalance() == 0));
    }

    @Test
    @DisplayName("이미 월렛이 있으면 새로 생성하지 않는다")
    void createWalletAlreadyExists() {
        Wallet wallet = Wallet.builder()
                .walletId(10L)
                .balance(30000)
                .build();
        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.of(wallet));

        walletService.createWallet(1L, new WalletCreateRequest(true));

        verify(bankingRepository, never()).findFirstByUser_UserIdAndHasAccountTrueAndHasLimitTrue(any());
        verify(walletRepository, never()).save(any());
    }

    @Test
    @DisplayName("약관에 동의하지 않으면 월렛을 생성하지 않는다")
    void createWalletTermsRequired() {
        assertThatThrownBy(() -> walletService.createWallet(1L, new WalletCreateRequest(false)))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_TERMS_REQUIRED));

        verify(walletRepository, never()).save(any());
    }

    @Test
    @DisplayName("연결할 임시 제한 계좌가 없으면 월렛을 생성하지 않는다")
    void createWalletAccountRequired() {
        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.empty());
        when(bankingRepository.findFirstByUser_UserIdAndHasAccountTrueAndHasLimitTrue(1L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> walletService.createWallet(1L, new WalletCreateRequest(true)))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_ACCOUNT_NOT_FOUND));

        verify(walletRepository, never()).save(any());
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

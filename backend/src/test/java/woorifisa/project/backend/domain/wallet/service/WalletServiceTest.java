package woorifisa.project.backend.domain.wallet.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.util.ReflectionTestUtils;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.banking.repository.AccountRefRepository;
import woorifisa.project.backend.domain.wallet.dto.request.ChargeWalletRequest;
import woorifisa.project.backend.domain.wallet.dto.response.WalletNextStep;
import woorifisa.project.backend.domain.wallet.dto.response.WalletSummaryResponse;
import woorifisa.project.backend.domain.wallet.dto.response.WalletStatusResponse;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.wallet.dto.request.WalletCreateRequest;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionsResponse;
import woorifisa.project.backend.domain.wallet.entity.Wallet;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;
import woorifisa.project.backend.domain.wallet.entity.enums.TransactionFlow;
import woorifisa.project.backend.domain.wallet.repository.WalletRepository;
import woorifisa.project.backend.domain.wallet.repository.WalletTransactionRepository;
import woorifisa.project.backend.global.corebanking.client.CoreBankingClient;
import woorifisa.project.backend.global.exception.CustomException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.INVALID_SIZE_PARAM;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_ACCOUNT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_ALREADY_EXISTS;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_CREATE_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_CHARGE_IN_PROGRESS;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_IDEMPOTENCY_KEY_REQUIRED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_TERMS_REQUIRED;

class WalletServiceTest {

    private final WalletRepository walletRepository = mock(WalletRepository.class);
    private final WalletTransactionRepository walletTransactionRepository = mock(WalletTransactionRepository.class);
    private final AccountRefRepository accountRefRepository = mock(AccountRefRepository.class);
    private final CoreBankingClient coreBankingClient = mock(CoreBankingClient.class);
    private final StringRedisTemplate stringRedisTemplate = mock(StringRedisTemplate.class);

    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> valueOperations = mock(ValueOperations.class);

    private final WalletService walletService = new WalletService(
            walletRepository,
            walletTransactionRepository,
            accountRefRepository,
            coreBankingClient,
            stringRedisTemplate
    );

    @Test
    @DisplayName("월렛이 있으면 월렛 홈 이동 상태를 반환한다")
    void walletFound() {
        Long userId = 1L;
        Wallet wallet = Wallet.builder()
                .walletId(10L)
                .balance(12500)
                .build();

        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.of(wallet));

        WalletStatusResponse response = walletService.findWalletStatus(userId);

        assertThat(response.nextStep()).isEqualTo(WalletNextStep.WALLET_HOME);
    }

    @Test
    @DisplayName("월렛이 없고 임시 제한 계좌가 있으면 월렛 약관 이동 상태를 반환한다")
    void canCreate() {
        Long userId = 1L;

        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.empty());
        when(accountRefRepository.existsByUser_UserIdAndHasAccountTrue(userId)).thenReturn(true);

        WalletStatusResponse response = walletService.findWalletStatus(userId);

        assertThat(response.nextStep()).isEqualTo(WalletNextStep.WALLET_TERMS);
    }

    @Test
    @DisplayName("월렛과 임시 제한 계좌가 없으면 계좌 개설 이동 상태를 반환한다")
    void accountRequired() {
        Long userId = 1L;

        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.empty());
        when(accountRefRepository.existsByUser_UserIdAndHasAccountTrue(userId)).thenReturn(false);

        WalletStatusResponse response = walletService.findWalletStatus(userId);

        assertThat(response.nextStep()).isEqualTo(WalletNextStep.CREATE_ACCOUNT);
    }

    @Test
    @DisplayName("사용자의 월렛 잔액과 거래내역을 최신순으로 조회한다")
    void found() {
        Long userId = 1L;
        Wallet wallet = Wallet.builder()
                .walletId(10L)
                .balance(12500)
                .build();
        WalletTransaction first = walletTransaction(101L, wallet, TransactionFlow.DEPOSIT, "월렛 충전", 10000, LocalDateTime.of(2025, 5, 24, 10, 30));
        WalletTransaction second = walletTransaction(102L, wallet, TransactionFlow.WITHDRAWAL, "이마트24 강남점", 2500, LocalDateTime.of(2025, 5, 24, 14, 22));

        PageRequest pageable = PageRequest.of(0, 2);
        Slice<WalletTransaction> transactions = new SliceImpl<>(List.of(second, first), pageable, true);

        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.of(wallet));
        when(walletTransactionRepository.findAllByWallet_WalletIdOrderByCreatedAtDesc(10L, pageable)).thenReturn(transactions);

        WalletTransactionsResponse response = walletService.findWalletTransactions(userId, pageable);

        assertThat(response.balance()).isEqualTo(12500);
        assertThat(response.transactions()).hasSize(2);
        assertThat(response.transactions().get(0).walletTransactionId()).isEqualTo(102L);
        assertThat(response.hasNext()).isTrue();
    }

    @Test
    @DisplayName("월렛 잔액과 연결 계좌번호를 요약 조회한다")
    void summaryFound() {
        Long userId = 1L;
        AccountRef accountRef = AccountRef.builder()
                .accountNumber("1002867390781")
                .hasAccount(true)
                .build();
        Wallet wallet = Wallet.builder()
                .walletId(10L)
                .balance(30000)
                .userAccount(accountRef)
                .build();
        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.of(wallet));

        WalletSummaryResponse response = walletService.findSummary(userId);

        assertThat(response.balance()).isEqualTo(30000);
        assertThat(response.linkedAccountNumber()).isEqualTo("1002867390781");
    }

    @Test
    @DisplayName("월렛이 없으면 요약 조회 시 예외를 던진다")
    void summaryWalletNotFound() {
        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> walletService.findSummary(1L))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_NOT_FOUND));
    }

    @Test
    @DisplayName("월렛에 연결된 사용 가능 계좌가 없으면 요약 조회 시 예외를 던진다")
    void summaryAccountNotFound() {
        Long userId = 1L;
        AccountRef accountRef = AccountRef.builder()
                .accountNumber("1002867390781")
                .hasAccount(false)
                .build();
        Wallet wallet = Wallet.builder()
                .walletId(10L)
                .balance(30000)
                .userAccount(accountRef)
                .build();
        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.of(wallet));

        assertThatThrownBy(() -> walletService.findSummary(userId))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_ACCOUNT_NOT_FOUND));
    }

    @Test
    @DisplayName("신규 충전이면 CoreBanking 차감 후 월렛 충전을 확정하고 완료 키를 저장한다")
    void success() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);

        givenNewCharge();

        walletService.chargeWallet(1L, "idempotency-key", request);

        verify(coreBankingClient).debitWalletAccount(any());
        verify(walletTransactionRepository).save(any(WalletTransaction.class));
        verify(valueOperations).set(
                eq("wallet:charge:result:idempotency-key"),
                eq("DONE"),
                any(Duration.class)
        );
        verify(stringRedisTemplate).delete("account:debit:processing:2001");
        verify(stringRedisTemplate).delete("wallet:charge:processing:idempotency-key");
    }

    @Test
    @DisplayName("CoreBanking external request id로 Idempotency-Key를 그대로 사용한다")
    void usesIdempotencyKeyAsExternalRequestId() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);

        givenNewCharge();

        walletService.chargeWallet(1L, "idempotency-key", request);

        verify(coreBankingClient).debitWalletAccount(
                org.mockito.ArgumentMatchers.argThat(debitRequest ->
                        "idempotency-key".equals(debitRequest.walletChargeRequestId()))
        );
    }

    @Test
    @DisplayName("이미 완료된 멱등 키면 재처리하지 않고 성공 처리한다")
    void completed() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);

        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("wallet:charge:result:idempotency-key")).thenReturn("DONE");

        walletService.chargeWallet(1L, "idempotency-key", request);

        verify(valueOperations, never()).setIfAbsent(any(), any(), any(Duration.class));
        verify(coreBankingClient, never()).debitWalletAccount(any());
        verify(walletTransactionRepository, never()).save(any(WalletTransaction.class));
    }

    @Test
    @DisplayName("CoreBanking 차감 실패 시 월렛 충전을 확정하지 않는다")
    void debitFailed() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);

        givenNewCharge();
        doThrow(new CustomException(WALLET_DEBIT_FAILED))
                .when(coreBankingClient).debitWalletAccount(any());

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_DEBIT_FAILED));

        verify(stringRedisTemplate).delete("wallet:charge:processing:idempotency-key");
        verify(walletTransactionRepository, never()).save(any(WalletTransaction.class));
    }

    @Test
    @DisplayName("Idempotency-Key가 없으면 예외를 던진다")
    void missingKey() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);

        assertThatThrownBy(() -> walletService.chargeWallet(1L, " ", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_IDEMPOTENCY_KEY_REQUIRED));
    }

    @Test
    @DisplayName("동일 Idempotency-Key가 처리 중이면 예외를 던진다")
    void duplicatedKey() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);

        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("wallet:charge:result:idempotency-key")).thenReturn(null);
        when(valueOperations.setIfAbsent(
                eq("wallet:charge:processing:idempotency-key"),
                eq("1"),
                any(Duration.class)
        )).thenReturn(false);

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_CHARGE_IN_PROGRESS));

        verify(coreBankingClient, never()).debitWalletAccount(any());
    }

    @Test
    @DisplayName("같은 계좌가 이미 처리중이면 예외를 던진다")
    void duplicatedByAccountLock() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);
        Wallet wallet = wallet();

        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("wallet:charge:result:idempotency-key")).thenReturn(null);
        when(valueOperations.setIfAbsent(
                eq("wallet:charge:processing:idempotency-key"),
                eq("1"),
                any(Duration.class)
        )).thenReturn(true);
        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.of(wallet));
        when(valueOperations.setIfAbsent(
                eq("account:debit:processing:2001"),
                eq("1"),
                any(Duration.class)
        )).thenReturn(false);

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_CHARGE_IN_PROGRESS));

        verify(coreBankingClient, never()).debitWalletAccount(any());
        verify(stringRedisTemplate, never()).delete("account:debit:processing:2001");
        verify(stringRedisTemplate).delete("wallet:charge:processing:idempotency-key");
    }

    @Test
    @DisplayName("사용자 월렛이 없으면 예외가 발생한다")
    void notFound() {
        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> walletService.findWalletTransactions(1L, PageRequest.of(0, 20)))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_NOT_FOUND));
    }

    @Test
    @DisplayName("size가 100보다 크면 예외가 발생한다")
    void invalidSizeGreaterThanOneHundred() {
        assertThatThrownBy(() -> walletService.findWalletTransactions(1L, PageRequest.of(0, 101)))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(INVALID_SIZE_PARAM));
    }

    @Test
    @DisplayName("월렛이 없으면 예외를 던진다")
    void walletNotFound() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);

        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("wallet:charge:result:idempotency-key")).thenReturn(null);
        when(valueOperations.setIfAbsent(
                eq("wallet:charge:processing:idempotency-key"),
                eq("1"),
                any(Duration.class)
        )).thenReturn(true);
        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_NOT_FOUND));

        verify(stringRedisTemplate).delete("wallet:charge:processing:idempotency-key");
        verify(coreBankingClient, never()).debitWalletAccount(any());
    }

    @Test
    @DisplayName("월렛에 연결된 출금 계좌가 없으면 예외를 던진다")
    void accountNotFound() {
        ChargeWalletRequest request = new ChargeWalletRequest(10000);
        Wallet wallet = Wallet.builder().walletId(10L).balance(30000).build();

        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("wallet:charge:result:idempotency-key")).thenReturn(null);
        when(valueOperations.setIfAbsent(
                eq("wallet:charge:processing:idempotency-key"),
                eq("1"),
                any(Duration.class)
        )).thenReturn(true);
        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.of(wallet));

        assertThatThrownBy(() -> walletService.chargeWallet(1L, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_ACCOUNT_NOT_FOUND));

        verify(stringRedisTemplate).delete("wallet:charge:processing:idempotency-key");
        verify(coreBankingClient, never()).debitWalletAccount(any());
    }

    private void givenNewCharge() {
        Wallet wallet = wallet();
        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.of(wallet));
        when(walletRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(wallet));
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("wallet:charge:result:idempotency-key")).thenReturn(null);
        when(valueOperations.setIfAbsent(
                eq("wallet:charge:processing:idempotency-key"),
                eq("1"),
                any(Duration.class)
        )).thenReturn(true);
        when(valueOperations.setIfAbsent(
                eq("account:debit:processing:2001"),
                eq("1"),
                any(Duration.class)
        )).thenReturn(true);
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
        when(accountRefRepository.findFirstByUser_UserIdAndHasAccountTrue(userId))
                .thenReturn(Optional.of(accountRef));

        walletService.createWallet(userId, new WalletCreateRequest(true));

        verify(walletRepository).save(org.mockito.ArgumentMatchers.argThat(wallet ->
                wallet.getUser().equals(user)
                        && wallet.getUserAccount().equals(accountRef)
                        && wallet.getBalance() == 0));
    }

    @Test
    @DisplayName("이미 월렛이 있으면 커스텀 예외를 던진다")
    void createWalletAlreadyExists() {
        Wallet wallet = Wallet.builder()
                .walletId(10L)
                .balance(30000)
                .build();
        when(walletRepository.findByUser_UserId(1L)).thenReturn(Optional.of(wallet));

        assertThatThrownBy(() -> walletService.createWallet(1L, new WalletCreateRequest(true)))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_ALREADY_EXISTS));

        verify(accountRefRepository, never()).findFirstByUser_UserIdAndHasAccountTrue(any());
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
        when(accountRefRepository.findFirstByUser_UserIdAndHasAccountTrue(1L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> walletService.createWallet(1L, new WalletCreateRequest(true)))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_ACCOUNT_NOT_FOUND));

        verify(walletRepository, never()).save(any());
    }

    @Test
    @DisplayName("월렛 저장 중 무결성 예외가 발생하면 월렛 생성 실패 예외를 던진다")
    void createWalletFailed() {
        Long userId = 1L;
        User user = User.builder().userId(userId).build();
        AccountRef accountRef = AccountRef.builder()
                .accountRefId(20L)
                .user(user)
                .hasAccount(true)
                .hasLimit(true)
                .build();
        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.empty());
        when(accountRefRepository.findFirstByUser_UserIdAndHasAccountTrue(userId))
                .thenReturn(Optional.of(accountRef));
        doThrow(new DataIntegrityViolationException("duplicate key"))
                .when(walletRepository).save(any(Wallet.class));

        assertThatThrownBy(() -> walletService.createWallet(userId, new WalletCreateRequest(true)))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_CREATE_FAILED));
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

    private Wallet wallet() {
        return Wallet.builder()
                .walletId(10L)
                .balance(30000)
                .userAccount(accountRef())
                .build();
    }

    private AccountRef accountRef() {
        return AccountRef.builder()
                .customerId(1001L)
                .accountId(2001L)
                .balance(50000)
                .hasAccount(true)
                .build();
    }
}

package woorifisa.project.backend.domain.wallet.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.banking.repository.BankingRepository;
import woorifisa.project.backend.domain.wallet.client.OnPremWalletClient;
import woorifisa.project.backend.domain.wallet.dto.request.ChargeWalletRequest;
import woorifisa.project.backend.domain.wallet.dto.request.DebitWalletAccountRequest;
import woorifisa.project.backend.domain.wallet.dto.response.DebitWalletAccountResponse;
import woorifisa.project.backend.domain.wallet.entity.Wallet;
import woorifisa.project.backend.domain.wallet.repository.WalletRepository;
import woorifisa.project.backend.global.exception.CustomException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_ACCOUNT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_INVALID_CHARGE_AMOUNT;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class WalletService {

    private static final int SUCCESS_CODE = 20000;
    private static final DateTimeFormatter REQUEST_DATE_FORMAT = DateTimeFormatter.BASIC_ISO_DATE;

    private final WalletRepository walletRepository;
    private final BankingRepository bankingRepository;
    private final OnPremWalletClient onPremWalletClient;
    private final WalletChargePersistenceService walletChargePersistenceService;

    public void chargeWallet(Long userId, String idempotencyKey, ChargeWalletRequest request) {
        validateChargeRequest(userId, request);
        Integer chargeAmount = toIntegerAmount(request.chargeAmount());

        Wallet wallet = walletRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new CustomException(WALLET_NOT_FOUND));
        AccountRef accountRef = bankingRepository.findByUser_UserIdAndAccountId(userId, request.withdrawAccountId())
                .orElseThrow(() -> new CustomException(WALLET_ACCOUNT_NOT_FOUND));

        // Cloud와 On-Prem 거래 추적을 연결하는 충전 요청 식별값
        DebitWalletAccountRequest debitRequest = new DebitWalletAccountRequest(
                createWalletChargeRequestId(),
                accountRef.getCustomerId(),
                accountRef.getAccountId(),
                request.chargeAmount()
        );

        // Core Banking 계좌 차감 확정 전 월렛 잔액 변경 금지
        DebitWalletAccountResponse debitResponse = onPremWalletClient.debitWalletAccount(debitRequest);
        if (debitResponse == null || !Boolean.TRUE.equals(debitResponse.success()) || !Integer.valueOf(SUCCESS_CODE).equals(debitResponse.code())) {
            throw new CustomException(WALLET_DEBIT_FAILED);
        }

        walletChargePersistenceService.completeWalletCharge(wallet.getWalletId(), chargeAmount);
    }

    private void validateChargeRequest(Long userId, ChargeWalletRequest request) {
        if (userId == null || request == null || request.withdrawAccountId() == null || request.chargeAmount() == null || request.chargeAmount() <= 0) {
            throw new CustomException(WALLET_INVALID_CHARGE_AMOUNT);
        }
    }

    private Integer toIntegerAmount(Long amount) {
        if (amount > Integer.MAX_VALUE) {
            throw new CustomException(WALLET_INVALID_CHARGE_AMOUNT);
        }
        return amount.intValue();
    }

    private String createWalletChargeRequestId() {
        // DB 저장 없이 On-Prem 요청과 로그 추적에 사용하는 값
        return "WCR-" + LocalDate.now().format(REQUEST_DATE_FORMAT) + "-" + UUID.randomUUID();
    }
}

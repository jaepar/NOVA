package woorifisa.project.coreBanking.domain.wallet.service;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.coreBanking.domain.account.entity.Account;
import woorifisa.project.coreBanking.domain.account.repository.AccountRepository;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionFlow;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionType;
import woorifisa.project.coreBanking.domain.accountTransaction.repository.AccountTransactionRepository;
import woorifisa.project.coreBanking.domain.wallet.dto.request.DebitWalletAccountRequest;
import woorifisa.project.coreBanking.domain.wallet.dto.response.DebitWalletAccountResponse;

@Service
@RequiredArgsConstructor
public class WalletService {

    private static final int SUCCESS_CODE = 20000;
    private static final int BAD_REQUEST_CODE = 40000;
    private static final int NOT_FOUND_CODE = 40400;
    private static final String WALLET_CHARGE_COUNTERPARTY = "월렛 충전";
    private static final String SUCCESS_MESSAGE = "계좌 차감이 완료되었습니다.";
    private static final String INVALID_REQUEST_MESSAGE = "계좌 차감 요청이 올바르지 않습니다.";
    private static final String ACCOUNT_NOT_FOUND_MESSAGE = "출금 계좌를 찾을 수 없습니다.";
    private static final String INSUFFICIENT_BALANCE_MESSAGE = "계좌 잔액이 부족합니다.";

    private final AccountRepository accountRepository;
    private final AccountTransactionRepository accountTransactionRepository;

    @Transactional
    public DebitWalletAccountResponse debitWalletCharge(DebitWalletAccountRequest request) {
        if (isInvalidRequest(request)) {
            return failure(BAD_REQUEST_CODE, INVALID_REQUEST_MESSAGE);
        }

        if (accountTransactionRepository.existsByExternalRequestId(request.walletChargeRequestId())) {
            return success();
        }

        Account account = accountRepository.findByAccountIdAndCustomer_CustomerId(
                request.withdrawAccountId(),
                request.customerId()
        ).orElse(null);

        if (account == null) {
            return failure(NOT_FOUND_CODE, ACCOUNT_NOT_FOUND_MESSAGE);
        }

        if (accountTransactionRepository.existsByExternalRequestId(request.walletChargeRequestId())) {
            return success();
        }

        Integer chargeAmount = request.chargeAmount().intValue();
        try {
            account.debit(chargeAmount);
        } catch (IllegalArgumentException exception) {
            return failure(BAD_REQUEST_CODE, INSUFFICIENT_BALANCE_MESSAGE);
        }

        try {
            accountTransactionRepository.save(AccountTransaction.builder()
                    .account(account)
                    .transactionFlow(TransactionFlow.WITHDRAWAL)
                    .transactionType(TransactionType.WALLET_CHARGE)
                    .counterParty(WALLET_CHARGE_COUNTERPARTY)
                    .amount(chargeAmount)
                    .externalRequestId(request.walletChargeRequestId())
                    .build());
        } catch (DataIntegrityViolationException exception) {
            return success();
        }

        return success();
    }

    private boolean isInvalidRequest(DebitWalletAccountRequest request) {
        return request == null
                || request.walletChargeRequestId() == null
                || request.walletChargeRequestId().isBlank()
                || request.customerId() == null
                || request.withdrawAccountId() == null
                || request.chargeAmount() == null
                || request.chargeAmount() <= 0
                || request.chargeAmount() > Integer.MAX_VALUE;
    }

    private DebitWalletAccountResponse success() {
        return new DebitWalletAccountResponse(true, SUCCESS_CODE, SUCCESS_MESSAGE);
    }

    private DebitWalletAccountResponse failure(Integer code, String message) {
        return new DebitWalletAccountResponse(false, code, message);
    }
}

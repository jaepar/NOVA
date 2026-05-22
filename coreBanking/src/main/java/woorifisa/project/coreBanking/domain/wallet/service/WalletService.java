package woorifisa.project.coreBanking.domain.wallet.service;

import lombok.RequiredArgsConstructor;
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
import woorifisa.project.coreBanking.global.response.status.BaseResponseStatus;

@Service
@RequiredArgsConstructor
public class WalletService {

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
            return failure(BaseResponseStatus.BAD_REQUEST, INVALID_REQUEST_MESSAGE);
        }

        // 이미 처리된 충전 요청이면 계좌를 다시 차감하지 않고 멱등 성공으로 응답한다.
        if (accountTransactionRepository.existsByExternalRequestId(request.walletChargeRequestId())) {
            return success();
        }

        Account account = accountRepository.findByAccountIdAndCustomer_CustomerId(
                request.withdrawAccountId(),
                request.customerId()
        ).orElse(null);

        if (account == null) {
            return failure(BaseResponseStatus.NOT_FOUND, ACCOUNT_NOT_FOUND_MESSAGE);
        }

        // 계좌 락 획득 이후 한 번 더 확인해 동시 중복 요청의 이중 차감을 방지한다.
        if (accountTransactionRepository.existsByExternalRequestId(request.walletChargeRequestId())) {
            return success();
        }

        Integer chargeAmount = request.chargeAmount().intValue();
        try {
            account.debit(chargeAmount);
        } catch (IllegalArgumentException exception) {
            return failure(BaseResponseStatus.BAD_REQUEST, INSUFFICIENT_BALANCE_MESSAGE);
        }

        // 계좌 차감과 거래내역 저장은 같은 트랜잭션 안에서 확정한다.
        accountTransactionRepository.save(AccountTransaction.builder()
                .account(account)
                .transactionFlow(TransactionFlow.WITHDRAWAL)
                .transactionType(TransactionType.WALLET_CHARGE)
                .counterParty(WALLET_CHARGE_COUNTERPARTY)
                .amount(chargeAmount)
                .externalRequestId(request.walletChargeRequestId())
                .build());

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
        return new DebitWalletAccountResponse(
                BaseResponseStatus.SUCCESS.getSuccess(),
                BaseResponseStatus.SUCCESS.getCode(),
                SUCCESS_MESSAGE
        );
    }

    private DebitWalletAccountResponse failure(BaseResponseStatus status, String message) {
        return new DebitWalletAccountResponse(status.getSuccess(), status.getCode(), message);
    }
}

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
import woorifisa.project.coreBanking.global.exception.CustomException;

import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_INSUFFICIENT_BALANCE;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_INVALID_REQUEST;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class WalletService {

    private static final String WALLET_CHARGE_COUNTERPARTY = "월렛 충전";

    private final AccountRepository accountRepository;
    private final AccountTransactionRepository accountTransactionRepository;

    @Transactional
    public void debitWalletCharge(DebitWalletAccountRequest request) {
        if (isInvalidRequest(request)) {
            throw new CustomException(WALLET_ACCOUNT_DEBIT_INVALID_REQUEST);
        }

        // 이미 처리된 충전 요청이면 계좌를 다시 차감하지 않고 멱등 성공으로 응답한다.
        if (accountTransactionRepository.existsByExternalRequestId(request.walletChargeRequestId())) {
            return;
        }

        Account account = accountRepository.findByAccountIdAndCustomer_CustomerId(
                request.withdrawAccountId(),
                request.customerId()
        ).orElseThrow(() -> new CustomException(WALLET_ACCOUNT_DEBIT_NOT_FOUND));

        // 계좌 락 획득 이후 한 번 더 확인해 동시 중복 요청의 이중 차감을 방지한다.
        if (accountTransactionRepository.existsByExternalRequestId(request.walletChargeRequestId())) {
            return;
        }

        Integer chargeAmount = request.chargeAmount().intValue();
        try {
            account.debit(chargeAmount);
        } catch (IllegalArgumentException exception) {
            throw new CustomException(WALLET_ACCOUNT_DEBIT_INSUFFICIENT_BALANCE);
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

}

package woorifisa.project.coreBanking.domain.globalTransaction.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionFlow;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionType;
import woorifisa.project.coreBanking.domain.accountTransaction.repository.AccountTransactionRepository;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.GlobalTransaction;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionFailureReason;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionStatus;
import woorifisa.project.coreBanking.domain.globalTransaction.fds.client.FdsClient;
import woorifisa.project.coreBanking.domain.globalTransaction.fds.dto.FdsGlobalTransactionScreeningRequest;
import woorifisa.project.coreBanking.domain.globalTransaction.fds.dto.FdsGlobalTransactionScreeningResponse;
import woorifisa.project.coreBanking.domain.globalTransaction.repository.GlobalTransactionRepository;
import woorifisa.project.coreBanking.global.exception.CustomException;

import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.GLOBAL_TRANSACTION_NOT_FOUND;

@Service
@Slf4j
@RequiredArgsConstructor
public class GlobalTransactionFdsService {

    private static final String REFUND_COUNTERPARTY = "해외송금 실패 환급";

    private final FdsClient fdsClient;
    private final GlobalTransactionRepository globalTransactionRepository;
    private final AccountTransactionRepository accountTransactionRepository;

    @Async
    @Transactional
    public void screenAsync(Long globalTransactionId) {
        log.info("Global transaction FDS screening started globalTransactionId={}", globalTransactionId);
        GlobalTransaction globalTransaction = globalTransactionRepository.findById(globalTransactionId)
                .orElseThrow(() -> new CustomException(GLOBAL_TRANSACTION_NOT_FOUND));

        try {
            FdsGlobalTransactionScreeningResponse response = fdsClient.screen(
                    FdsGlobalTransactionScreeningRequest.from(globalTransaction)
            );
            if (response.status() == GlobalTransactionStatus.SUCCESS) {
                globalTransaction.markSuccess();
                log.info("Global transaction FDS screening succeeded globalTransactionId={} status={}",
                        globalTransactionId, GlobalTransactionStatus.SUCCESS);
                return;
            }
            log.warn("Global transaction FDS screening failed globalTransactionId={} failureReason={}",
                    globalTransactionId, response.failureReason());
            failAndRefund(globalTransaction, response.failureReason());
        } catch (RuntimeException exception) {
            log.error("Global transaction FDS communication failed globalTransactionId={} message={}",
                    globalTransactionId, exception.getMessage());
            failAndRefund(globalTransaction, GlobalTransactionFailureReason.FDS_COMMUNICATION_FAILED);
        }
    }

    private void failAndRefund(GlobalTransaction globalTransaction, GlobalTransactionFailureReason failureReason) {
        GlobalTransactionFailureReason resolvedReason = failureReason == null
                ? GlobalTransactionFailureReason.FDS_RESPONSE_INVALID
                : failureReason;
        globalTransaction.markFailed(resolvedReason);

        int refundAmount = Integer.parseInt(globalTransaction.getKrwAmount());
        globalTransaction.getAccount().credit(refundAmount);
        int balanceAfter = globalTransaction.getAccount().getBalance();
        accountTransactionRepository.save(AccountTransaction.builder()
                .account(globalTransaction.getAccount())
                .transactionFlow(TransactionFlow.DEPOSIT)
                .transactionType(TransactionType.GLOBAL_REMITTANCE_REFUND)
                .counterParty(REFUND_COUNTERPARTY)
                .amount(refundAmount)
                .balanceAfter(balanceAfter)
                .externalRequestId(globalTransaction.getExternalRequestId() + ":refund")
                .build());
        log.info("Global transaction refund completed globalTransactionId={} accountId={} refundAmount={} failureReason={}",
                globalTransaction.getGlobalTransactionId(), globalTransaction.getAccount().getAccountId(),
                refundAmount, resolvedReason);
    }
}

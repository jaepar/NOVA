package woorifisa.project.backend.domain.banking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingRecipientLookupRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingTransactionQuery;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingTransferRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingTransactionsResponse;
import woorifisa.project.backend.domain.banking.dto.request.AccountPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransactionDateRange;
import woorifisa.project.backend.domain.banking.dto.request.TransactionFlowFilter;
import woorifisa.project.backend.domain.banking.dto.request.TransactionPeriod;
import woorifisa.project.backend.domain.banking.dto.request.TransferPreviewRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferRequest;
import woorifisa.project.backend.domain.banking.dto.response.BankingTransactionsResponse;
import woorifisa.project.backend.domain.banking.dto.response.TransferPreviewResponse;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.banking.repository.AccountRefRepository;
import woorifisa.project.backend.global.corebanking.client.CoreBankingClient;
import woorifisa.project.backend.global.exception.CustomException;

import java.time.Duration;
import java.time.LocalDate;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BAD_REQUEST;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_ACCOUNT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_CORE_BANKING_COMMUNICATION_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_RECIPIENT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_REQUEST_LOOKUP_RETRY_INTERRUPTED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_TRANSFER_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_TRANSFER_PROCESSING;

@Service
@RequiredArgsConstructor
public class BankingService {

    private static final String TRANSFER_RESULT_KEY = "banking:transfer:result:%s";
    private static final String TRANSFER_PROCESSING_KEY = "banking:transfer:processing:%s";
    private static final String ACCOUNT_DEBIT_PROCESSING_KEY = "account:debit:processing:%s";
    private static final String TRANSFER_DONE_VALUE = "DONE";
    private static final String PROCESSING_VALUE = "1";
    private static final Duration PROCESSING_TTL = Duration.ofMinutes(5);
    private static final Duration RESULT_TTL = Duration.ofMinutes(10);
    private static final long REQUEST_LOOKUP_RETRY_DELAY_MILLIS = 1000L;

    private final AccountRefRepository accountRefRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final CoreBankingClient coreBankingClient;

    @Transactional
    public void transfer(Long userId, String idempotencyKey, TransferRequest request) {
        String resultKey = formatResultKey(idempotencyKey);
        String cachedResult = stringRedisTemplate.opsForValue().get(resultKey);
        if (cachedResult != null) {
            return;
        }

        String processingKey = formatProcessingKey(idempotencyKey);
        Boolean acquired = stringRedisTemplate.opsForValue().setIfAbsent(processingKey, PROCESSING_VALUE, PROCESSING_TTL);
        if (!Boolean.TRUE.equals(acquired)) {
            throw new CustomException(BANKING_TRANSFER_PROCESSING);
        }

        try {
            AccountRef accountRef = accountRefRepository.findByUser_UserIdAndAccountId(userId, request.withdrawAccountId())
                    .orElseThrow(() -> new CustomException(BANKING_ACCOUNT_NOT_FOUND));
            String accountProcessingKey = formatAccountProcessingKey(accountRef.getAccountId());
            Boolean accountLockAcquired = stringRedisTemplate.opsForValue()
                    .setIfAbsent(accountProcessingKey, PROCESSING_VALUE, PROCESSING_TTL);
            if (!Boolean.TRUE.equals(accountLockAcquired)) {
                throw new CustomException(BANKING_TRANSFER_PROCESSING);
            }

            try {
                CoreBankingTransferRequest coreBankingTransferRequest = CoreBankingTransferRequest.of(
                        createExternalRequestId(idempotencyKey),
                        accountRef.getAccountId(),
                        request
                );

                transferWithRecovery(coreBankingTransferRequest);
                accountRef.debit(request.transferAmount());
                stringRedisTemplate.opsForValue().set(resultKey, TRANSFER_DONE_VALUE, RESULT_TTL);
            } finally {
                stringRedisTemplate.delete(accountProcessingKey);
            }
        } finally {
            stringRedisTemplate.delete(processingKey);
        }
    }

    public TransferPreviewResponse previewTransfer(Long userId, TransferPreviewRequest request) {
        AccountRef myAccount = accountRefRepository.findFirstByUser_UserIdAndHasAccountTrueOrderByAccountRefIdAsc(userId)
                .orElseThrow(() -> new CustomException(BANKING_ACCOUNT_NOT_FOUND));

        String recipientName = coreBankingClient.lookupRecipient(
                        CoreBankingRecipientLookupRequest.of(request.recipientBankCode(), request.recipientAccountNumber()))
                .recipientName();

        if (recipientName == null || recipientName.isBlank()) {
            throw new CustomException(BANKING_RECIPIENT_NOT_FOUND);
        }

        return TransferPreviewResponse.of(
                myAccount.getAccountName(),
                myAccount.getAccountNumber(),
                recipientName
        );
    }

    public void verifyAccountPassword(Long userId, AccountPasswordVerifyRequest request) {
        accountRefRepository.findByUser_UserIdAndAccountId(userId, request.accountId())
                .orElseThrow(() -> new CustomException(BANKING_ACCOUNT_NOT_FOUND));

        coreBankingClient.verifyAccountPassword(
                CoreBankingPasswordVerifyRequest.of(request.accountId(), request.accountPassword())
        );
    }

    // 계좌 거래내역 조회
    public BankingTransactionsResponse findTransactions(
            Long userId,
            Long accountId,
            TransactionPeriod period,
            TransactionFlowFilter flow,
            LocalDate customFrom,
            LocalDate customTo,
            Pageable pageable
    ) {
        // 요청한 계좌가 본인 계좌인지 검증
        accountRefRepository.findByUser_UserIdAndAccountId(userId, accountId)
                .orElseThrow(() -> new CustomException(BANKING_ACCOUNT_NOT_FOUND));

        // period가 CUSTOM이면 customFrom/customTo를 검증해 사용하고,
        // 고정 기간이면 오늘을 기준으로 시작일과 종료일을 계산한다.
        // 정렬은 코어뱅킹에서 내림차순 고정이므로 별도 sort 파라미터 없이 page/size만 전달한다.
        LocalDate today = LocalDate.now();
        TransactionDateRange range = resolveDateRange(period, today, customFrom, customTo);
        CoreBankingTransactionQuery query = new CoreBankingTransactionQuery(
                accountId,
                range.from(),
                range.to(),
                flow,
                pageable.getPageNumber(),
                pageable.getPageSize()
        );
        CoreBankingTransactionsResponse response = coreBankingClient.findAccountTransactions(query);
        return BankingTransactionsResponse.of(period, flow, response);
    }

    // 고정 기간에서는 customFrom/customTo가 포함되면 잘못된 요청으로 처리한다.
    // CUSTOM 기간은 시작일과 종료일이 모두 있어야 하며, 시작일이 종료일보다 늦을 수 없다.
    private TransactionDateRange resolveDateRange(TransactionPeriod period, LocalDate today, LocalDate customFrom, LocalDate customTo) {
        if (period != TransactionPeriod.CUSTOM) {
            if (customFrom != null || customTo != null) {
                throw new CustomException(BAD_REQUEST);
            }
            return new TransactionDateRange(period.from(today), today);
        }
        if (customFrom == null || customTo == null || customFrom.isAfter(customTo)) {
            throw new CustomException(BAD_REQUEST);
        }
        return new TransactionDateRange(customFrom, customTo);
    }

    private String formatProcessingKey(String idempotencyKey) {
        return String.format(TRANSFER_PROCESSING_KEY, idempotencyKey);
    }

    private String formatResultKey(String idempotencyKey) {
        return String.format(TRANSFER_RESULT_KEY, idempotencyKey);
    }

    private String formatAccountProcessingKey(Long accountId) {
        return String.format(ACCOUNT_DEBIT_PROCESSING_KEY, accountId);
    }

    private String createExternalRequestId(String idempotencyKey) {
        return idempotencyKey;
    }

    private void transferWithRecovery(CoreBankingTransferRequest request) {
        if (attemptTransferOrRecover(request)) {
            return;
        }

        if (attemptTransferOrRecover(request)) {
            return;
        }

        throw new CustomException(BANKING_TRANSFER_FAILED);
    }

    private boolean attemptTransferOrRecover(CoreBankingTransferRequest request) {
        try {
            coreBankingClient.transfer(request);
            return true;
        } catch (CustomException exception) {
            if (!isCoreBankingCommunicationFailure(exception)) {
                throw exception;
            }
            return isTransferRequestExistsWithRetry(request.externalRequestId());
        }
    }

    private boolean isCoreBankingCommunicationFailure(CustomException exception) {
        return exception.getExceptionStatus() != null
                && BANKING_CORE_BANKING_COMMUNICATION_FAILED.getCode()
                .equals(exception.getExceptionStatus().getCode());
    }

    private boolean isTransferRequestExistsWithRetry(String externalRequestId) {
        if (coreBankingClient.existsTransferRequest(externalRequestId)) {
            return true;
        }
        waitBeforeRequestLookupRetry();
        return coreBankingClient.existsTransferRequest(externalRequestId);
    }

    private void waitBeforeRequestLookupRetry() {
        try {
            Thread.sleep(REQUEST_LOOKUP_RETRY_DELAY_MILLIS);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new CustomException(BANKING_REQUEST_LOOKUP_RETRY_INTERRUPTED);
        }
    }
}

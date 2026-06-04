package woorifisa.project.backend.domain.banking.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.backend.domain.banking.dto.request.AccountCreateRequest;
import woorifisa.project.backend.domain.banking.dto.request.AccountPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransactionDateRange;
import woorifisa.project.backend.domain.banking.dto.request.TransactionFlowFilter;
import woorifisa.project.backend.domain.banking.dto.request.TransactionPeriod;
import woorifisa.project.backend.domain.banking.dto.request.TransferPreviewRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferRequest;
import woorifisa.project.backend.domain.banking.dto.request.UpdateTransactionMemoRequest;
import woorifisa.project.backend.domain.banking.dto.response.AccountCreateResponse;
import woorifisa.project.backend.domain.banking.dto.response.AccountHomeResponse;
import woorifisa.project.backend.domain.banking.dto.response.BankingTransactionsResponse;
import woorifisa.project.backend.domain.banking.dto.response.TransferPreviewResponse;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.banking.repository.AccountRefRepository;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.corebanking.client.CoreBankingClient;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingCreateAccountRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingPasswordVerifyRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingRecipientLookupRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingTransactionQuery;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingTransferRequest;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingCreateAccountResponse;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingTransactionsResponse;
import woorifisa.project.backend.global.exception.CustomException;

import java.time.Duration;
import java.time.LocalDate;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BAD_REQUEST;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_ACCOUNT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_CERTIFICATE_REQUIRED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_CORE_BANKING_COMMUNICATION_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_RECIPIENT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_REQUEST_LOOKUP_RETRY_INTERRUPTED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_TRANSFER_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_TRANSFER_PROCESSING;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.USER_NOT_FOUND;

@Service
@Slf4j
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
    private final UserRepository userRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final CoreBankingClient coreBankingClient;

    @Transactional(readOnly = true)
    public AccountHomeResponse findHomeAccount(Long userId) {
        AccountRef accountRef = accountRefRepository.findFirstByUser_UserIdAndHasAccountTrueOrderByAccountRefIdAsc(userId)
                .orElseThrow(() -> new CustomException(BANKING_ACCOUNT_NOT_FOUND));

        return AccountHomeResponse.from(accountRef);
    }

    @Transactional
    public AccountCreateResponse createAccount(Long userId, AccountCreateRequest request) {
        log.info("[banking_account_create:requested] userId={}, accountType={}, accountName={}, hasForeignTax={}",
                userId, request.accountType(), request.accountName(), request.hasForeignTax());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(USER_NOT_FOUND));
        if (user.getCertificateStatus() != CertificateStatus.ISSUED) {
            log.warn("[banking_account_create:rejected_certificate_status] userId={}, certificateStatus={}",
                    userId, user.getCertificateStatus());
            throw new CustomException(BANKING_CERTIFICATE_REQUIRED);
        }

        CoreBankingCreateAccountResponse created = coreBankingClient.createAccount(
                CoreBankingCreateAccountRequest.of(user, request)
        );
        log.info("[banking_account_create:core_banking_completed] userId={}, accountId={}",
                userId, created.accountId());

        AccountRef accountRef = AccountRef.builder()
                .user(user)
                .customerId(created.customerId())
                .accountId(created.accountId())
                .hasAccount(true)
                .accountName(created.accountName())
                .accountNumber(created.accountNumber())
                .balance(0)
                .hasLimit(true)
                .transferLimit(created.transferLimit())
                .build();
        accountRefRepository.save(accountRef);
        log.info("[banking_account_create:completed] userId={}, accountId={}, maskedAccountNumber={}",
                userId, created.accountId(), maskAccountNumber(created.accountNumber()));

        return AccountCreateResponse.of(created.accountId(), "WOORI", created.accountNumber());
    }

    private String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() < 4) {
            return "****";
        }
        return accountNumber.substring(0, 4) + "********";
    }

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
            coreBankingClient.verifyAccountPassword(
                    CoreBankingPasswordVerifyRequest.of(accountRef.getAccountId(), request.accountPassword())
            );

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
                myAccount.getBalance(),
                myAccount.getTransferLimit(),
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

    public BankingTransactionsResponse findTransactions(
            Long userId,
            Long accountId,
            TransactionPeriod period,
            TransactionFlowFilter flow,
            LocalDate customFrom,
            LocalDate customTo,
            String keyword,
            Sort.Direction sortDirection,
            Pageable pageable
    ) {
        accountRefRepository.findByUser_UserIdAndAccountId(userId, accountId)
                .orElseThrow(() -> new CustomException(BANKING_ACCOUNT_NOT_FOUND));

        LocalDate today = LocalDate.now();
        TransactionDateRange range = resolveDateRange(period, today, customFrom, customTo);
        CoreBankingTransactionQuery query = new CoreBankingTransactionQuery(
                accountId,
                range.from(),
                range.to(),
                flow,
                normalizeKeyword(keyword),
                normalizeSortDirection(sortDirection),
                pageable.getPageNumber(),
                pageable.getPageSize()
        );
        CoreBankingTransactionsResponse response = coreBankingClient.findAccountTransactions(query);
        return BankingTransactionsResponse.of(period, flow, response);
    }

    @Transactional(readOnly = true)
    public void updateTransactionMemo(Long transactionId, UpdateTransactionMemoRequest request) {
        coreBankingClient.updateTransactionMemo(transactionId, request.normalized());
    }

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

    private Sort.Direction normalizeSortDirection(Sort.Direction sortDirection) {
        return sortDirection == null ? Sort.Direction.DESC : sortDirection;
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        return keyword.trim();
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

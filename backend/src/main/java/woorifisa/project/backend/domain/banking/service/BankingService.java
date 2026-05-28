package woorifisa.project.backend.domain.banking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingRecipientLookupRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingTransferRequest;
import woorifisa.project.backend.domain.banking.dto.request.AccountPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferPreviewRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferRequest;
import woorifisa.project.backend.domain.banking.dto.response.TransferPreviewResponse;
import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.banking.repository.BankingRepository;
import woorifisa.project.backend.global.exception.CustomException;

import java.time.Duration;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_ACCOUNT_NOT_FOUND;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_CORE_BANKING_COMMUNICATION_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_REQUEST_LOOKUP_RETRY_INTERRUPTED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_TRANSFER_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_TRANSFER_PROCESSING;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BANKING_RECIPIENT_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class BankingService {

    private static final String TRANSFER_PROCESSING_KEY = "banking:transfer:processing:%s";
    private static final String TRANSFER_RESULT_KEY = "banking:transfer:result:%s";
    private static final String TRANSFER_DONE_VALUE = "DONE";
    private static final Duration PROCESSING_TTL = Duration.ofMinutes(5);
    private static final Duration RESULT_TTL = Duration.ofMinutes(10);
    private static final long REQUEST_LOOKUP_RETRY_DELAY_MILLIS = 1000L;

    private final BankingRepository bankingRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final CoreBankingTransferClient coreBankingTransferClient;

    public void transfer(Long userId, String idempotencyKey, TransferRequest request) {
        // 프론트에서 전달받은 멱등키로 redis key 생성
        String resultKey = formatResultKey(idempotencyKey);
        String cachedResult = stringRedisTemplate.opsForValue().get(resultKey);
        if (cachedResult != null) {
            // 이미 있는 멱등키일 경우
            return;
        }

        // processingKey는 지금 누가 처리 중인지 락을 거는 역할 -> 진행 중 중복 차단
        String processingKey = formatProcessingKey(idempotencyKey);
        Boolean acquired = stringRedisTemplate.opsForValue().setIfAbsent(processingKey, "1", PROCESSING_TTL);
        // acquired(true) : processingKey가 없음 / acquired(false) : processingKey가 이미 있음
        if (!Boolean.TRUE.equals(acquired)) {
            // 이미 같은 키에 대해서 처리 중이므로 예외 처리
            throw new CustomException(BANKING_TRANSFER_PROCESSING);
        }

        try {
            AccountRef accountRef = bankingRepository.findByUser_UserIdAndAccountId(userId, request.withdrawAccountId())
                    .orElseThrow(() -> new CustomException(BANKING_ACCOUNT_NOT_FOUND));

            CoreBankingTransferRequest coreBankingTransferRequest = CoreBankingTransferRequest.of(
                    createExternalRequestId(idempotencyKey),
                    accountRef.getAccountId(),
                    request
            );

            // Core Banking 한테 계좌 이체 요청
            transferWithRecovery(coreBankingTransferRequest);
            stringRedisTemplate.opsForValue().set(resultKey, TRANSFER_DONE_VALUE, RESULT_TTL);
        } finally {
            stringRedisTemplate.delete(processingKey);
        }
    }

    public TransferPreviewResponse previewTransfer(Long userId, TransferPreviewRequest request) {
        AccountRef myAccount = bankingRepository.findFirstByUser_UserIdAndHasAccountTrueOrderByAccountRefIdAsc(userId)
                .orElseThrow(() -> new CustomException(BANKING_ACCOUNT_NOT_FOUND));

        String recipientName = coreBankingTransferClient.lookupRecipient(
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
        bankingRepository.findByUser_UserIdAndAccountId(userId, request.accountId())
                .orElseThrow(() -> new CustomException(BANKING_ACCOUNT_NOT_FOUND));

        coreBankingTransferClient.verifyAccountPassword(
                CoreBankingPasswordVerifyRequest.of(request.accountId(), request.accountPassword())
        );
    }

    // ProcessingKey 생성 메서드
    private String formatProcessingKey(String idempotencyKey) {
        return String.format(TRANSFER_PROCESSING_KEY, idempotencyKey);
    }

    // ResultKey 생성 메서드
    private String formatResultKey(String idempotencyKey) {
        return String.format(TRANSFER_RESULT_KEY, idempotencyKey);
    }

    // external_request_id 생성 메서드 (멱등키 그대로 사용)
    private String createExternalRequestId(String idempotencyKey) {
        return idempotencyKey;
    }

    // 코어 뱅킹에게 계좌 이체 요청 + 장애 허용(이체 처리 결과 조회 + 재시도)
    private void transferWithRecovery(CoreBankingTransferRequest request) {
        // 1차 시도 (성공/복구되면 종료)
        if (attemptTransferOrRecover(request)) {
            return;
        }

        // 2차 시도 (성공/복구되면 종료)
        if (attemptTransferOrRecover(request)) {
            return;
        }

        // 정상 실패가 아닌 비정상 실패가 2차 통신까지 전부 실패한다면 계좌 이체 실패 처리
        throw new CustomException(BANKING_TRANSFER_FAILED);
    }

    // 재시도 로직
    private boolean attemptTransferOrRecover(CoreBankingTransferRequest request) {
        try {
            coreBankingTransferClient.transfer(request);
            return true;
        } catch (CustomException exception) {
            if (!isCoreBankingCommunicationFailure(exception)) {
                // 코어 뱅킹과의 통신 장애가 아니라면 -> 실패 응답은 그대로 프론트에게 응답
                throw exception;
            }
            // 통신 장애면 external_request_id 조회로 처리 완료 여부를 확인한다.
            return isTransferRequestExistsWithRetry(request.externalRequestId());
        }
    }

    // 계좌 이체 시 발생하는 에러가 네트워크(통신) 에러인지 확인하는 메서드
    private boolean isCoreBankingCommunicationFailure(CustomException exception) {
        return exception.getExceptionStatus() != null
                && BANKING_CORE_BANKING_COMMUNICATION_FAILED.getCode()
                .equals(exception.getExceptionStatus().getCode());
    }

    // 이체 처리 결과 확인 API 요청
    private boolean isTransferRequestExistsWithRetry(String externalRequestId) {
        if (coreBankingTransferClient.existsTransferRequest(externalRequestId)) {
            return true;
        }
        waitBeforeRequestLookupRetry();
        return coreBankingTransferClient.existsTransferRequest(externalRequestId);
    }

    // 이체 처리 결과 재확인 하기 위해 몇 초 대기
    private void waitBeforeRequestLookupRetry() {
        try {
            Thread.sleep(REQUEST_LOOKUP_RETRY_DELAY_MILLIS);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new CustomException(BANKING_REQUEST_LOOKUP_RETRY_INTERRUPTED);
        }
    }
}

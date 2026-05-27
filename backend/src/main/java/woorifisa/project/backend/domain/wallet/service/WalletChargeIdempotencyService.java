package woorifisa.project.backend.domain.wallet.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import woorifisa.project.backend.domain.wallet.dto.WalletChargeIdempotencyResult;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletChargeIdempotencyService {

    private static final Duration TTL = Duration.ofMinutes(10);
    private static final String PREFIX = "wallet:charge:idempotency:";
    private static final String PROCESSING = "PROCESSING";
    private static final String COMPLETED = "COMPLETED";
    private static final String DELIMITER = "\\|";
    private static final String VALUE_DELIMITER = "|";
    private static final int STATUS_INDEX = 0;
    private static final int REQUEST_ID_INDEX = 1;
    private static final int ACCOUNT_ID_INDEX = 2;
    private static final int AMOUNT_INDEX = 3;
    private static final int COMPLETED_PART_COUNT = 4;

    private final StringRedisTemplate redisTemplate;

    public WalletChargeIdempotencyResult startOrGet(
            Long userId,
            String idempotencyKey,
            String walletChargeRequestId,
            Long withdrawAccountId,
            Integer chargeAmount
    ) {
        String key = createRedisKey(userId, idempotencyKey);

        // Redis에 키가 없을 때만 PROCESSING을 저장해 최초 요청만 처리권을 얻는다.
        if (tryStartProcessing(key, walletChargeRequestId, withdrawAccountId, chargeAmount)) {
            return WalletChargeIdempotencyResult.started(walletChargeRequestId);
        }

        // 이미 키가 있으면 기존 요청의 PROCESSING/COMPLETED 상태를 해석한다.
        return getExistingResult(key);
    }

    public void complete(Long userId, String idempotencyKey, String walletChargeRequestId, Long withdrawAccountId, Integer chargeAmount) {
        // 지갑 반영까지 끝난 요청은 COMPLETED로 저장해 같은 재요청을 성공 응답으로 복구한다.
        redisTemplate.opsForValue()
                .set(
                        createRedisKey(userId, idempotencyKey),
                        createCompletedValue(walletChargeRequestId, withdrawAccountId, chargeAmount),
                        TTL
                );
    }

    public void fail(Long userId, String idempotencyKey) {
        // 본처리 실패 시 PROCESSING 키를 지워 사용자가 같은 요청을 다시 시도할 수 있게 한다.
        redisTemplate.delete(createRedisKey(userId, idempotencyKey));
    }

    private boolean tryStartProcessing(
            String key,
            String walletChargeRequestId,
            Long withdrawAccountId,
            Integer chargeAmount
    ) {
        Boolean saved = redisTemplate.opsForValue()
                .setIfAbsent(key, createProcessingValue(walletChargeRequestId, withdrawAccountId, chargeAmount), TTL);
        return Boolean.TRUE.equals(saved);
    }

    private WalletChargeIdempotencyResult getExistingResult(String key) {
        return parse(redisTemplate.opsForValue().get(key));
    }

    private String createRedisKey(Long userId, String idempotencyKey) {
        return PREFIX + userId + ":" + idempotencyKey;
    }

    private String createProcessingValue(String walletChargeRequestId, Long withdrawAccountId, Integer chargeAmount) {
        return PROCESSING + VALUE_DELIMITER + walletChargeRequestId + VALUE_DELIMITER + withdrawAccountId + VALUE_DELIMITER + chargeAmount;
    }

    private String createCompletedValue(String walletChargeRequestId, Long withdrawAccountId, Integer chargeAmount) {
        return COMPLETED + VALUE_DELIMITER + walletChargeRequestId + VALUE_DELIMITER + withdrawAccountId + VALUE_DELIMITER + chargeAmount;
    }

    private WalletChargeIdempotencyResult parse(String value) {
        if (value == null || value.isBlank()) {
            // 상태를 확정할 수 없으면 재처리보다 중복 차단을 우선한다.
            return WalletChargeIdempotencyResult.processing(null);
        }

        String[] parts = value.split(DELIMITER, -1);
        if (parts.length < 2) {
            // 깨진 값도 완료로 신뢰할 수 없으므로 처리 중으로 본다.
            return WalletChargeIdempotencyResult.processing(null);
        }

        String status = parts[STATUS_INDEX];
        String walletChargeRequestId = parts[REQUEST_ID_INDEX];

        if (PROCESSING.equals(status)) {
            return WalletChargeIdempotencyResult.processing(walletChargeRequestId);
        }
        if (COMPLETED.equals(status)) {
            return parseCompletedResult(value, parts);
        }

        return WalletChargeIdempotencyResult.processing(walletChargeRequestId);
    }

    private WalletChargeIdempotencyResult parseCompletedResult(String value, String[] parts) {
        String walletChargeRequestId = parts[REQUEST_ID_INDEX];

        if (parts.length != COMPLETED_PART_COUNT) {
            // 완료 값의 계좌/금액을 비교할 수 없으면 재처리를 막는다.
            log.warn("Wallet charge idempotency completed value has invalid format. value={}", value);
            return WalletChargeIdempotencyResult.processing(walletChargeRequestId);
        }

        try {
            return WalletChargeIdempotencyResult.completed(
                    walletChargeRequestId,
                    Long.valueOf(parts[ACCOUNT_ID_INDEX]),
                    Integer.valueOf(parts[AMOUNT_INDEX])
            );
        } catch (NumberFormatException exception) {
            log.warn("Failed to parse wallet charge idempotency completed value. value={}", value, exception);
            return WalletChargeIdempotencyResult.processing(walletChargeRequestId);
        }
    }
}

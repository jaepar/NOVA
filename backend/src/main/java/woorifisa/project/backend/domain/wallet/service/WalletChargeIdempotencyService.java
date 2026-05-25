package woorifisa.project.backend.domain.wallet.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

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

    private final StringRedisTemplate redisTemplate;

    public WalletChargeIdempotencyResult startOrGet(
            Long userId,
            String idempotencyKey,
            String walletChargeRequestId,
            Long withdrawAccountId,
            Integer chargeAmount
    ) {
        String key = key(userId, idempotencyKey);

        // Redis set-if-absent로 최초 요청만 처리권을 얻고 나머지는 기존 상태를 확인한다.
        Boolean saved = redisTemplate.opsForValue()
                .setIfAbsent(key, processingValue(walletChargeRequestId, withdrawAccountId, chargeAmount), TTL);
        if (Boolean.TRUE.equals(saved)) {
            return WalletChargeIdempotencyResult.started(walletChargeRequestId);
        }

        return parse(redisTemplate.opsForValue().get(key));
    }

    public void complete(Long userId, String idempotencyKey, String walletChargeRequestId, Long withdrawAccountId, Integer chargeAmount) {
        // 월렛 반영까지 끝난 요청은 완료 상태로 바꿔 동일 재요청을 재처리하지 않는다.
        redisTemplate.opsForValue()
                .set(key(userId, idempotencyKey), completedValue(walletChargeRequestId, withdrawAccountId, chargeAmount), TTL);
    }

    public void fail(Long userId, String idempotencyKey) {
        redisTemplate.delete(key(userId, idempotencyKey));
    }

    private String key(Long userId, String idempotencyKey) {
        return PREFIX + userId + ":" + idempotencyKey;
    }

    private String processingValue(String walletChargeRequestId, Long withdrawAccountId, Integer chargeAmount) {
        return PROCESSING + VALUE_DELIMITER + walletChargeRequestId + VALUE_DELIMITER + withdrawAccountId + VALUE_DELIMITER + chargeAmount;
    }

    private String completedValue(String walletChargeRequestId, Long withdrawAccountId, Integer chargeAmount) {
        return COMPLETED + VALUE_DELIMITER + walletChargeRequestId + VALUE_DELIMITER + withdrawAccountId + VALUE_DELIMITER + chargeAmount;
    }

    private WalletChargeIdempotencyResult parse(String value) {
        if (value == null || value.isBlank()) {
            return WalletChargeIdempotencyResult.processing(null);
        }

        String[] parts = value.split(DELIMITER, -1);
        if (parts.length < 2) {
            return WalletChargeIdempotencyResult.processing(null);
        }

        if (PROCESSING.equals(parts[0])) {
            return WalletChargeIdempotencyResult.processing(parts[1]);
        }

        if (COMPLETED.equals(parts[0]) && parts.length == 4) {
            try {
                return WalletChargeIdempotencyResult.completed(parts[1], Long.valueOf(parts[2]), Integer.valueOf(parts[3]));
            } catch (NumberFormatException exception) {
                log.warn("월렛 충전 멱등 Redis 값 파싱에 실패했습니다. value={}", value, exception);
                return WalletChargeIdempotencyResult.processing(parts[1]);
            }
        }

        if (COMPLETED.equals(parts[0])) {
            log.warn("월렛 충전 멱등 Redis 완료 값 형식이 올바르지 않습니다. value={}", value);
        }
        return WalletChargeIdempotencyResult.processing(parts[1]);
    }
}

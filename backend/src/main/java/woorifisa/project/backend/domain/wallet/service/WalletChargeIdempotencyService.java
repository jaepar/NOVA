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

    private final StringRedisTemplate redisTemplate;

    // 처음 요청이면 PROCESSING 저장
    // 이미 요청이 있으면 기존 상태 조회
    public WalletChargeIdempotencyResult startOrGet(
            Long userId,
            String idempotencyKey,
            String walletChargeRequestId,
            Long withdrawAccountId,
            Integer chargeAmount
    ) {
        String key = createRedisKey(userId, idempotencyKey);

        // Redis set-if-absent로 최초 요청만 처리권을 얻고 나머지는 기존 상태를 확인한다.
        Boolean saved = redisTemplate.opsForValue()
                // 키가 없으면 저장성공
                // 키가 이미 있으면 저장실패
                .setIfAbsent(key, createProcessingValue(walletChargeRequestId, withdrawAccountId, chargeAmount), TTL);
        if (Boolean.TRUE.equals(saved)) {
            return WalletChargeIdempotencyResult.started(walletChargeRequestId);
        }

        // 같은 키가 있으면 기존 REDIS 값 읽어서 PROCESSING인지 COMPLETED인지 판단
        return parse(redisTemplate.opsForValue().get(key));
    }

    public void complete(Long userId, String idempotencyKey, String walletChargeRequestId, Long withdrawAccountId, Integer chargeAmount) {
        // 월렛 반영까지 끝난 요청은 완료 상태로 바꿔 동일 재요청을 재처리하지 않는다.
        redisTemplate.opsForValue()
                .set(createRedisKey(userId, idempotencyKey), createCompletedValue(walletChargeRequestId, withdrawAccountId, chargeAmount), TTL);
    }

    public void fail(Long userId, String idempotencyKey) {
        redisTemplate.delete(createRedisKey(userId, idempotencyKey));
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

    // Redis에 저장된 값을 읽어서 WalletChargeIdempotencyResult 객체로 변환하는 메서드
    private WalletChargeIdempotencyResult parse(String value) {
        // 레디스 값이 없거나 깨질 때
        if (value == null || value.isBlank()) {
            // setIfAbsent 실패 직후 TTL 만료 등으로 값이 사라진 경우, 재처리보다 처리 중으로 보아 중복 충전을 막는다.
            return WalletChargeIdempotencyResult.processing(null);
        }

        String[] parts = value.split(DELIMITER, -1);
        if (parts.length < 2) {
            // Redis 값이 상태 구분자 없이 깨진 경우에도 요청 상태를 확정할 수 없어 처리 중으로 응답한다.
            return WalletChargeIdempotencyResult.processing(null);
        }

        if (PROCESSING.equals(parts[0])) {
            // 이미 같은 멱등 키 요청이 진행 중이면 기존 요청 식별자를 유지해 처리 중으로 반환한다.
            return WalletChargeIdempotencyResult.processing(parts[1]);
        }

        if (COMPLETED.equals(parts[0]) && parts.length == 4) {
            try {
                return WalletChargeIdempotencyResult.completed(parts[1], Long.valueOf(parts[2]), Integer.valueOf(parts[3]));
            } catch (NumberFormatException exception) {
                // 완료 값의 accountId/amount가 숫자로 복원되지 않으면 완료 여부를 신뢰할 수 없어 재처리를 막는다.
                log.warn("월렛 충전 Redis 값 파싱에 실패했습니다. value={}", value, exception);
                return WalletChargeIdempotencyResult.processing(parts[1]);
            }
        }

        // 앞의 조건 통과 못할 시
        if (COMPLETED.equals(parts[0])) {
            // 완료 상태지만 필드 수가 맞지 않으면 기존 완료 요청과 현재 요청을 비교할 수 없어 처리 중으로 응답한다.
            log.warn("월렛 충전 멱등 Redis 완료 값 형식이 올바르지 않습니다. value={}", value);
        }
        // 알 수 없는 상태 값은 재처리보다 보수적으로 처리 중으로 본다.
        return WalletChargeIdempotencyResult.processing(parts[1]);
    }
}

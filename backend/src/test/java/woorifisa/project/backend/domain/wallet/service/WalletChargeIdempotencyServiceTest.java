package woorifisa.project.backend.domain.wallet.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class WalletChargeIdempotencyServiceTest {

    private final StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);

    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> valueOperations = mock(ValueOperations.class);

    private final WalletChargeIdempotencyService walletChargeIdempotencyService = new WalletChargeIdempotencyService(redisTemplate);

    @Test
    @DisplayName("새 멱등 키면 사용자별 처리 중 상태를 저장하고 시작 결과를 반환한다")
    void started() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(
                eq("wallet:charge:idempotency:1:idempotency-key"),
                eq("PROCESSING|WCR-20260525-0001|2001|10000"),
                any(Duration.class)
        )).thenReturn(true);

        WalletChargeIdempotencyResult result = walletChargeIdempotencyService.startOrGet(
                1L,
                "idempotency-key",
                "WCR-20260525-0001",
                2001L,
                10000
        );

        assertThat(result.status()).isEqualTo(WalletChargeIdempotencyResult.Status.STARTED);
        assertThat(result.walletChargeRequestId()).isEqualTo("WCR-20260525-0001");
    }

    @Test
    @DisplayName("처리 중인 멱등 키면 처리 중 결과를 반환한다")
    void processing() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(
                eq("wallet:charge:idempotency:1:idempotency-key"),
                eq("PROCESSING|WCR-20260525-0002|2001|10000"),
                any(Duration.class)
        )).thenReturn(false);
        when(valueOperations.get("wallet:charge:idempotency:1:idempotency-key"))
                .thenReturn("PROCESSING|WCR-20260525-0001|2001|10000");

        WalletChargeIdempotencyResult result = walletChargeIdempotencyService.startOrGet(
                1L,
                "idempotency-key",
                "WCR-20260525-0002",
                2001L,
                10000
        );

        assertThat(result.isProcessing()).isTrue();
        assertThat(result.walletChargeRequestId()).isEqualTo("WCR-20260525-0001");
    }

    @Test
    @DisplayName("완료된 멱등 키면 완료된 요청 정보를 반환한다")
    void completed() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(
                eq("wallet:charge:idempotency:1:idempotency-key"),
                eq("PROCESSING|WCR-20260525-0002|2001|10000"),
                any(Duration.class)
        )).thenReturn(false);
        when(valueOperations.get("wallet:charge:idempotency:1:idempotency-key"))
                .thenReturn("COMPLETED|WCR-20260525-0001|2001|10000");

        WalletChargeIdempotencyResult result = walletChargeIdempotencyService.startOrGet(
                1L,
                "idempotency-key",
                "WCR-20260525-0002",
                2001L,
                10000
        );

        assertThat(result.isCompleted()).isTrue();
        assertThat(result.walletChargeRequestId()).isEqualTo("WCR-20260525-0001");
        assertThat(result.matches(2001L, 10000)).isTrue();
    }

    @Test
    @DisplayName("완료된 멱등 값 파싱에 실패하면 처리 중 결과를 반환한다")
    void parseFailed() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(
                eq("wallet:charge:idempotency:1:idempotency-key"),
                eq("PROCESSING|WCR-20260525-0002|2001|10000"),
                any(Duration.class)
        )).thenReturn(false);
        when(valueOperations.get("wallet:charge:idempotency:1:idempotency-key"))
                .thenReturn("COMPLETED|WCR-20260525-0001|abc|10000");

        WalletChargeIdempotencyResult result = walletChargeIdempotencyService.startOrGet(
                1L,
                "idempotency-key",
                "WCR-20260525-0002",
                2001L,
                10000
        );

        assertThat(result.isProcessing()).isTrue();
        assertThat(result.walletChargeRequestId()).isEqualTo("WCR-20260525-0001");
    }

    @Test
    @DisplayName("충전 성공 시 사용자별 멱등 키를 완료 상태로 저장한다")
    void complete() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        walletChargeIdempotencyService.complete(1L, "idempotency-key", "WCR-20260525-0001", 2001L, 10000);

        verify(valueOperations).set(
                eq("wallet:charge:idempotency:1:idempotency-key"),
                eq("COMPLETED|WCR-20260525-0001|2001|10000"),
                any(Duration.class)
        );
    }

    @Test
    @DisplayName("충전 실패 시 사용자별 멱등 키를 삭제한다")
    void fail() {
        walletChargeIdempotencyService.fail(1L, "idempotency-key");

        verify(redisTemplate).delete("wallet:charge:idempotency:1:idempotency-key");
    }
}

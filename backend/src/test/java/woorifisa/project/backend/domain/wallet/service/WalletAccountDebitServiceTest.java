package woorifisa.project.backend.domain.wallet.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import woorifisa.project.backend.domain.wallet.client.CoreBankingWalletClient;
import woorifisa.project.backend.domain.wallet.dto.response.WalletDebitLookupData;
import woorifisa.project.backend.domain.wallet.dto.response.WalletDebitLookupResponse;
import woorifisa.project.backend.domain.wallet.dto.response.WalletDebitResponse;
import woorifisa.project.backend.global.exception.CustomException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_FAILED;

class WalletAccountDebitServiceTest {

    private final CoreBankingWalletClient coreBankingWalletClient = mock(CoreBankingWalletClient.class);
    private final WalletAccountDebitService walletAccountDebitService = new WalletAccountDebitService(coreBankingWalletClient);

    @Test
    @DisplayName("CoreBanking 계좌 차감 성공 응답이면 예외 없이 완료한다")
    void success() {
        when(coreBankingWalletClient.debitWalletAccount(any()))
                .thenReturn(new WalletDebitResponse(true, "20000", "OK"));

        walletAccountDebitService.debit(
                "WCR-20260525-0001",
                1001L,
                2001L,
                10000
        );

        verify(coreBankingWalletClient, never()).findWalletDebitResult(any());
    }

    @Test
    @DisplayName("CoreBanking 계좌 차감 실패 응답이면 예외를 던진다")
    void fail() {
        when(coreBankingWalletClient.debitWalletAccount(any()))
                .thenReturn(new WalletDebitResponse(false, "40000", "FAIL"));

        assertThatThrownBy(() -> walletAccountDebitService.debit(
                "WCR-20260525-0001",
                1001L,
                2001L,
                10000
        )).isInstanceOfSatisfying(CustomException.class,
                exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_DEBIT_FAILED));

        verify(coreBankingWalletClient, never()).findWalletDebitResult(any());
    }

    @Test
    @DisplayName("timeout 후 조회로 차감 성공을 확인하면 예외 없이 완료한다")
    void timeoutRecovered() {
        when(coreBankingWalletClient.debitWalletAccount(any()))
                .thenThrow(new ResourceAccessException("timeout"));
        when(coreBankingWalletClient.findWalletDebitResult("WCR-20260525-0001"))
                .thenReturn(new WalletDebitLookupResponse(
                        true,
                        "20000",
                        "OK",
                        new WalletDebitLookupData("WCR-20260525-0001")
                ));

        walletAccountDebitService.debit(
                "WCR-20260525-0001",
                1001L,
                2001L,
                10000
        );

        verify(coreBankingWalletClient).findWalletDebitResult("WCR-20260525-0001");
    }

    @Test
    @DisplayName("명확한 CoreBanking 호출 실패는 조회 복구 없이 예외로 변환한다")
    void responseException() {
        when(coreBankingWalletClient.debitWalletAccount(any()))
                .thenThrow(new RestClientException("bad request"));

        assertThatThrownBy(() -> walletAccountDebitService.debit(
                "WCR-20260525-0001",
                1001L,
                2001L,
                10000
        )).isInstanceOfSatisfying(CustomException.class,
                exception -> assertThat(exception.getExceptionStatus()).isEqualTo(WALLET_DEBIT_FAILED));

        verify(coreBankingWalletClient, never()).findWalletDebitResult(any());
    }
}

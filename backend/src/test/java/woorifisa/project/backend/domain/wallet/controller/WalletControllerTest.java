package woorifisa.project.backend.domain.wallet.controller;

import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import woorifisa.project.backend.domain.wallet.dto.request.ChargeWalletRequest;
import woorifisa.project.backend.domain.wallet.service.WalletService;
import woorifisa.project.backend.global.exception.CustomException;
import woorifisa.project.backend.global.response.BaseResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.SUCCESS;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.UNAUTHORIZED;

class WalletControllerTest {

    @Test
    @DisplayName("월렛 충전 요청을 서비스로 전달하고 공통 성공 응답을 반환한다")
    void success() {
        WalletService walletService = mock(WalletService.class);
        WalletController walletController = new WalletController(walletService);
        HttpSession session = mock(HttpSession.class);
        ChargeWalletRequest request = new ChargeWalletRequest(2001L, 10000);
        when(session.getAttribute("userId")).thenReturn(1L);

        BaseResponse<Void> response = walletController.chargeWallet(session, "idempotency-key", request);

        verify(walletService).chargeWallet(1L, "idempotency-key", request);
        assertThat(response.getSuccess()).isTrue();
        assertThat(response.getCode()).isEqualTo("20000");
        assertThat(response.getMessage()).isEqualTo(SUCCESS.getMessage());
    }

    @Test
    @DisplayName("세션에 사용자 ID가 없으면 예외를 던진다")
    void unauthorized() {
        WalletService walletService = mock(WalletService.class);
        WalletController walletController = new WalletController(walletService);
        HttpSession session = mock(HttpSession.class);
        ChargeWalletRequest request = new ChargeWalletRequest(2001L, 10000);

        assertThatThrownBy(() -> walletController.chargeWallet(session, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(UNAUTHORIZED));

        verify(walletService, never()).chargeWallet(1L, "idempotency-key", request);
    }
}

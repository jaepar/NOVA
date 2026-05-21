package woorifisa.project.backend.domain.wallet.controller;

import jakarta.servlet.http.HttpSession;
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
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BAD_REQUEST;

class WalletControllerTest {

    @Test
    void chargeWalletDelegatesToServiceAndReturnsSuccessMessage() {
        WalletService walletService = mock(WalletService.class);
        WalletController walletController = new WalletController(walletService);
        HttpSession session = mock(HttpSession.class);
        ChargeWalletRequest request = new ChargeWalletRequest(2001L, 10000L);
        when(session.getAttribute("userId")).thenReturn(1L);

        BaseResponse<Void> response = walletController.chargeWallet(session, "idempotency-key", request);

        verify(walletService).chargeWallet(1L, "idempotency-key", request);
        assertThat(response.getSuccess()).isTrue();
        assertThat(response.getCode()).isEqualTo(20000);
        assertThat(response.getMessage()).isEqualTo("월렛 충전이 완료되었습니다.");
    }

    @Test
    void chargeWalletRejectsRequestWhenSessionHasNoUserId() {
        WalletService walletService = mock(WalletService.class);
        WalletController walletController = new WalletController(walletService);
        HttpSession session = mock(HttpSession.class);
        ChargeWalletRequest request = new ChargeWalletRequest(2001L, 10000L);

        assertThatThrownBy(() -> walletController.chargeWallet(session, "idempotency-key", request))
                .isInstanceOfSatisfying(CustomException.class,
                        exception -> assertThat(exception.getExceptionStatus()).isEqualTo(BAD_REQUEST));

        verify(walletService, never()).chargeWallet(1L, "idempotency-key", request);
    }
}

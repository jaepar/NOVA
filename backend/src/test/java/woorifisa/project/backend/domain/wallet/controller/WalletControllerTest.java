package woorifisa.project.backend.domain.wallet.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import woorifisa.project.backend.domain.wallet.dto.response.WalletNextStep;
import woorifisa.project.backend.domain.wallet.dto.request.ChargeWalletRequest;
import woorifisa.project.backend.domain.wallet.dto.response.WalletStatusResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionItem;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionsResponse;
import woorifisa.project.backend.domain.wallet.service.WalletService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.SUCCESS;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class WalletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private WalletService walletService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @DisplayName("세션 사용자 기준 월렛 잔액과 거래내역을 조회한다")
    void found() {
        WalletService walletService = mock(WalletService.class);
        WalletController walletController = new WalletController(walletService);
        SessionUserPrincipal principal = new SessionUserPrincipal(1L);
        WalletTransactionsResponse serviceResponse = new WalletTransactionsResponse(12500, List.of());
        when(walletService.findWalletTransactions(1L)).thenReturn(serviceResponse);

        BaseResponse<WalletTransactionsResponse> response = walletController.findWalletTransactions(principal);

        verify(walletService).findWalletTransactions(1L);
        assertThat(response.getSuccess()).isTrue();
        assertThat(response.getCode()).isEqualTo("20000");
        assertThat(response.getMessage()).isEqualTo(SUCCESS.getMessage());
        assertThat(response.getData()).isEqualTo(serviceResponse);
    }

    @Test
    @DisplayName("월렛 충전 요청을 서비스로 전달하고 공통 성공 응답을 반환한다")
    void success() {
        WalletService walletService = mock(WalletService.class);
        WalletController walletController = new WalletController(walletService);
        SessionUserPrincipal principal = new SessionUserPrincipal(1L);
        ChargeWalletRequest request = new ChargeWalletRequest(10000);

        BaseResponse<Void> response = walletController.chargeWallet(principal, "idempotency-key", request);

        verify(walletService).chargeWallet(1L, "idempotency-key", request);
        assertThat(response.getSuccess()).isTrue();
        assertThat(response.getCode()).isEqualTo("20000");
        assertThat(response.getMessage()).isEqualTo(SUCCESS.getMessage());
    }

    @Test
    @DisplayName("세션 사용자 기준 월렛 상태를 조회한다")
    void walletStatus() {
        WalletService walletService = mock(WalletService.class);
        WalletController walletController = new WalletController(walletService);
        SessionUserPrincipal principal = new SessionUserPrincipal(1L);
        WalletStatusResponse serviceResponse = new WalletStatusResponse(WalletNextStep.WALLET_TERMS);
        when(walletService.findWalletStatus(1L)).thenReturn(serviceResponse);

        BaseResponse<WalletStatusResponse> response = walletController.findWalletStatus(principal);

        verify(walletService).findWalletStatus(1L);
        assertThat(response.getSuccess()).isTrue();
        assertThat(response.getCode()).isEqualTo("20000");
        assertThat(response.getMessage()).isEqualTo(SUCCESS.getMessage());
        assertThat(response.getData()).isEqualTo(serviceResponse);
    }

    @Test
    @DisplayName("세션 사용자 기준 월렛 생성 요청을 처리한다")
    void createWallet() throws Exception {
        Long userId = 1L;
        UsernamePasswordAuthenticationToken authToken = authToken(userId);

        mockMvc.perform(post("/wallet")
                        .with(authentication(authToken))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "termsAgreed": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value(20000));

        verify(walletService).createWallet(any(), any());
    }

    private UsernamePasswordAuthenticationToken authToken(Long userId) {
        return new UsernamePasswordAuthenticationToken(
                new SessionUserPrincipal(userId),
                null,
                AuthorityUtils.NO_AUTHORITIES
        );
    }
}

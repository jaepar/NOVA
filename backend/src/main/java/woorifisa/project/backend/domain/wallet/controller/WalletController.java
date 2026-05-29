package woorifisa.project.backend.domain.wallet.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.backend.domain.wallet.dto.response.WalletStatusResponse;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionsResponse;
import woorifisa.project.backend.domain.wallet.service.WalletService;
import woorifisa.project.backend.domain.wallet.service.WalletStatusService;
import woorifisa.project.backend.domain.wallet.dto.request.ChargeWalletRequest;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionsResponse;
import woorifisa.project.backend.domain.wallet.service.WalletService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/wallet")
public class WalletController {

    private final WalletService walletService;
    private final WalletStatusService walletStatusService;

    @GetMapping("/transactions")
    public BaseResponse<WalletTransactionsResponse> findWalletTransactions(
            @AuthenticationPrincipal SessionUserPrincipal principal
    ) {
        return BaseResponse.ok(walletService.findWalletTransactions(principal.userId()));
    }

    @GetMapping("/status")
    public BaseResponse<WalletStatusResponse> findWalletStatus(
            @AuthenticationPrincipal SessionUserPrincipal principal
    ) {
        return BaseResponse.ok(walletStatusService.findWalletStatus(principal.userId()));
    }
  
    @PostMapping("/charges")
    public BaseResponse<Void> chargeWallet(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody ChargeWalletRequest request
    ) {
        walletService.chargeWallet(principal.userId(), idempotencyKey, request);
        return BaseResponse.ok(null);
    }
}

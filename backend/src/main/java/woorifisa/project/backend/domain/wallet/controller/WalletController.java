package woorifisa.project.backend.domain.wallet.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.backend.domain.wallet.dto.request.WalletCreateRequest;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionsResponse;
import woorifisa.project.backend.domain.wallet.service.WalletService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/wallet")
public class WalletController {

    private final WalletService walletService;

    @PostMapping
    public BaseResponse<Void> createWallet(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @Valid @RequestBody WalletCreateRequest request
    ) {
        walletService.createWallet(principal.userId(), request);
        return BaseResponse.ok(null);
    }

    @GetMapping("/transactions")
    public BaseResponse<WalletTransactionsResponse> findWalletTransactions(
            @AuthenticationPrincipal SessionUserPrincipal principal
    ) {
        return BaseResponse.ok(walletService.findWalletTransactions(principal.userId()));
    }
}

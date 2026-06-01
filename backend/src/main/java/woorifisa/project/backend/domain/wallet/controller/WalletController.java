package woorifisa.project.backend.domain.wallet.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.backend.domain.wallet.dto.response.WalletStatusResponse;
import woorifisa.project.backend.domain.wallet.dto.request.WalletCreateRequest;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionsResponse;
import woorifisa.project.backend.domain.wallet.service.WalletService;
import woorifisa.project.backend.domain.wallet.dto.request.ChargeWalletRequest;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/wallet")
public class WalletController {

    private final WalletService walletService;

    // 월렛 생성
    @PostMapping
    public BaseResponse<Void> createWallet(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @Valid @RequestBody WalletCreateRequest request
    ) {
        walletService.createWallet(principal.userId(), request);
        return BaseResponse.ok(null);
    }

    // 월렛 거래내역 조회
    @GetMapping("/transactions")
    public BaseResponse<WalletTransactionsResponse> findWalletTransactions(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return BaseResponse.ok(walletService.findWalletTransactions(principal.userId(), pageable));
    }

    // 월렛 충전
    @PostMapping("/charges")
    public BaseResponse<Void> chargeWallet(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody ChargeWalletRequest request
    ) {
        walletService.chargeWallet(principal.userId(), idempotencyKey, request);
        return BaseResponse.ok(null);
    }

    // 월렛 상태 조회
    @GetMapping("/status")
    public BaseResponse<WalletStatusResponse> findWalletStatus(
            @AuthenticationPrincipal SessionUserPrincipal principal
    ) {
        return BaseResponse.ok(walletService.findWalletStatus(principal.userId()));
    }
}

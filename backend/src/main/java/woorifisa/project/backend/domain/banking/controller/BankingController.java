package woorifisa.project.backend.domain.banking.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import woorifisa.project.backend.domain.banking.dto.request.AccountCreateRequest;
import woorifisa.project.backend.domain.banking.dto.request.AccountPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferPreviewRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferRequest;
import woorifisa.project.backend.domain.banking.dto.request.UpdateTransactionMemoRequest;
import woorifisa.project.backend.domain.banking.dto.response.AccountHomeResponse;
import woorifisa.project.backend.domain.banking.dto.response.TransferPreviewResponse;
import woorifisa.project.backend.domain.banking.service.BankingService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/banking")
public class BankingController {

    private final BankingService bankingService;

    // 홈 계좌 정보 조회
    @GetMapping("/home")
    public BaseResponse<AccountHomeResponse> findHomeAccount(
            @AuthenticationPrincipal SessionUserPrincipal principal
    ) {
        return BaseResponse.ok(bankingService.findHomeAccount(principal.userId()));
    }

    // 계좌 개설
    @PostMapping
    public BaseResponse<Void> createAccount(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @Valid @RequestBody AccountCreateRequest request
    ) {
        bankingService.createAccount(principal.userId(), request);
        return BaseResponse.ok(null);
    }

    // 계좌 이체
    @PostMapping("/transfers")
    public BaseResponse<Void> transfer(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody TransferRequest request
    ) {
        bankingService.transfer(principal.userId(), idempotencyKey, request);
        return BaseResponse.ok(null);
    }

    // 이체 사전 조회(사용자 계좌 + 수취인)
    @PostMapping("/transfers/preview")
    public BaseResponse<TransferPreviewResponse> previewTransfer(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @Valid @RequestBody TransferPreviewRequest request
    ) {
        return BaseResponse.ok(bankingService.previewTransfer(principal.userId(), request));
    }

    // 계좌 비밀번호 검증
    @PostMapping("/password/verify")
    public BaseResponse<Void> verifyAccountPassword(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @Valid @RequestBody AccountPasswordVerifyRequest request
    ) {
        bankingService.verifyAccountPassword(principal.userId(), request);
        return BaseResponse.ok(null);
    }

    // 거래내역 메모 수정
    @PatchMapping("/transactions/{transactionId}/memo")
    public BaseResponse<Void> updateTransactionMemo(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @PathVariable Long transactionId,
            @Valid @RequestBody UpdateTransactionMemoRequest request
    ) {
        bankingService.updateTransactionMemo(transactionId, request);
        return BaseResponse.ok(null);
    }
}

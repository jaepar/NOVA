package woorifisa.project.backend.domain.banking.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import woorifisa.project.backend.domain.banking.dto.request.AccountPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.request.CreateGlobalTransactionRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferPreviewRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferRequest;
import woorifisa.project.backend.domain.banking.dto.response.CreateGlobalTransactionResponse;
import woorifisa.project.backend.domain.banking.dto.response.GlobalTransactionListItemResponse;
import woorifisa.project.backend.domain.banking.dto.response.TransferPreviewResponse;
import woorifisa.project.backend.domain.banking.service.BankingService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/banking")
public class BankingController {

    private final BankingService bankingService;

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

    // 해외 송금
    @PostMapping("/global-transactions")
    public BaseResponse<CreateGlobalTransactionResponse> createGlobalTransaction(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody CreateGlobalTransactionRequest request
    ) {
        return BaseResponse.ok(
                bankingService.createGlobalTransaction(principal.userId(), idempotencyKey, request)
        );
    }

    // 해외 송금 내역 조회
    @GetMapping("/global-transactions")
    public BaseResponse<List<GlobalTransactionListItemResponse>> findGlobalTransactions(
            @AuthenticationPrincipal SessionUserPrincipal principal
    ) {
        return BaseResponse.ok(bankingService.findGlobalTransactions(principal.userId()));
    }
}

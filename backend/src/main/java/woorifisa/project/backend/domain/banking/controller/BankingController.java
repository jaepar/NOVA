package woorifisa.project.backend.domain.banking.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.backend.domain.banking.dto.request.AccountCreateRequest;
import woorifisa.project.backend.domain.banking.dto.request.AccountPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransactionFlowFilter;
import woorifisa.project.backend.domain.banking.dto.request.TransactionPeriod;
import woorifisa.project.backend.domain.banking.dto.request.TransferPreviewRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferRequest;
import woorifisa.project.backend.domain.banking.dto.request.UpdateTransactionMemoRequest;
import woorifisa.project.backend.domain.banking.dto.response.AccountCreateResponse;
import woorifisa.project.backend.domain.banking.dto.response.AccountHomeResponse;
import woorifisa.project.backend.domain.banking.dto.response.BankingTransactionsResponse;
import woorifisa.project.backend.domain.banking.dto.response.TransferPreviewResponse;
import woorifisa.project.backend.domain.banking.service.BankingService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/banking")
public class BankingController {

    private final BankingService bankingService;

    @GetMapping("/home")
    public BaseResponse<AccountHomeResponse> findHomeAccount(
            @AuthenticationPrincipal SessionUserPrincipal principal
    ) {
        return BaseResponse.ok(bankingService.findHomeAccount(principal.userId()));
    }

    @PostMapping
    public BaseResponse<AccountCreateResponse> createAccount(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @Valid @RequestBody AccountCreateRequest request
    ) {
        return BaseResponse.ok(bankingService.createAccount(principal.userId(), request));
    }

    @PostMapping("/transfers")
    public BaseResponse<Void> transfer(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody TransferRequest request
    ) {
        bankingService.transfer(principal.userId(), idempotencyKey, request);
        return BaseResponse.ok(null);
    }

    @PostMapping("/transfers/preview")
    public BaseResponse<TransferPreviewResponse> previewTransfer(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @Valid @RequestBody TransferPreviewRequest request
    ) {
        return BaseResponse.ok(bankingService.previewTransfer(principal.userId(), request));
    }

    @PostMapping("/password/verify")
    public BaseResponse<Void> verifyAccountPassword(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @Valid @RequestBody AccountPasswordVerifyRequest request
    ) {
        bankingService.verifyAccountPassword(principal.userId(), request);
        return BaseResponse.ok(null);
    }

    @GetMapping("/{accountId}/transactions")
    public BaseResponse<BankingTransactionsResponse> findTransactions(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @PathVariable Long accountId,
            @RequestParam(defaultValue = "ONE_MONTH") TransactionPeriod period,
            @RequestParam(defaultValue = "ALL") TransactionFlowFilter flow,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "DESC") Sort.Direction sortDirection,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return BaseResponse.ok(
                bankingService.findTransactions(
                        principal.userId(),
                        accountId,
                        period,
                        flow,
                        from,
                        to,
                        keyword,
                        sortDirection,
                        pageable
                )
        );
    }

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

package woorifisa.project.backend.domain.banking.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.backend.domain.banking.dto.request.RecipientLookupRequest;
import woorifisa.project.backend.domain.banking.dto.request.TransferRequest;
import woorifisa.project.backend.domain.banking.dto.response.RecipientLookupResponse;
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

    // 수취인 조회
    @PostMapping("/recipients/lookup")
    public BaseResponse<RecipientLookupResponse> lookupRecipient(
            @Valid @RequestBody RecipientLookupRequest request
    ) {
        return BaseResponse.ok(bankingService.lookupRecipient(request));
    }
}

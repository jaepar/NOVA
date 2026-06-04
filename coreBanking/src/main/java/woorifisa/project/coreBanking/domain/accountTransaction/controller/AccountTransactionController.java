package woorifisa.project.coreBanking.domain.accountTransaction.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.UpdateTransactionMemoRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.response.AccountTransactionRequestLookupResponse;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.response.UpdateTransactionMemoResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.DebitWalletAccountRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.TransferAccountRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.service.AccountTransactionService;
import woorifisa.project.coreBanking.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/account-transactions")
public class AccountTransactionController {

    private final AccountTransactionService accountTransactionService;

    @GetMapping("/requests/{externalRequestId}")
    public BaseResponse<AccountTransactionRequestLookupResponse> findRequestResult(
            @PathVariable String externalRequestId
    ) {
        return BaseResponse.ok(accountTransactionService.findRequestResult(externalRequestId));
    }
  
    @PostMapping("/wallet")
    public BaseResponse<Void> debitWalletCharge(@RequestBody DebitWalletAccountRequest request) {
        accountTransactionService.debitWalletCharge(request);
        return BaseResponse.ok(null);
    }

    @PostMapping("/transfers")
    public BaseResponse<Void> transfer(@Valid @RequestBody TransferAccountRequest request) {
        accountTransactionService.transfer(request);
        return BaseResponse.ok(null);
    }

    @PatchMapping("/accounts/{accountId}/transactions/{transactionId}/memo")
    public BaseResponse<UpdateTransactionMemoResponse> updateMemo(
            @PathVariable Long accountId,
            @PathVariable Long transactionId,
            @Valid @RequestBody UpdateTransactionMemoRequest request
    ) {
        return BaseResponse.ok(accountTransactionService.updateMemo(accountId, transactionId, request));
    }
}

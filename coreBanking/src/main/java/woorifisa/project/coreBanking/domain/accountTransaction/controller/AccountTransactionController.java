package woorifisa.project.coreBanking.domain.accountTransaction.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.DebitWalletAccountRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.TransactionFlowFilter;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.TransferAccountRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.UpdateTransactionMemoRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.response.AccountTransactionRequestLookupResponse;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.response.AccountTransactionsResponse;
import woorifisa.project.coreBanking.domain.accountTransaction.service.AccountTransactionService;
import woorifisa.project.coreBanking.global.response.BaseResponse;

import java.time.LocalDate;

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

    @GetMapping("/accounts/{accountId}")
    public BaseResponse<AccountTransactionsResponse> findTransactions(
            @PathVariable Long accountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "ALL") TransactionFlowFilter flow,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "DESC") Sort.Direction sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return BaseResponse.ok(accountTransactionService.findTransactions(accountId, from, to, flow, keyword, sortDirection, page, size));
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

    @PatchMapping("/transactions/{transactionId}/memo")
    public BaseResponse<Void> updateMemo(
            @PathVariable Long transactionId,
            @Valid @RequestBody UpdateTransactionMemoRequest request
    ) {
        accountTransactionService.updateMemo(transactionId, request);
        return BaseResponse.ok(null);
    }
}

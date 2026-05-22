package woorifisa.project.coreBanking.domain.accountTransaction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.response.AccountTransactionRequestLookupResponse;
import woorifisa.project.coreBanking.domain.accountTransaction.service.AccountTransactionService;
import woorifisa.project.coreBanking.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/core-banking/account-transactions")
public class AccountTransactionController {

    private final AccountTransactionService accountTransactionService;

    @GetMapping("/{externalRequestId}")
    public BaseResponse<AccountTransactionRequestLookupResponse> findRequestResult(
            @PathVariable String externalRequestId
    ) {
        return BaseResponse.ok(accountTransactionService.findRequestResult(externalRequestId));
    }
}

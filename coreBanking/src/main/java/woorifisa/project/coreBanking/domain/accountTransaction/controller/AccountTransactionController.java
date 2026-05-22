package woorifisa.project.coreBanking.domain.accountTransaction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.response.AccountTransactionRequestLookupResponse;
import woorifisa.project.coreBanking.domain.accountTransaction.service.AccountTransactionService;
import woorifisa.project.coreBanking.global.response.BaseResponse;
import woorifisa.project.coreBanking.global.response.status.BaseResponseStatus;

@RestController
@RequiredArgsConstructor
@RequestMapping("/core-banking/account-transactions")
public class AccountTransactionController {

    private final AccountTransactionService accountTransactionService;

    @GetMapping("/requests/{externalRequestId}")
    public BaseResponse<AccountTransactionRequestLookupResponse> findRequestResult(
            @PathVariable String externalRequestId
    ) {
        AccountTransactionRequestLookupResponse response = accountTransactionService.findRequestResult(externalRequestId);
        BaseResponseStatus status = response.found()
                ? BaseResponseStatus.ACCOUNT_TRANSACTION_REQUEST_FOUND
                : BaseResponseStatus.ACCOUNT_TRANSACTION_REQUEST_NOT_FOUND;

        return BaseResponse.of(status, response);
    }
}

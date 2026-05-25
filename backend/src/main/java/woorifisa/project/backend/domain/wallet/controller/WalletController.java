package woorifisa.project.backend.domain.wallet.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.backend.domain.auth.session.annotation.LoginUser;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionsResponse;
import woorifisa.project.backend.domain.wallet.service.WalletService;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/wallet")
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/transactions")
    public BaseResponse<WalletTransactionsResponse> findWalletTransactions(@LoginUser Long userId) {
        return BaseResponse.ok(walletService.findWalletTransactions(userId));
    }
}

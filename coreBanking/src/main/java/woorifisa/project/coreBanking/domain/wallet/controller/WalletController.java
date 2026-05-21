package woorifisa.project.coreBanking.domain.wallet.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.coreBanking.domain.wallet.dto.request.DebitWalletAccountRequest;
import woorifisa.project.coreBanking.domain.wallet.dto.response.DebitWalletAccountResponse;
import woorifisa.project.coreBanking.domain.wallet.service.WalletService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/wallet")
public class WalletController {

    private final WalletService walletService;

    @PostMapping("/charges/debit")
    public DebitWalletAccountResponse debitWalletCharge(@RequestBody DebitWalletAccountRequest request) {
        return walletService.debitWalletCharge(request);
    }
}

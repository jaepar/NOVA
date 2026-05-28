package woorifisa.project.backend.domain.wallet.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.backend.domain.banking.repository.BankingRepository;
import woorifisa.project.backend.domain.wallet.dto.response.WalletNextStep;
import woorifisa.project.backend.domain.wallet.dto.response.WalletStatusResponse;
import woorifisa.project.backend.domain.wallet.repository.WalletRepository;

@Service
@RequiredArgsConstructor
public class WalletStatusService {

    private final WalletRepository walletRepository;
    private final BankingRepository bankingRepository;

    @Transactional(readOnly = true)
    public WalletStatusResponse findWalletStatus(Long userId) {
        if (walletRepository.findByUser_UserId(userId).isPresent()) {
            return new WalletStatusResponse(WalletNextStep.WALLET_HOME);
        }

        if (bankingRepository.existsByUser_UserIdAndHasAccountTrueAndHasLimitTrue(userId)) {
            return new WalletStatusResponse(WalletNextStep.WALLET_TERMS);
        }

        return new WalletStatusResponse(WalletNextStep.CREATE_ACCOUNT);
    }
}

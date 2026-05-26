package woorifisa.project.backend.domain.wallet.dto.response;

import woorifisa.project.backend.domain.banking.entity.AccountRef;
import woorifisa.project.backend.domain.wallet.entity.Wallet;

public record WalletStatusResponse(
        Boolean hasWallet,
        Boolean canCreateWallet,
        Boolean requiresTermsAgreement,
        Long walletId,
        Integer balance,
        Long linkedAccountId,
        String reason
) {

    public static WalletStatusResponse from(Wallet wallet) {
        return new WalletStatusResponse(
                true,
                false,
                false,
                wallet.getWalletId(),
                wallet.getBalance(),
                wallet.getUserAccount().getAccountId(),
                null
        );
    }

    public static WalletStatusResponse from(AccountRef accountRef) {
        return new WalletStatusResponse(
                false,
                true,
                true,
                null,
                null,
                accountRef.getAccountId(),
                null
        );
    }
}

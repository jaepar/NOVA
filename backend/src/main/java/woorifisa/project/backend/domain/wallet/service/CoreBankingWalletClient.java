package woorifisa.project.backend.domain.wallet.service;

import woorifisa.project.backend.domain.wallet.dto.corebanking.request.CoreBankingWalletDebitRequest;

public interface CoreBankingWalletClient {

    void debitWalletAccount(CoreBankingWalletDebitRequest request);

    boolean existsWalletDebitRequest(String externalRequestId);
}

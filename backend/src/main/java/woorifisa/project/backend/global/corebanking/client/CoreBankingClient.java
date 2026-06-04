package woorifisa.project.backend.global.corebanking.client;

import woorifisa.project.backend.domain.banking.dto.request.UpdateTransactionMemoRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingCreateAccountRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingCreateCustomerRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingPasswordVerifyRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingRecipientLookupRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingTransferRequest;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingWalletDebitRequest;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingCreateAccountResponse;
import woorifisa.project.backend.global.corebanking.dto.response.CoreBankingRecipientLookupResponse;

public interface CoreBankingClient {

    void transfer(CoreBankingTransferRequest request);

    boolean existsTransferRequest(String externalRequestId);

    CoreBankingRecipientLookupResponse lookupRecipient(CoreBankingRecipientLookupRequest request);

    void verifyAccountPassword(CoreBankingPasswordVerifyRequest request);

    void updateTransactionMemo(
            Long transactionId,
            UpdateTransactionMemoRequest request
    );

    void debitWalletAccount(CoreBankingWalletDebitRequest request);

    boolean existsWalletDebitRequest(String externalRequestId);

    void createCustomer(CoreBankingCreateCustomerRequest request);

    CoreBankingCreateAccountResponse createAccount(CoreBankingCreateAccountRequest request);
}

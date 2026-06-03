package woorifisa.project.backend.global.corebanking.client;

import woorifisa.project.backend.global.corebanking.client.dto.request.CoreBankingPasswordVerifyRequest;
import woorifisa.project.backend.global.corebanking.client.dto.request.CoreBankingRecipientLookupRequest;
import woorifisa.project.backend.global.corebanking.client.dto.request.CoreBankingTransferRequest;
import woorifisa.project.backend.global.corebanking.client.dto.request.CoreBankingCreateAccountRequest;
import woorifisa.project.backend.global.corebanking.client.dto.request.CoreBankingCreateCustomerRequest;
import woorifisa.project.backend.global.corebanking.client.dto.response.CoreBankingCreateAccountResponse;
import woorifisa.project.backend.global.corebanking.client.dto.response.CoreBankingRecipientLookupResponse;
import woorifisa.project.backend.global.corebanking.client.dto.request.CoreBankingWalletDebitRequest;

public interface CoreBankingClient {

    void transfer(CoreBankingTransferRequest request);

    boolean existsTransferRequest(String externalRequestId);

    CoreBankingRecipientLookupResponse lookupRecipient(CoreBankingRecipientLookupRequest request);

    void verifyAccountPassword(CoreBankingPasswordVerifyRequest request);

    void debitWalletAccount(CoreBankingWalletDebitRequest request);

    boolean existsWalletDebitRequest(String externalRequestId);

    void createCustomer(CoreBankingCreateCustomerRequest request);

    CoreBankingCreateAccountResponse createAccount(CoreBankingCreateAccountRequest request);
}

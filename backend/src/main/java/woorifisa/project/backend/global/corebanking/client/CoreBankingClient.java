package woorifisa.project.backend.global.corebanking.client;

import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingRecipientLookupRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingTransferRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingCreateAccountRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingCreateCustomerRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingCreateAccountResponse;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingRecipientLookupResponse;
import woorifisa.project.backend.domain.wallet.dto.corebanking.request.CoreBankingWalletDebitRequest;

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

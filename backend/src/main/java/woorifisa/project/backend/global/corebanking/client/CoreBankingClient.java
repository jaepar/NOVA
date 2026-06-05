package woorifisa.project.backend.global.corebanking.client;

import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingRecipientLookupRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingTransferRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingCreateCustomerRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingCreateGlobalTransactionRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingCreateGlobalTransactionResponse;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingGlobalTransactionListItemResponse;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingRecipientLookupResponse;
import woorifisa.project.backend.domain.wallet.dto.corebanking.request.CoreBankingWalletDebitRequest;

import java.util.List;

public interface CoreBankingClient {

    void transfer(CoreBankingTransferRequest request);

    boolean existsTransferRequest(String externalRequestId);

    CoreBankingRecipientLookupResponse lookupRecipient(CoreBankingRecipientLookupRequest request);

    void verifyAccountPassword(CoreBankingPasswordVerifyRequest request);

    void debitWalletAccount(CoreBankingWalletDebitRequest request);

    boolean existsWalletDebitRequest(String externalRequestId);

    void createCustomer(CoreBankingCreateCustomerRequest request);

    CoreBankingCreateGlobalTransactionResponse createGlobalTransaction(CoreBankingCreateGlobalTransactionRequest request);

    List<CoreBankingGlobalTransactionListItemResponse> findGlobalTransactionsByCustomerId(Long customerId);
}

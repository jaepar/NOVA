package woorifisa.project.backend.global.corebanking.client;

import woorifisa.project.backend.domain.banking.dto.request.UpdateTransactionMemoRequest;
import woorifisa.project.backend.global.corebanking.dto.request.*;
import woorifisa.project.backend.global.corebanking.dto.response.*;

import java.util.List;

public interface CoreBankingClient {

    void transfer(CoreBankingTransferRequest request);

    boolean existsTransferRequest(String externalRequestId);

    CoreBankingRecipientLookupResponse lookupRecipient(CoreBankingRecipientLookupRequest request);

    void verifyAccountPassword(CoreBankingPasswordVerifyRequest request);

    CoreBankingTransactionsResponse findAccountTransactions(CoreBankingTransactionQuery query);

    void updateTransactionMemo(Long transactionId, UpdateTransactionMemoRequest request);

    void debitWalletAccount(CoreBankingWalletDebitRequest request);

    boolean existsWalletDebitRequest(String externalRequestId);

    void createCustomer(CoreBankingCreateCustomerRequest request);

    CoreBankingCreateAccountResponse createAccount(CoreBankingCreateAccountRequest request);

    CoreBankingCreateGlobalTransactionResponse createGlobalTransaction(CoreBankingCreateGlobalTransactionRequest request);

    List<CoreBankingGlobalTransactionListItemResponse> findGlobalTransactionsByCustomerId(Long customerId);
}

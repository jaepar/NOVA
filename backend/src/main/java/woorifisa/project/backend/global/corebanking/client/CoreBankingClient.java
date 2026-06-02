package woorifisa.project.backend.global.corebanking.client;

import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingRecipientLookupRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingTransactionQuery;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingTransferRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingCreateCustomerRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingRecipientLookupResponse;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingTransactionsResponse;
import woorifisa.project.backend.domain.wallet.dto.corebanking.request.CoreBankingWalletDebitRequest;

public interface CoreBankingClient {

    void transfer(CoreBankingTransferRequest request);

    boolean existsTransferRequest(String externalRequestId);

    CoreBankingRecipientLookupResponse lookupRecipient(CoreBankingRecipientLookupRequest request);

    void verifyAccountPassword(CoreBankingPasswordVerifyRequest request);

    // Core Banking 원장 기준 계좌 거래내역을 기간/유형/페이지 조건으로 조회한다.
    CoreBankingTransactionsResponse findAccountTransactions(CoreBankingTransactionQuery query);

    void debitWalletAccount(CoreBankingWalletDebitRequest request);

    boolean existsWalletDebitRequest(String externalRequestId);

    void createCustomer(CoreBankingCreateCustomerRequest request);
}

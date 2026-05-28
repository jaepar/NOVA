package woorifisa.project.backend.domain.banking.service;

import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingTransferRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingRecipientLookupRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingPasswordVerifyRequest;
import woorifisa.project.backend.domain.banking.dto.corebanking.response.CoreBankingRecipientLookupResponse;

public interface CoreBankingTransferClient {

    // 코어 뱅킹 계좌 이체
    void transfer(CoreBankingTransferRequest request);

    // 코어 뱅킹 이체 처리 결과 조회
    boolean existsTransferRequest(String externalRequestId);

    // 수취인 조회
    CoreBankingRecipientLookupResponse lookupRecipient(CoreBankingRecipientLookupRequest request);

    // 계좌 비밀번호 검증
    void verifyAccountPassword(CoreBankingPasswordVerifyRequest request);
}

package woorifisa.project.backend.domain.banking.service;

import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingTransferRequest;

public interface CoreBankingTransferClient {

    // 코어 뱅킹 계좌 이체 요청
    void transfer(CoreBankingTransferRequest request);

    // 코어 뱅킹 이체 처리 결과 조회
    boolean existsTransferRequest(String externalRequestId);
}

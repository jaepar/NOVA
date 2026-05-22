package woorifisa.project.coreBanking.domain.accountTransaction.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.response.AccountTransactionRequestLookupResponse;
import woorifisa.project.coreBanking.domain.accountTransaction.repository.AccountTransactionRepository;
import woorifisa.project.coreBanking.global.exception.CustomException;

import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_TRANSACTION_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class AccountTransactionService {

    private final AccountTransactionRepository accountTransactionRepository;

    @Transactional(readOnly = true)
    public AccountTransactionRequestLookupResponse findRequestResult(String externalRequestId) {
        return accountTransactionRepository.findByExternalRequestId(externalRequestId)
                .map(accountTransaction -> AccountTransactionRequestLookupResponse.found(accountTransaction.getExternalRequestId()))
                .orElseThrow(() -> new CustomException(ACCOUNT_TRANSACTION_NOT_FOUND));
    }
}

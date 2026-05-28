package woorifisa.project.coreBanking.domain.account.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.coreBanking.domain.account.dto.request.RecipientLookupRequest;
import woorifisa.project.coreBanking.domain.account.dto.response.RecipientLookupResponse;
import woorifisa.project.coreBanking.domain.account.entity.Account;
import woorifisa.project.coreBanking.domain.account.entity.enums.BankCode;
import woorifisa.project.coreBanking.domain.account.repository.AccountRepository;
import woorifisa.project.coreBanking.global.exception.CustomException;

import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_RECIPIENT_LOOKUP_ACCOUNT_NOT_FOUND;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_RECIPIENT_LOOKUP_INVALID_REQUEST;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    @Transactional(readOnly = true)
    public RecipientLookupResponse lookupRecipient(RecipientLookupRequest request) {
        // 해당 은행 코드에 대한
        BankCode bankCode = resolveBankCode(request.bankCode());

        // 은행 코드와 계좌 번호로 해당 계좌 찾는 메서드
        Account account = accountRepository.findByBankCodeAndAccountNumber(bankCode, request.accountNumber())
                .orElseThrow(() -> new CustomException(ACCOUNT_RECIPIENT_LOOKUP_ACCOUNT_NOT_FOUND));

        return RecipientLookupResponse.of(account.getCustomer().getName());
    }

    private BankCode resolveBankCode(String bankCode) {
        try {
            return BankCode.valueOf(bankCode.trim().toUpperCase());
        } catch (RuntimeException exception) {
            throw new CustomException(ACCOUNT_RECIPIENT_LOOKUP_INVALID_REQUEST);
        }
    }
}

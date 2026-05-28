package woorifisa.project.coreBanking.domain.account.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import woorifisa.project.coreBanking.domain.account.dto.request.RecipientLookupRequest;
import woorifisa.project.coreBanking.domain.account.entity.Account;
import woorifisa.project.coreBanking.domain.account.entity.enums.BankCode;
import woorifisa.project.coreBanking.domain.account.repository.AccountRepository;
import woorifisa.project.coreBanking.domain.customer.entity.Customer;
import woorifisa.project.coreBanking.global.exception.CustomException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_RECIPIENT_LOOKUP_ACCOUNT_NOT_FOUND;

class AccountServiceTest {

    private final AccountRepository accountRepository = mock(AccountRepository.class);
    private final AccountService accountService = new AccountService(accountRepository);

    @Test
    @DisplayName("은행코드와 계좌번호로 수취인명을 조회한다")
    void lookupRecipientSuccess() {
        Account account = Account.builder()
                .accountId(2002L)
                .bankCode(BankCode.BUSAN)
                .accountNumber("1122261925003")
                .customer(Customer.builder().customerId(1002L).name("백민정").build())
                .build();

        when(accountRepository.findByBankCodeAndAccountNumber(BankCode.BUSAN, "1122261925003"))
                .thenReturn(Optional.of(account));

        var response = accountService.lookupRecipient(new RecipientLookupRequest("busan", "1122261925003"));

        assertThat(response.recipientName()).isEqualTo("백민정");
    }

    @Test
    @DisplayName("일치하는 계좌가 없으면 예외를 반환한다")
    void lookupRecipientNotFound() {
        when(accountRepository.findByBankCodeAndAccountNumber(BankCode.BUSAN, "1122261925003"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.lookupRecipient(new RecipientLookupRequest("BUSAN", "1122261925003")))
                .isInstanceOf(CustomException.class)
                .hasMessage(ACCOUNT_RECIPIENT_LOOKUP_ACCOUNT_NOT_FOUND.getMessage());
    }
}

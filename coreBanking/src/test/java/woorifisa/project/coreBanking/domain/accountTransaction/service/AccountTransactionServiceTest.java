package woorifisa.project.coreBanking.domain.accountTransaction.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;
import woorifisa.project.coreBanking.domain.accountTransaction.repository.AccountTransactionRepository;
import woorifisa.project.coreBanking.global.exception.CustomException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_TRANSACTION_NOT_FOUND;

class AccountTransactionServiceTest {

    private final AccountTransactionRepository accountTransactionRepository = mock(AccountTransactionRepository.class);
    private final AccountTransactionService accountTransactionService = new AccountTransactionService(accountTransactionRepository);

    @Test
    @DisplayName("externalRequestId가 존재하면 거래 처리 결과를 확인한다")
    void found() {
        String externalRequestId = "TR-20260513-0001";
        AccountTransaction accountTransaction = AccountTransaction.builder()
                .externalRequestId(externalRequestId)
                .build();

        when(accountTransactionRepository.findByExternalRequestId(externalRequestId))
                .thenReturn(Optional.of(accountTransaction));

        var response = accountTransactionService.findRequestResult(externalRequestId);

        assertThat(response.externalRequestId()).isEqualTo(externalRequestId);
    }

    @Test
    @DisplayName("externalRequestId가 존재하지 않으면 예외를 반환한다")
    void notFound() {
        String externalRequestId = "WCR-20260522-0001";

        when(accountTransactionRepository.findByExternalRequestId(externalRequestId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountTransactionService.findRequestResult(externalRequestId))
                .isInstanceOf(CustomException.class)
                .hasMessage(ACCOUNT_TRANSACTION_NOT_FOUND.getMessage());
    }
}

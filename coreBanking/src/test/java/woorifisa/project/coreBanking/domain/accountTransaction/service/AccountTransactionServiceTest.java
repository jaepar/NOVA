package woorifisa.project.coreBanking.domain.accountTransaction.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;
import woorifisa.project.coreBanking.domain.accountTransaction.repository.AccountTransactionRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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
        assertThat(response.found()).isTrue();
    }

    @Test
    @DisplayName("externalRequestId가 존재하지 않으면 null 결과를 반환한다")
    void notFound() {
        String externalRequestId = "WCR-20260522-0001";

        when(accountTransactionRepository.findByExternalRequestId(externalRequestId))
                .thenReturn(Optional.empty());

        var response = accountTransactionService.findRequestResult(externalRequestId);

        assertThat(response.externalRequestId()).isNull();
        assertThat(response.found()).isFalse();
    }
}

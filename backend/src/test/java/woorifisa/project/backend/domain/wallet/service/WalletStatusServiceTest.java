package woorifisa.project.backend.domain.wallet.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import woorifisa.project.backend.domain.banking.repository.BankingRepository;
import woorifisa.project.backend.domain.wallet.dto.response.WalletNextStep;
import woorifisa.project.backend.domain.wallet.dto.response.WalletStatusResponse;
import woorifisa.project.backend.domain.wallet.entity.Wallet;
import woorifisa.project.backend.domain.wallet.repository.WalletRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WalletStatusServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private BankingRepository bankingRepository;

    @InjectMocks
    private WalletStatusService walletStatusService;

    @Test
    @DisplayName("월렛이 있으면 월렛 홈 이동 상태를 반환한다")
    void walletFound() {
        Long userId = 1L;
        Wallet wallet = Wallet.builder()
                .walletId(10L)
                .balance(12500)
                .build();

        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.of(wallet));

        WalletStatusResponse response = walletStatusService.findWalletStatus(userId);

        assertThat(response.nextStep()).isEqualTo(WalletNextStep.WALLET_HOME);
    }

    @Test
    @DisplayName("월렛이 없고 임시 제한 계좌가 있으면 월렛 약관 이동 상태를 반환한다")
    void canCreate() {
        Long userId = 1L;

        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.empty());
        when(bankingRepository.existsByUser_UserIdAndHasAccountTrueAndHasLimitTrue(userId)).thenReturn(true);

        WalletStatusResponse response = walletStatusService.findWalletStatus(userId);

        assertThat(response.nextStep()).isEqualTo(WalletNextStep.WALLET_TERMS);
    }

    @Test
    @DisplayName("월렛과 임시 제한 계좌가 없으면 계좌 개설 이동 상태를 반환한다")
    void accountRequired() {
        Long userId = 1L;

        when(walletRepository.findByUser_UserId(userId)).thenReturn(Optional.empty());
        when(bankingRepository.existsByUser_UserIdAndHasAccountTrueAndHasLimitTrue(userId)).thenReturn(false);

        WalletStatusResponse response = walletStatusService.findWalletStatus(userId);

        assertThat(response.nextStep()).isEqualTo(WalletNextStep.CREATE_ACCOUNT);
    }
}

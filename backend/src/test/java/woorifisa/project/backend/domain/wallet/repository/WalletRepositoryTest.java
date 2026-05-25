package woorifisa.project.backend.domain.wallet.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class WalletRepositoryTest {

    @Test
    @DisplayName("사용자 ID로 월렛을 조회하는 메서드를 제공한다")
    void found() throws NoSuchMethodException {
        Method method = WalletRepository.class.getMethod("findByUser_UserId", Long.class);

        assertThat(method.getReturnType()).isEqualTo(Optional.class);
    }
}

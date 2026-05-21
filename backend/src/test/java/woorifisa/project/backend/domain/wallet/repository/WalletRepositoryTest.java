package woorifisa.project.backend.domain.wallet.repository;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class WalletRepositoryTest {

    @Test
    void exposesFindByUserUserIdForCurrentUserWalletLookup() throws NoSuchMethodException {
        Method method = WalletRepository.class.getMethod("findByUser_UserId", Long.class);

        assertThat(method.getReturnType()).isEqualTo(Optional.class);
    }
}

package woorifisa.project.backend.domain.banking.repository;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class BankingRepositoryTest {

    @Test
    void exposesFindByUserUserIdAndAccountIdForAccountOwnershipCheck() throws NoSuchMethodException {
        Method method = BankingRepository.class.getMethod("findByUser_UserIdAndAccountId", Long.class, Long.class);

        assertThat(method.getReturnType()).isEqualTo(Optional.class);
    }
}

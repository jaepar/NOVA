package woorifisa.project.coreBanking.domain.account.repository;

import jakarta.persistence.LockModeType;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.Lock;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

class AccountRepositoryTest {

    @Test
    void exposesLockedLookupByAccountIdAndCustomerIdForWalletDebit() throws NoSuchMethodException {
        Method method = AccountRepository.class.getMethod("findByAccountIdAndCustomer_CustomerId", Long.class, Long.class);

        Lock lock = method.getAnnotation(Lock.class);

        assertThat(lock).isNotNull();
        assertThat(lock.value()).isEqualTo(LockModeType.PESSIMISTIC_WRITE);
    }
}

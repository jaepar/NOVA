package woorifisa.project.coreBanking.domain.account.repository;

import jakarta.persistence.LockModeType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.Lock;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

class AccountRepositoryTest {

    @Test
    @DisplayName("월렛 계좌차감용 계좌 조회 메서드에 쓰기 락을 선언한다")
    void lockedAccountLookupExists() throws NoSuchMethodException {
        Method method = AccountRepository.class.getMethod("findByAccountIdAndCustomer_CustomerId", Long.class, Long.class);

        Lock lock = method.getAnnotation(Lock.class);

        assertThat(lock).isNotNull();
        assertThat(lock.value()).isEqualTo(LockModeType.PESSIMISTIC_WRITE);
    }
}

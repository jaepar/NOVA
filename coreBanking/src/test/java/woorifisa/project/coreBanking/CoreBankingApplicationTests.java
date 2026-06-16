package woorifisa.project.coreBanking;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import woorifisa.project.coreBanking.domain.account.repository.AccountRepository;
import woorifisa.project.coreBanking.domain.accountTransaction.repository.AccountTransactionRepository;
import woorifisa.project.coreBanking.domain.customer.repository.CustomerRepository;
import woorifisa.project.coreBanking.domain.globalTransaction.repository.GlobalTransactionRepository;

@SpringBootTest(properties = {
	"spring.autoconfigure.exclude="
		+ "org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration,"
		+ "org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration,"
		+ "org.springframework.boot.data.jpa.autoconfigure.DataJpaRepositoriesAutoConfiguration"
})
class CoreBankingApplicationTests {

	@MockitoBean
	private AccountRepository accountRepository;

	@MockitoBean
	private AccountTransactionRepository accountTransactionRepository;

	@MockitoBean
	private CustomerRepository customerRepository;

	@MockitoBean
	private GlobalTransactionRepository globalTransactionRepository;

	@MockitoBean(name = "jpaMappingContext")
	private JpaMetamodelMappingContext jpaMappingContext;

	@Test
	void contextLoads() {
	}

}

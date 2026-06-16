package woorifisa.project.coreBanking.domain.customer.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.CUSTOMER_ALREADY_EXISTS;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import woorifisa.project.coreBanking.domain.customer.dto.request.CreateCustomerRequest;
import woorifisa.project.coreBanking.domain.customer.entity.Customer;
import woorifisa.project.coreBanking.domain.customer.entity.enums.CustomerPurpose;
import woorifisa.project.coreBanking.domain.customer.entity.enums.FundSource;
import woorifisa.project.coreBanking.domain.customer.repository.CustomerRepository;
import woorifisa.project.coreBanking.global.exception.CustomException;

class CustomerServiceTest {

	private final CustomerRepository customerRepository = mock(CustomerRepository.class);
	private final CustomerService customerService = new CustomerService(customerRepository);

	@Test
	@DisplayName("backend user id가 중복되지 않으면 고객을 생성한다")
	void createCustomerSuccess() {
		CreateCustomerRequest request = new CreateCustomerRequest(2L, "PARK JAEHA", "abc@gmail.com");

		when(customerRepository.existsByBackendUserId(2L)).thenReturn(false);

		customerService.createCustomer(request);

		verify(customerRepository).save(argThat(customer ->
			Boolean.FALSE.equals(customer.getHasForeignTax())
				&& customer.getPurpose() == CustomerPurpose.SALARY_AND_LIVING_EXPENSES
				&& customer.getSource() == FundSource.OTHER
		));
	}

	@Test
	@DisplayName("backend user id가 이미 존재하면 예외를 반환한다")
	void createCustomerConflict() {
		CreateCustomerRequest request = new CreateCustomerRequest(2L, "PARK JAEHA", "abc@gmail.com");

		when(customerRepository.existsByBackendUserId(2L)).thenReturn(true);

		assertThatThrownBy(() -> customerService.createCustomer(request))
			.isInstanceOf(CustomException.class)
			.hasMessage(CUSTOMER_ALREADY_EXISTS.getMessage());
	}
}

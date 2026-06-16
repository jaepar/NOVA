package woorifisa.project.coreBanking.domain.customer.service;

import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import woorifisa.project.coreBanking.domain.customer.dto.request.CreateCustomerRequest;
import woorifisa.project.coreBanking.domain.customer.entity.Customer;
import woorifisa.project.coreBanking.domain.customer.entity.enums.CustomerPurpose;
import woorifisa.project.coreBanking.domain.customer.entity.enums.FundSource;
import woorifisa.project.coreBanking.domain.customer.repository.CustomerRepository;
import woorifisa.project.coreBanking.global.exception.CustomException;

@Service
@Slf4j
@RequiredArgsConstructor
public class CustomerService {

	private final CustomerRepository customerRepository;

	@Transactional
	public void createCustomer(CreateCustomerRequest request) {
		if (request.userId() != null && customerRepository.existsByBackendUserId(request.userId())) {
			log.warn("[customer_create:duplicate_user] userId={}", request.userId());
			throw new CustomException(CUSTOMER_ALREADY_EXISTS);
		}

		Customer customer = Customer.builder()
			.backendUserId(request.userId())
			.name(request.name())
			.email(request.email())
			.purpose(CustomerPurpose.SALARY_AND_LIVING_EXPENSES)
			.source(FundSource.OTHER)
			.hasForeignTax(false)
			.build();

		customerRepository.save(customer);
		log.info("[customer_create:saved] userId={}, name={}, email={}",
			request.userId(), request.name(), request.email());
	}
}

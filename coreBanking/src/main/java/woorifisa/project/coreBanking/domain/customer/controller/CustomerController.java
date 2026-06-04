package woorifisa.project.coreBanking.domain.customer.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import woorifisa.project.coreBanking.domain.customer.dto.request.CreateCustomerRequest;
import woorifisa.project.coreBanking.domain.customer.service.CustomerService;
import woorifisa.project.coreBanking.global.response.BaseResponse;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/customers")
public class CustomerController {

	private final CustomerService customerService;

	@PostMapping
	public BaseResponse<Void> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
		log.info("[customer_create:requested] userId={}, name={}, email={}",
			request.userId(), request.name(), request.email());
		customerService.createCustomer(request);
		log.info("[customer_create:completed] userId={}", request.userId());
		return BaseResponse.ok(null);
	}
}

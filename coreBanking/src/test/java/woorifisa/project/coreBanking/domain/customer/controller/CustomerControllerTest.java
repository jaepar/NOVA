package woorifisa.project.coreBanking.domain.customer.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import woorifisa.project.coreBanking.domain.customer.dto.request.CreateCustomerRequest;
import woorifisa.project.coreBanking.domain.customer.service.CustomerService;
import woorifisa.project.coreBanking.global.exception.handler.GlobalControllerAdvice;

class CustomerControllerTest {

	private final CustomerService customerService = mock(CustomerService.class);
	private final CustomerController customerController = new CustomerController(customerService);
	private final MockMvc mockMvc = MockMvcBuilders.standaloneSetup(customerController)
		.setControllerAdvice(new GlobalControllerAdvice())
		.build();

	@Test
	@DisplayName("고객 생성 요청을 서비스에 전달하고 공통 성공 응답을 반환한다")
	void createCustomerSuccess() throws Exception {
		mockMvc.perform(post("/customers")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "userId": 2,
					  "name": "PARK JAEHA",
					  "email": "abc@gmail.com"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("20000"))
			.andExpect(jsonPath("$.data").doesNotExist());

		verify(customerService).createCustomer(any(CreateCustomerRequest.class));
	}
}

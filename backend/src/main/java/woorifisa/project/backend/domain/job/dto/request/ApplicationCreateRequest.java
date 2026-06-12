package woorifisa.project.backend.domain.job.dto.request;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ApplicationCreateRequest(
	@JsonProperty("portfolio_urls")
	List<String> portfolioUrls
) {

	public List<String> portfolioUrlsOrEmpty() {
		return portfolioUrls == null ? List.of() : portfolioUrls;
	}
}

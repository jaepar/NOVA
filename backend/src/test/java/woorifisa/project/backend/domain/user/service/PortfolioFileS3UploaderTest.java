package woorifisa.project.backend.domain.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import woorifisa.project.backend.global.config.S3Properties;

@ExtendWith(MockitoExtension.class)
class PortfolioFileS3UploaderTest {

	@Mock
	private S3Client s3Client;

	private final S3Properties s3Properties = new S3Properties(
		new S3Properties.Credentials("access", "secret"),
		new S3Properties.S3("ap-northeast-2", "test-bucket", "https://s3.test")
	);

	private PortfolioFileS3Uploader uploader;

	@BeforeEach
	void setUp() {
		uploader = new PortfolioFileS3Uploader(s3Client, s3Properties);
	}

	@Test
	@DisplayName("resume upload uses an application scoped key")
	void uploadResumeKeyFormat() {
		MockMultipartFile file = new MockMultipartFile(
			"files",
			"공고문(미취업청년 자격증 응시료 지원).pdf",
			"application/pdf",
			"data".getBytes()
		);

		String fileUrl = uploader.upload(7L, 11L, 0, file);

		ArgumentCaptor<PutObjectRequest> requestCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
		verify(s3Client).putObject(requestCaptor.capture(), any(RequestBody.class));
		assertThat(requestCaptor.getValue().key())
			.isEqualTo("portfolios/user-7/application-11/portfolio-0_공고문(미취업청년_자격증_응시료_지원).pdf");
		assertThat(fileUrl)
			.isEqualTo("https://s3.test/portfolios/user-7/application-11/portfolio-0_공고문(미취업청년_자격증_응시료_지원).pdf");
	}

	@Test
	@DisplayName("profile portfolio upload uses a profile scoped key")
	void uploadProfileKeyFormat() {
		MockMultipartFile file = new MockMultipartFile(
			"portfolioFile",
			"my portfolio.pdf",
			"application/pdf",
			"data".getBytes()
		);

		String fileUrl = uploader.uploadProfile(7L, file);

		ArgumentCaptor<PutObjectRequest> requestCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
		verify(s3Client).putObject(requestCaptor.capture(), any(RequestBody.class));
		assertThat(requestCaptor.getValue().key())
			.startsWith("portfolios/user-7/profile/")
			.endsWith("_my_portfolio.pdf");
		assertThat(fileUrl)
			.startsWith("https://s3.test/portfolios/user-7/profile/")
			.endsWith("_my_portfolio.pdf");
	}

	@Test
	@DisplayName("profile portfolio delete removes object by URL key")
	void deleteByUrlDeletesObjectKey() {
		uploader.deleteByUrl("https://s3.test/portfolios/user-7/profile/file.pdf");

		ArgumentCaptor<DeleteObjectRequest> requestCaptor = ArgumentCaptor.forClass(DeleteObjectRequest.class);
		verify(s3Client).deleteObject(requestCaptor.capture());
		assertThat(requestCaptor.getValue().bucket()).isEqualTo("test-bucket");
		assertThat(requestCaptor.getValue().key()).isEqualTo("portfolios/user-7/profile/file.pdf");
	}
}

package woorifisa.project.backend.domain.user.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

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
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import woorifisa.project.backend.domain.user.entity.enums.DocumentStatus;
import woorifisa.project.backend.domain.user.entity.enums.DocumentType;
import woorifisa.project.backend.global.config.S3Properties;

@ExtendWith(MockitoExtension.class)
class UserDocumentS3UploaderTest {

	@Mock
	private S3Client s3Client;

	private final S3Properties s3Properties = new S3Properties(
		new S3Properties.Credentials("access", "secret"),
		new S3Properties.S3("ap-northeast-1", "test-bucket", "https://s3.test")
	);

	private UserDocumentS3Uploader uploader;

	@BeforeEach
	void setUp() {
		uploader = new UserDocumentS3Uploader(s3Client, s3Properties);
	}

	@Test
	@DisplayName("fixed key format by user document type and status")
	void fixedKeyFormatByUserDocumentTypeAndStatus() {
		MockMultipartFile file = new MockMultipartFile("file", "doc.pdf", "application/pdf", "data".getBytes());

		uploader.createUrl(7L, file, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT, DocumentStatus.PENDING);

		ArgumentCaptor<PutObjectRequest> requestCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
		verify(s3Client).putObject(requestCaptor.capture(), any(RequestBody.class));
		assertThat(requestCaptor.getValue().key())
			.isEqualTo("documents/7_RESIDENCE_VERIFICATION_DOCUMENT_PENDING.pdf");
	}
}

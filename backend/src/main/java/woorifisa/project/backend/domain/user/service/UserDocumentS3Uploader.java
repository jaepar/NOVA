package woorifisa.project.backend.domain.user.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import woorifisa.project.backend.domain.user.entity.enums.DocumentStatus;
import woorifisa.project.backend.domain.user.entity.enums.DocumentType;
import woorifisa.project.backend.global.config.S3Properties;
import woorifisa.project.backend.global.exception.CustomException;

@Component
@Slf4j
@RequiredArgsConstructor
public class UserDocumentS3Uploader {

	private final S3Client s3Client;
	private final S3Properties s3Properties;

	public String createUrl(Long userId, MultipartFile file, DocumentType documentType, DocumentStatus status) {
		String key = createS3Key(userId, documentType, status);
		PutObjectRequest request = PutObjectRequest.builder()
			.bucket(s3Properties.s3().bucket())
			.key(key)
			.contentType(file.getContentType())
			.build();
		try {
			s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
			return s3Properties.s3().baseUrl() + "/" + key;
		} catch (IOException | RuntimeException e) {
			log.error(
				"S3 document upload failed. userId={}, bucket={}, key={}, reason={}",
				userId,
				s3Properties.s3().bucket(),
				key,
				e.getMessage(),
				e
			);
			throw new CustomException(DOCUMENT_UPLOAD_FAILED);
		}
	}

	private String createS3Key(Long userId, DocumentType documentType, DocumentStatus status) {
		return "documents/" + userId + "_" + documentType.name() + "_" + status.name() + ".pdf";
	}
}

package woorifisa.project.backend.domain.user.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.DOCUMENT_UPLOAD_FAILED;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import woorifisa.project.backend.global.config.S3Properties;
import woorifisa.project.backend.global.exception.CustomException;

@Component
@Slf4j
@RequiredArgsConstructor
public class PortfolioFileS3Uploader {

	private final S3Client s3Client;
	private final S3Properties s3Properties;

	public String upload(Long userId, Long applicationId, int fileIndex, MultipartFile file) {
		String key = buildApplicationKey(userId, applicationId, fileIndex, file.getOriginalFilename());
		PutObjectRequest request = PutObjectRequest.builder()
			.bucket(s3Properties.s3().bucket())
			.key(key)
			.contentType(file.getContentType())
			.build();

		try {
			s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
			return s3Properties.s3().baseUrl() + "/" + key;
		} catch (IOException | RuntimeException e) {
			log.error("S3 portfolio file upload failed. userId={}, applicationId={}, bucket={}, key={}, reason={}",
				userId, applicationId, s3Properties.s3().bucket(), key, e.getMessage(), e);
			throw new CustomException(DOCUMENT_UPLOAD_FAILED);
		}
	}

	private String buildApplicationKey(Long userId, Long applicationId, int fileIndex, String originalFilename) {
		String safeFilename = originalFilename == null || originalFilename.isBlank()
			? "attachment"
			: originalFilename.trim()
				.replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]", "_")
				.replaceAll("\\s+", "_");
		return "portfolios/user-" + userId
			+ "/application-" + applicationId
			+ "/portfolio-" + fileIndex + "_" + safeFilename;
	}
}

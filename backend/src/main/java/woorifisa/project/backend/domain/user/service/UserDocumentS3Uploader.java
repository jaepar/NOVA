package woorifisa.project.backend.domain.user.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import java.io.IOException;
import java.util.UUID;

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
public class UserDocumentS3Uploader {

	private final S3Client s3Client;
	private final S3Properties s3Properties;

	public String createUrl(Long userId, MultipartFile file, String type) {
		String documentTypePath = type.equals("alien") ? "alien-registration-application" : "residence-verification";
		return upload(userId, file, documentTypePath);
	}

	private String upload(Long userId, MultipartFile file, String documentTypePath) {
		String key = createS3Key(userId, documentTypePath);
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

	private String createS3Key(Long userId, String documentTypePath) {  // s3내 서류 파일 구조 정의
		return "documents/" + documentTypePath + "/" + userId + "/" + UUID.randomUUID() + ".pdf";
		// uuid 특성상 동일한 파일임에도 스토리지에 저장될 수 있음, 만약 보완된 서류라면? 논의 필요
	}
}

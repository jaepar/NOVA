package woorifisa.project.backend.domain.user.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.DOCUMENT_DELETE_FAILED;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.DOCUMENT_UPLOAD_FAILED;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import woorifisa.project.backend.global.config.S3Properties;
import woorifisa.project.backend.global.exception.CustomException;

@Component
@Slf4j
@RequiredArgsConstructor
public class PortfolioFileS3Uploader {

	private final S3Client s3Client;
	private final S3Properties s3Properties;

	// 회원 정보 수정에서 등록하는 프로필 포트폴리오용 업로드
	// 특정 지원서에 묶이지 않으므로 applicationId 없이 profile 경로에 저장한다.
	public String uploadProfile(Long userId, MultipartFile file) {
		String key = buildProfileKey(userId, file.getOriginalFilename());  // 파일명이 될 식별키
		PutObjectRequest request = PutObjectRequest.builder()
			.bucket(s3Properties.s3().bucket())
			.key(key)
			.contentType(file.getContentType())
			.build();

		try {
			s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
			return s3Properties.s3().baseUrl() + "/" + key;
		} catch (IOException | RuntimeException e) {
			log.error("S3 profile portfolio file upload failed. userId={}, bucket={}, key={}, reason={}",
				userId, s3Properties.s3().bucket(), key, e.getMessage(), e);
			throw new CustomException(DOCUMENT_UPLOAD_FAILED);
		}
	}

	// 회원 정보 수정에서 포트폴리오 삭제 시 DB row와 함께 S3 객체도 제거하기 위해 사용
	public void deleteByUrl(String fileUrl) {
		String key = extractKey(fileUrl);
		DeleteObjectRequest request = DeleteObjectRequest.builder()
			.bucket(s3Properties.s3().bucket())
			.key(key)
			.build();

		try {
			s3Client.deleteObject(request);
		} catch (RuntimeException e) {
			log.error("S3 profile portfolio file delete failed. bucket={}, key={}, reason={}",
				s3Properties.s3().bucket(), key, e.getMessage(), e);
			throw new CustomException(DOCUMENT_DELETE_FAILED);
		}
	}

	// 구인구직 지원서 제출에서 신규 첨부 파일을 저장할 때 사용하는 기존 업로드 메서드
	// 지원서별 파일이므로 applicationId와 fileIndex를 포함한 application 경로에 저장한다.
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

	// 프로필 포트폴리오는 같은 파일명을 여러 번 올릴 수 있어 uuid를 붙여 충돌을 피한다.
	private String buildProfileKey(Long userId, String originalFilename) {
		return "portfolios/user-" + userId
			+ "/profile/"
			+ UUID.randomUUID() + "_" + sanitizeFilename(originalFilename);
	}

	// 지원서 첨부 파일은 applicationId 하위에 저장해 어떤 지원서에서 올린 파일인지 구분한다.
	private String buildApplicationKey(Long userId, Long applicationId, int fileIndex, String originalFilename) {
		return "portfolios/user-" + userId
			+ "/application-" + applicationId
			+ "/portfolio-" + fileIndex + "_" + sanitizeFilename(originalFilename);
	}

	private String sanitizeFilename(String originalFilename) {
		return originalFilename == null || originalFilename.isBlank()
			? "attachment"
			: originalFilename.trim()
				.replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]", "_")
				.replaceAll("\\s+", "_");
	}

	private String extractKey(String fileUrl) {
		String baseUrl = s3Properties.s3().baseUrl();
		if (baseUrl != null && !baseUrl.isBlank() && fileUrl.startsWith(baseUrl + "/")) {
			return fileUrl.substring(baseUrl.length() + 1);
		}

		try {
			String path = new URI(fileUrl).getPath();
			return path != null && path.startsWith("/") ? path.substring(1) : path;
		} catch (URISyntaxException e) {
			throw new CustomException(DOCUMENT_DELETE_FAILED);
		}
	}
}

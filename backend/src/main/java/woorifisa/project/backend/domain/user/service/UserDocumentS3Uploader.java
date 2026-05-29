package woorifisa.project.backend.domain.user.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CopyObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
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

	public String upload(Long userId, MultipartFile file, DocumentType documentType, DocumentStatus status) {
		String key = buildKey(userId, documentType, status);  // 파일명이 될 식별키
		PutObjectRequest request = PutObjectRequest.builder()
			.bucket(s3Properties.s3().bucket())
			.key(key)
			.contentType(file.getContentType())
			.build();

		try {
			s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
			return s3Properties.s3().baseUrl() + "/" + key;
		} catch (IOException | RuntimeException e) {
			log.error("S3 document upload failed. userId={}, bucket={}, key={}, reason={}", userId,
				s3Properties.s3().bucket(), key, e.getMessage(), e);
			throw new CustomException(DOCUMENT_UPLOAD_FAILED);
		}
	}

	// 관리자가 호출할 메서드
	public String renameStatus(Long userId, DocumentType documentType, DocumentStatus prev, DocumentStatus now) {
		String prevKey = buildKey(userId, documentType, prev);  // 이전 상태
		String currentKey = buildKey(userId, documentType, now);  // 갱신된 상태
		String bucket = s3Properties.s3().bucket();

		try {
			// 갱신된 상태를 가진 새로운 파일 생성
			s3Client.copyObject(CopyObjectRequest.builder()
				.sourceBucket(bucket)
				.sourceKey(prevKey)
				.destinationBucket(bucket)
				.destinationKey(currentKey)
				.build());

			// 갱신된 파일이 생성됨에 따라 기존 파일은 삭제
			s3Client.deleteObject(DeleteObjectRequest.builder()
				.bucket(bucket)
				.key(prevKey)
				.build());

			return s3Properties.s3().baseUrl() + "/" + currentKey;
		} catch (RuntimeException e) {
			log.error("S3 rename failed. userId={}, from={}, to={}, reason={}",
				userId, prevKey, currentKey, e.getMessage(), e);
			throw new CustomException(DOCUMENT_UPLOAD_FAILED);
		}
	}

	private String buildKey(Long userId, DocumentType documentType, DocumentStatus status) {
		return "documents/" + userId + "_" + documentType.name() + "_" + status.name() + ".pdf";
	}
}

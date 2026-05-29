package woorifisa.project.backend.global.admin.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import woorifisa.project.backend.domain.user.entity.Document;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.DocumentStatus;
import woorifisa.project.backend.domain.user.entity.enums.DocumentType;
import woorifisa.project.backend.domain.user.repository.DocumentRepository;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.domain.user.service.UserDocumentS3Uploader;
import woorifisa.project.backend.global.exception.CustomException;

@Service
@RequiredArgsConstructor
public class AdminService {

	private final UserRepository userRepository;
	private final DocumentRepository documentRepository;
	private final UserDocumentS3Uploader userDocumentS3Uploader;

	@Transactional
	public void reviewDocument(Long userId, String documentTypeValue, String targetStatusValue, String missing) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(USER_NOT_FOUND));
		DocumentType documentType = parseDocumentType(documentTypeValue);
		DocumentStatus targetStatus = parseReviewTargetStatus(targetStatusValue);

		// 심사하려는 기존 문서 가져오는 메서드
		Document document = documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, documentType)
			.orElseThrow(() -> new CustomException(DOCUMENT_NOT_FOUND));
		DocumentStatus previousStatus = document.getStatus();

		// 심사하려는 문서의 상태가 PENDING, MODIFIED가 아니라면 예외 발생
		validateReviewSourceStatus(previousStatus);

		String updatedFileUrl = userDocumentS3Uploader.renameStatus(
			userId,
			documentType,
			previousStatus,
			targetStatus
		);

		String reviewedMissing = targetStatus == DocumentStatus.APPROVED ? null : missing;
		document.changeStatus(updatedFileUrl, targetStatus, reviewedMissing);
		documentRepository.save(document);
	}

	private DocumentType parseDocumentType(String rawDocumentType) {
		if (rawDocumentType == null) {
			throw new CustomException(INVALID_DOCUMENT_TYPE);
		}

		return switch (rawDocumentType) {
			case "ALIEN_REGISTRATION_SUPPORTING_DOCUMENT" ->
				DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT;
			case "RESIDENCE_VERIFICATION_DOCUMENT" ->
				DocumentType.RESIDENCE_VERIFICATION_DOCUMENT;
			default -> throw new CustomException(INVALID_DOCUMENT_TYPE);
		};
	}

	private DocumentStatus parseReviewTargetStatus(String rawTargetStatus) {
		if (rawTargetStatus == null || rawTargetStatus.isBlank()) {
			throw new CustomException(INVALID_DOCUMENT_REVIEW_STATUS);
		}

		return switch (rawTargetStatus.trim()) {
			case "APPROVED" -> DocumentStatus.APPROVED;
			case "REJECTED" -> DocumentStatus.REJECTED;
			default -> throw new CustomException(INVALID_DOCUMENT_REVIEW_STATUS);
		};
	}

	private void validateReviewSourceStatus(DocumentStatus sourceStatus) {
		if (sourceStatus != DocumentStatus.PENDING && sourceStatus != DocumentStatus.MODIFIED) {
			throw new CustomException(DOCUMENT_REVIEW_SOURCE_STATUS_INVALID);
		}
	}
}

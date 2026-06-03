package woorifisa.project.backend.global.admin.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import woorifisa.project.backend.domain.user.entity.Document;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;
import woorifisa.project.backend.domain.user.entity.enums.DocumentStatus;
import woorifisa.project.backend.domain.user.entity.enums.DocumentType;
import woorifisa.project.backend.domain.user.repository.DocumentRepository;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.domain.user.service.NotificationService;
import woorifisa.project.backend.domain.user.service.UserDocumentS3Uploader;
import woorifisa.project.backend.global.corebanking.dto.request.CoreBankingCreateCustomerRequest;
import woorifisa.project.backend.global.exception.CustomException;
import woorifisa.project.backend.global.corebanking.client.CoreBankingClient;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminService {

	private final UserRepository userRepository;
	private final DocumentRepository documentRepository;
	private final UserDocumentS3Uploader userDocumentS3Uploader;
	private final CoreBankingClient coreBankingClient;
	private final NotificationService notificationService;

	@Transactional
	public void reviewDocument(Long userId, String documentTypeValue, String targetStatusValue, String missing) {
		log.info("[admin_review:requested] userId={}, documentType={}, targetStatus={}",
			userId, documentTypeValue, targetStatusValue);
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

		try {
			String reviewedMissing = targetStatus == DocumentStatus.APPROVED ? null : missing;
			document.changeStatus(updatedFileUrl, targetStatus, reviewedMissing);
				documentRepository.save(document);
				log.info("[admin_review:status_updated] userId={}, documentType={}, from={}, to={}",
					userId, documentType, previousStatus, targetStatus);

				// 심사 결과에 맞춰 보완 보완/승인 완료 알림을 최신 1건으로 갱신한다.
				createDocumentReviewNotification(user, targetStatus);

				// 해당 유저의 서류 2개가 모두 APPROVED 상태라면, 인증서 발급
				if (targetStatus == DocumentStatus.APPROVED) {
					updateCertificateIfAllDocumentsApproved(user);
				}
		} catch (RuntimeException exception) {
			rollbackS3Status(userId, documentType, targetStatus, previousStatus, exception);
			throw exception;
		}
	}

	private DocumentType parseDocumentType(String rawDocumentType) {
		if (rawDocumentType == null) {
			throw new CustomException(INVALID_DOCUMENT_TYPE);
		}

		return switch (rawDocumentType) {
			case "ALIEN_REGISTRATION_APPLICATION", "ALIEN_REGISTRATION_SUPPORTING_DOCUMENT" ->
				DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT;
			case "RESIDENCE_PROOF", "RESIDENCE_VERIFICATION_DOCUMENT" ->
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

	private void updateCertificateIfAllDocumentsApproved(User user) {
		boolean alienApproved = isLatestApproved(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT);
		boolean residenceApproved = isLatestApproved(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT);
		log.info("[certificate:eligibility_checked] userId={}, alienApproved={}, residenceApproved={}, certificateStatus={}",
			user.getUserId(), alienApproved, residenceApproved, user.getCertificateStatus());

		if (alienApproved && residenceApproved && user.getCertificateStatus() != CertificateStatus.ISSUED) {
			user.issueCertificate();
			log.info("[certificate:issued] userId={}, issuedTime={}", user.getUserId(), user.getIssuedTime());
			log.info("[certificate:core_banking_customer_create_requested] userId={}, name={}, email={}",
				user.getUserId(), user.getName(), user.getEmail());
			coreBankingClient.createCustomer(CoreBankingCreateCustomerRequest.from(user));
			log.info("[certificate:core_banking_customer_create_completed] userId={}", user.getUserId());
		}
	}

	// 서류 심사 결과에 따라 보완 필요 또는 전체 승인 완료 알림을 생성한다.
	private void createDocumentReviewNotification(User user, DocumentStatus targetStatus) {
		if (!isAllDocumentsReviewed(user)) {
			return;
		}

		if (targetStatus == DocumentStatus.REJECTED || hasAnyRejectedDocument(user)) {
			notificationService.createOrReplaceSupplementDocumentNotification(user, "서류 심사 결과 보완이 필요합니다.");
			return;
		}

		if (targetStatus == DocumentStatus.APPROVED && isAllDocumentsApproved(user)) {
			notificationService.createOrReplaceSupplementDocumentNotification(user, "제출한 서류가 모두 승인되었습니다.");
		}
	}

	// 두 종류의 필수 문서 최신 상태가 모두 심사 완료(APPROVED/REJECTED)인지 확인한다.
	private boolean isAllDocumentsReviewed(User user) {
		return isLatestReviewed(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)
			&& isLatestReviewed(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT);
	}

	// 두 종류의 필수 문서 중 하나라도 최신 상태가 REJECTED인지 확인한다.
	private boolean hasAnyRejectedDocument(User user) {
		return isLatestRejected(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)
			|| isLatestRejected(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT);
	}

	// 두 종류의 필수 문서 최신 상태가 모두 APPROVED인지 확인한다.
	private boolean isAllDocumentsApproved(User user) {
		boolean alienApproved = isLatestApproved(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT);
		boolean residenceApproved = isLatestApproved(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT);
		return alienApproved && residenceApproved;
	}

	private boolean isLatestReviewed(User user, DocumentType documentType) {
		return documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, documentType)
			.map(document -> document.getStatus() == DocumentStatus.APPROVED || document.getStatus() == DocumentStatus.REJECTED)
			.orElse(false);
	}

	private boolean isLatestApproved(User user, DocumentType documentType) {
		return documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, documentType)
			.map(document -> document.getStatus() == DocumentStatus.APPROVED)
			.orElse(false);
	}

	private boolean isLatestRejected(User user, DocumentType documentType) {
		return documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, documentType)
			.map(document -> document.getStatus() == DocumentStatus.REJECTED)
			.orElse(false);
	}

	private void rollbackS3Status(
		Long userId,
		DocumentType documentType,
		DocumentStatus currentStatus,
		DocumentStatus previousStatus,
		RuntimeException originalException
	) {
		try {
			userDocumentS3Uploader.renameStatus(userId, documentType, currentStatus, previousStatus);
			log.warn(
				"[admin_review:s3_rollback_completed] userId={}, documentType={}, from={}, to={}",
				userId,
				documentType,
				currentStatus,
				previousStatus
			);
		} catch (RuntimeException rollbackException) {
			log.error(
				"[admin_review:s3_rollback_failed] userId={}, documentType={}, from={}, to={}, originalReason={}, rollbackReason={}",
				userId,
				documentType,
				currentStatus,
				previousStatus,
				originalException.getMessage(),
				rollbackException.getMessage(),
				rollbackException
			);
		}
	}
}

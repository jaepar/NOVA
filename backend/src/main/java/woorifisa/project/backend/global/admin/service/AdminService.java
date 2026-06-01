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
import woorifisa.project.backend.domain.user.service.UserDocumentS3Uploader;
import woorifisa.project.backend.domain.banking.dto.corebanking.request.CoreBankingCreateCustomerRequest;
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
			// 발급 전 사용자만 신청 중 상태를 거쳐 최종 발급으로 전이한다.
			if (user.getCertificateStatus() == CertificateStatus.NOT_ISSUED) {
				user.startCertificateIssuance();
			}
			user.issueCertificate();
			log.info("[certificate:issued] userId={}, issuedTime={}", user.getUserId(), user.getIssuedTime());
			log.info("[certificate:core_banking_customer_create_requested] userId={}, name={}, email={}",
				user.getUserId(), user.getName(), user.getEmail());
			coreBankingClient.createCustomer(CoreBankingCreateCustomerRequest.from(user));
			log.info("[certificate:core_banking_customer_create_completed] userId={}", user.getUserId());
		}
	}

	private boolean isLatestApproved(User user, DocumentType documentType) {
		return documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, documentType)
			.map(document -> document.getStatus() == DocumentStatus.APPROVED)
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

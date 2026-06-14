package woorifisa.project.backend.global.admin.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.DOCUMENT_REVIEW_SOURCE_STATUS_INVALID;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import woorifisa.project.backend.domain.user.entity.Document;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.CertificateStatus;
import woorifisa.project.backend.domain.user.entity.enums.DocumentRejectionReasonCode;
import woorifisa.project.backend.domain.user.entity.enums.DocumentStatus;
import woorifisa.project.backend.domain.user.entity.enums.DocumentType;
import woorifisa.project.backend.domain.user.repository.DocumentRepository;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.domain.user.service.NotificationService;
import woorifisa.project.backend.domain.user.service.UserDocumentS3Uploader;
import woorifisa.project.backend.global.corebanking.client.CoreBankingClient;
import woorifisa.project.backend.global.exception.CustomException;

@ExtendWith(MockitoExtension.class)
class AdminDocumentReviewServiceTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private DocumentRepository documentRepository;

	@Mock
	private UserDocumentS3Uploader userDocumentS3Uploader;

	@Mock
	private CoreBankingClient coreBankingClient;

	@Mock
	private NotificationService notificationService;

	@InjectMocks
	private AdminService adminDocumentReviewService;

	@Test
	@DisplayName("관리자 심사 시 PENDING 문서를 APPROVED로 변경하고 S3 상태를 변경한다")
	void reviewPendingDocumentToApproved() {
		Long userId = 1L;
		User user = User.builder().userId(userId).certificateStatus(CertificateStatus.PENDING).build();
		Document latestResidence = Document.builder()
			.user(user)
			.documentType(DocumentType.RESIDENCE_VERIFICATION_DOCUMENT)
			.status(DocumentStatus.PENDING)
			.fileUrl("https://s3/documents/1_RESIDENCE_VERIFICATION_DOCUMENT_PENDING.pdf")
			.build();
		Document latestAlienApproved = Document.builder()
			.user(user)
			.documentType(DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)
			.status(DocumentStatus.APPROVED)
			.fileUrl("https://s3/documents/1_ALIEN_REGISTRATION_SUPPORTING_DOCUMENT_APPROVED.pdf")
			.build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT))
			.thenReturn(Optional.of(latestResidence));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT))
			.thenReturn(Optional.of(latestAlienApproved));
		when(userDocumentS3Uploader.renameStatus(
			userId,
			DocumentType.RESIDENCE_VERIFICATION_DOCUMENT,
			DocumentStatus.PENDING,
			DocumentStatus.APPROVED
		)).thenReturn("https://s3/documents/1_RESIDENCE_VERIFICATION_DOCUMENT_APPROVED.pdf");

		adminDocumentReviewService.reviewDocument(
			userId,
			"RESIDENCE_PROOF",
			"APPROVED",
			List.of(DocumentRejectionReasonCode.DOCUMENT_NAME_MISMATCH)
		);

		assertThat(latestResidence.getStatus()).isEqualTo(DocumentStatus.APPROVED);
		assertThat(latestResidence.getMissing()).isNull();
		assertThat(user.getCertificateStatus()).isEqualTo(CertificateStatus.ISSUED);
		assertThat(user.getIssuedTime()).isNotNull();
		verify(documentRepository).save(latestResidence);
		verify(coreBankingClient).createCustomer(org.mockito.ArgumentMatchers.any());
		verify(notificationService).createOrReplaceSupplementDocumentNotification(user, "제출한 서류가 모두 승인되었습니다.");
		verify(notificationService).createOrReplaceCertificateIssuedNotification(user, "인증서 발급이 완료되었습니다.");
		verify(notificationService).deleteSupplementDocumentNotification(user);
	}

	@Test
	@DisplayName("관리자 심사 시 MODIFIED 문서를 REJECTED로 변경하고 missing을 저장한다")
	void reviewModifiedDocumentToRejected() {
		Long userId = 1L;
		User user = User.builder().userId(userId).build();
		Document latestAlien = Document.builder()
			.user(user)
			.documentType(DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)
			.status(DocumentStatus.MODIFIED)
			.fileUrl("https://s3/documents/1_ALIEN_REGISTRATION_SUPPORTING_DOCUMENT_MODIFIED.pdf")
			.build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT))
			.thenReturn(Optional.of(latestAlien));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT))
			.thenReturn(Optional.empty());
		when(userDocumentS3Uploader.renameStatus(
			userId,
			DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT,
			DocumentStatus.MODIFIED,
			DocumentStatus.REJECTED
		)).thenReturn("https://s3/documents/1_ALIEN_REGISTRATION_SUPPORTING_DOCUMENT_REJECTED.pdf");

		adminDocumentReviewService.reviewDocument(
			userId,
			"ALIEN_REGISTRATION_APPLICATION",
			"REJECTED",
			List.of(
				DocumentRejectionReasonCode.ALIEN_REGISTRATION_APPLICATION_DATE_MISSING,
				DocumentRejectionReasonCode.DOCUMENT_NAME_MISMATCH
			)
		);

		assertThat(latestAlien.getStatus()).isEqualTo(DocumentStatus.REJECTED);
		assertThat(latestAlien.getMissing()).isEqualTo("ALIEN_REGISTRATION_APPLICATION_DATE_MISSING,DOCUMENT_NAME_MISMATCH");
		verify(documentRepository).save(latestAlien);
		verify(notificationService, never()).createOrReplaceSupplementDocumentNotification(user, "서류 심사 결과 보완이 필요합니다.");
	}

	@Test
	@DisplayName("관리자 심사 시 두 문서가 모두 심사 완료 상태이고 하나라도 REJECTED면 보완 알림을 생성한다")
	void createSupplementNotificationWhenAllReviewedAndAnyRejected() {
		Long userId = 1L;
		User user = User.builder().userId(userId).build();
		Document latestAlien = Document.builder()
			.user(user)
			.documentType(DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)
			.status(DocumentStatus.MODIFIED)
			.fileUrl("https://s3/documents/1_ALIEN_REGISTRATION_SUPPORTING_DOCUMENT_MODIFIED.pdf")
			.build();
		Document latestResidenceRejected = Document.builder()
			.user(user)
			.documentType(DocumentType.RESIDENCE_VERIFICATION_DOCUMENT)
			.status(DocumentStatus.REJECTED)
			.fileUrl("https://s3/documents/1_RESIDENCE_VERIFICATION_DOCUMENT_REJECTED.pdf")
			.build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT))
			.thenReturn(Optional.of(latestAlien));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT))
			.thenReturn(Optional.of(latestResidenceRejected));
		when(userDocumentS3Uploader.renameStatus(
			userId,
			DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT,
			DocumentStatus.MODIFIED,
			DocumentStatus.REJECTED
		)).thenReturn("https://s3/documents/1_ALIEN_REGISTRATION_SUPPORTING_DOCUMENT_REJECTED.pdf");

		adminDocumentReviewService.reviewDocument(
			userId,
			"ALIEN_REGISTRATION_APPLICATION",
			"REJECTED",
			List.of(DocumentRejectionReasonCode.ALIEN_REGISTRATION_APPLICATION_DATE_MISSING)
		);

		verify(notificationService).createOrReplaceSupplementDocumentNotification(user, "서류 심사 결과 보완이 필요합니다.");
	}

	@Test
	@DisplayName("관리자 심사 시 현재 상태가 PENDING 또는 MODIFIED가 아니면 예외가 발생한다")
	void reviewDocumentFailsWhenSourceStatusIsNotReviewable() {
		Long userId = 1L;
		User user = User.builder().userId(userId).build();
		Document reviewedDocument = Document.builder()
			.user(user)
			.documentType(DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)
			.status(DocumentStatus.REJECTED)
			.fileUrl("https://s3/documents/1_ALIEN_REGISTRATION_SUPPORTING_DOCUMENT_REJECTED.pdf")
			.build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT))
			.thenReturn(Optional.of(reviewedDocument));

		assertThatThrownBy(() -> adminDocumentReviewService.reviewDocument(userId, "ALIEN_REGISTRATION_APPLICATION", "APPROVED", null))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(DOCUMENT_REVIEW_SOURCE_STATUS_INVALID);
	}

	@Test
	@DisplayName("이미 인증서가 발급된 사용자는 재승인 시 coreBanking 고객 생성을 재호출하지 않는다")
	void doesNotCreateCoreBankingCustomerWhenAlreadyIssued() {
		Long userId = 1L;
		User user = User.builder().userId(userId).certificateStatus(CertificateStatus.ISSUED).build();
		Document latestResidence = Document.builder()
			.user(user)
			.documentType(DocumentType.RESIDENCE_VERIFICATION_DOCUMENT)
			.status(DocumentStatus.PENDING)
			.fileUrl("https://s3/documents/1_RESIDENCE_VERIFICATION_DOCUMENT_PENDING.pdf")
			.build();
		Document latestAlienApproved = Document.builder()
			.user(user)
			.documentType(DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)
			.status(DocumentStatus.APPROVED)
			.fileUrl("https://s3/documents/1_ALIEN_REGISTRATION_SUPPORTING_DOCUMENT_APPROVED.pdf")
			.build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT))
			.thenReturn(Optional.of(latestResidence));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT))
			.thenReturn(Optional.of(latestAlienApproved));
		when(userDocumentS3Uploader.renameStatus(
			userId,
			DocumentType.RESIDENCE_VERIFICATION_DOCUMENT,
			DocumentStatus.PENDING,
			DocumentStatus.APPROVED
		)).thenReturn("https://s3/documents/1_RESIDENCE_VERIFICATION_DOCUMENT_APPROVED.pdf");

		adminDocumentReviewService.reviewDocument(userId, "RESIDENCE_PROOF", "APPROVED", null);

			verify(coreBankingClient, never()).createCustomer(org.mockito.ArgumentMatchers.any());
			verify(notificationService).createOrReplaceSupplementDocumentNotification(user, "제출한 서류가 모두 승인되었습니다.");
	}

	@Test
	@DisplayName("코어뱅킹 고객 생성 실패 시 S3 상태를 원복한다")
	void rollbackS3WhenCoreBankingCreateCustomerFails() {
		Long userId = 1L;
		User user = User.builder().userId(userId).certificateStatus(CertificateStatus.NOT_ISSUED).build();
		Document latestResidence = Document.builder()
			.user(user)
			.documentType(DocumentType.RESIDENCE_VERIFICATION_DOCUMENT)
			.status(DocumentStatus.PENDING)
			.fileUrl("https://s3/documents/1_RESIDENCE_VERIFICATION_DOCUMENT_PENDING.pdf")
			.build();
		Document latestAlienApproved = Document.builder()
			.user(user)
			.documentType(DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)
			.status(DocumentStatus.APPROVED)
			.fileUrl("https://s3/documents/1_ALIEN_REGISTRATION_SUPPORTING_DOCUMENT_APPROVED.pdf")
			.build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT))
			.thenReturn(Optional.of(latestResidence));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT))
			.thenReturn(Optional.of(latestAlienApproved));
		when(userDocumentS3Uploader.renameStatus(
			userId,
			DocumentType.RESIDENCE_VERIFICATION_DOCUMENT,
			DocumentStatus.PENDING,
			DocumentStatus.APPROVED
		)).thenReturn("https://s3/documents/1_RESIDENCE_VERIFICATION_DOCUMENT_APPROVED.pdf");
		doThrow(new CustomException(DOCUMENT_REVIEW_SOURCE_STATUS_INVALID))
			.when(coreBankingClient).createCustomer(org.mockito.ArgumentMatchers.any());

		assertThatThrownBy(() -> adminDocumentReviewService.reviewDocument(userId, "RESIDENCE_PROOF", "APPROVED", null))
			.isInstanceOf(CustomException.class);

		verify(userDocumentS3Uploader, times(1)).renameStatus(
			userId,
			DocumentType.RESIDENCE_VERIFICATION_DOCUMENT,
			DocumentStatus.APPROVED,
			DocumentStatus.PENDING
		);
	}
}

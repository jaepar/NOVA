package woorifisa.project.backend.global.admin.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.DOCUMENT_REVIEW_SOURCE_STATUS_INVALID;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import woorifisa.project.backend.domain.user.entity.Document;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.DocumentStatus;
import woorifisa.project.backend.domain.user.entity.enums.DocumentType;
import woorifisa.project.backend.domain.user.repository.DocumentRepository;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.domain.user.service.UserDocumentS3Uploader;
import woorifisa.project.backend.global.exception.CustomException;

@ExtendWith(MockitoExtension.class)
class AdminDocumentReviewServiceTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private DocumentRepository documentRepository;

	@Mock
	private UserDocumentS3Uploader userDocumentS3Uploader;

	@InjectMocks
	private AdminService adminDocumentReviewService;

	@Test
	@DisplayName("관리자 심사 시 PENDING 문서를 APPROVED로 변경하고 S3 상태를 변경한다")
	void reviewPendingDocumentToApproved() {
		Long userId = 1L;
		User user = User.builder().userId(userId).build();
		Document latestResidence = Document.builder()
			.user(user)
			.documentType(DocumentType.RESIDENCE_VERIFICATION_DOCUMENT)
			.status(DocumentStatus.PENDING)
			.fileUrl("https://s3/documents/1_RESIDENCE_VERIFICATION_DOCUMENT_PENDING.pdf")
			.build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT))
			.thenReturn(Optional.of(latestResidence));
		when(userDocumentS3Uploader.renameStatus(
			userId,
			DocumentType.RESIDENCE_VERIFICATION_DOCUMENT,
			DocumentStatus.PENDING,
			DocumentStatus.APPROVED
		)).thenReturn("https://s3/documents/1_RESIDENCE_VERIFICATION_DOCUMENT_APPROVED.pdf");

		adminDocumentReviewService.reviewDocument(userId, "RESIDENCE_PROOF", "APPROVED", "name");

		assertThat(latestResidence.getStatus()).isEqualTo(DocumentStatus.APPROVED);
		assertThat(latestResidence.getMissing()).isNull();
		verify(documentRepository).save(latestResidence);
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
		when(userDocumentS3Uploader.renameStatus(
			userId,
			DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT,
			DocumentStatus.MODIFIED,
			DocumentStatus.REJECTED
		)).thenReturn("https://s3/documents/1_ALIEN_REGISTRATION_SUPPORTING_DOCUMENT_REJECTED.pdf");

		adminDocumentReviewService.reviewDocument(userId, "ALIEN_REGISTRATION_APPLICATION", "REJECTED", "issue_date,signature");

		assertThat(latestAlien.getStatus()).isEqualTo(DocumentStatus.REJECTED);
		assertThat(latestAlien.getMissing()).isEqualTo("issue_date,signature");
		verify(documentRepository).save(latestAlien);
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
}

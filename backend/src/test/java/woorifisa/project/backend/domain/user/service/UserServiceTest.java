package woorifisa.project.backend.domain.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import woorifisa.project.backend.domain.user.entity.Document;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.DocumentStatus;
import woorifisa.project.backend.domain.user.entity.enums.DocumentType;
import woorifisa.project.backend.domain.user.repository.DocumentRepository;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.exception.CustomException;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private DocumentRepository documentRepository;

	@Mock
	private UserDocumentS3Uploader userDocumentS3Uploader;

	@InjectMocks
	private UserService userService;

	@Test
	@DisplayName("최초 업로드 시 대기 상태 문서 2개를 저장한다")
	void initialUploadSuccess() {
		Long userId = 1L;
		User user = User.builder().userId(userId).build();
		MockMultipartFile residencePdf = new MockMultipartFile("residenceVerificationPdf", "residence.pdf", "application/pdf", "residence".getBytes());
		MockMultipartFile alienPdf = new MockMultipartFile("alienRegistrationApplicationPdf", "alien.pdf", "application/pdf", "alien".getBytes());

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.existsByUser(user)).thenReturn(false);
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT)).thenReturn(Optional.empty());
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)).thenReturn(Optional.empty());
		when(userDocumentS3Uploader.upload(userId, residencePdf, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT, DocumentStatus.PENDING))
			.thenReturn("https://s3/documents/1_RESIDENCE_VERIFICATION_DOCUMENT_PENDING.pdf");
		when(userDocumentS3Uploader.upload(userId, alienPdf, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT, DocumentStatus.PENDING))
			.thenReturn("https://s3/documents/1_ALIEN_REGISTRATION_SUPPORTING_DOCUMENT_PENDING.pdf");

		userService.uploadDocuments(userId, residencePdf, alienPdf);

		ArgumentCaptor<Document> captor = ArgumentCaptor.forClass(Document.class);
		verify(documentRepository, times(2)).save(captor.capture());
		assertThat(captor.getAllValues()).extracting(Document::getStatus)
			.containsExactlyInAnyOrder(DocumentStatus.PENDING, DocumentStatus.PENDING);
	}

	@Test
	@DisplayName("최초 업로드는 두 파일이 모두 필요하다")
	void initialUploadRequiresBothFiles() {
		Long userId = 1L;
		User user = User.builder().userId(userId).build();
		MockMultipartFile residencePdf = new MockMultipartFile("residenceVerificationPdf", "residence.pdf", "application/pdf", "residence".getBytes());

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.existsByUser(user)).thenReturn(false);

		assertThatThrownBy(() -> userService.uploadDocuments(userId, residencePdf, null))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(INITIAL_DOCUMENT_BOTH_REQUIRED);
	}

	@Test
	@DisplayName("보완 업로드는 반려된 문서만 허용한다")
	void reuploadOnlyRejectedAllowed() {
		Long userId = 1L;
		User user = User.builder().userId(userId).build();
		MockMultipartFile alienPdf = new MockMultipartFile("alienRegistrationApplicationPdf", "alien.pdf", "application/pdf", "alien".getBytes());

		Document latestResidence = Document.builder().user(user).documentType(DocumentType.RESIDENCE_VERIFICATION_DOCUMENT)
			.status(DocumentStatus.REJECTED).fileUrl("old").build();
		Document latestAlien = Document.builder().user(user).documentType(DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)
			.status(DocumentStatus.APPROVED).fileUrl("old").build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.existsByUser(user)).thenReturn(true);
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT))
			.thenReturn(Optional.of(latestResidence));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT))
			.thenReturn(Optional.of(latestAlien));

		assertThatThrownBy(() -> userService.uploadDocuments(userId, null, alienPdf))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(REUPLOAD_ONLY_REJECTED_ALLOWED);
	}

	@Test
	@DisplayName("두 문서가 모두 반려된 경우 두 파일 모두 필수다")
	void reuploadRequiresBothWhenBothRejected() {
		Long userId = 1L;
		User user = User.builder().userId(userId).build();
		MockMultipartFile residencePdf = new MockMultipartFile("residenceVerificationPdf", "residence.pdf", "application/pdf", "residence".getBytes());

		Document latestResidence = Document.builder().user(user).documentType(DocumentType.RESIDENCE_VERIFICATION_DOCUMENT)
			.status(DocumentStatus.REJECTED).fileUrl("old").build();
		Document latestAlien = Document.builder().user(user).documentType(DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)
			.status(DocumentStatus.REJECTED).fileUrl("old").build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.existsByUser(user)).thenReturn(true);
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT))
			.thenReturn(Optional.of(latestResidence));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT))
			.thenReturn(Optional.of(latestAlien));

		assertThatThrownBy(() -> userService.uploadDocuments(userId, residencePdf, null))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(REUPLOAD_ALL_REJECTED_REQUIRED);
	}

	@Test
	@DisplayName("보완 업로드 시 기존 반려 문서의 S3 객체를 삭제한 뒤 MODIFIED로 업로드한다")
	void reuploadDeletesRejectedObjectBeforeModifiedUpload() {
		Long userId = 1L;
		User user = User.builder().userId(userId).build();
		MockMultipartFile residencePdf = new MockMultipartFile("residenceVerificationPdf", "residence.pdf", "application/pdf", "residence".getBytes());
		MockMultipartFile alienPdf = new MockMultipartFile("alienRegistrationApplicationPdf", "alien.pdf", "application/pdf", "alien".getBytes());

		Document latestResidence = Document.builder().user(user).documentType(DocumentType.RESIDENCE_VERIFICATION_DOCUMENT)
			.status(DocumentStatus.REJECTED).fileUrl("old").build();
		Document latestAlien = Document.builder().user(user).documentType(DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)
			.status(DocumentStatus.REJECTED).fileUrl("old").build();

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.existsByUser(user)).thenReturn(true);
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT))
			.thenReturn(Optional.of(latestResidence));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT))
			.thenReturn(Optional.of(latestAlien));
		when(userDocumentS3Uploader.upload(userId, residencePdf, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT, DocumentStatus.MODIFIED))
			.thenReturn("https://s3/documents/1_RESIDENCE_VERIFICATION_DOCUMENT_MODIFIED.pdf");
		when(userDocumentS3Uploader.upload(userId, alienPdf, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT, DocumentStatus.MODIFIED))
			.thenReturn("https://s3/documents/1_ALIEN_REGISTRATION_SUPPORTING_DOCUMENT_MODIFIED.pdf");

		userService.uploadDocuments(userId, residencePdf, alienPdf);

		verify(userDocumentS3Uploader).deleteByStatus(userId, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT, DocumentStatus.REJECTED);
		verify(userDocumentS3Uploader).deleteByStatus(userId, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT, DocumentStatus.REJECTED);
	}

	@Test
	@DisplayName("사용자를 찾을 수 없으면 예외가 발생한다")
	void userNotFound() {
		Long userId = 1L;
		MockMultipartFile residencePdf = new MockMultipartFile("residenceVerificationPdf", "residence.pdf", "application/pdf", "residence".getBytes());
		MockMultipartFile alienPdf = new MockMultipartFile("alienRegistrationApplicationPdf", "alien.pdf", "application/pdf", "alien".getBytes());

		when(userRepository.findById(userId)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> userService.uploadDocuments(userId, residencePdf, alienPdf))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(USER_NOT_FOUND);
	}
}

package woorifisa.project.backend.domain.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import java.util.List;
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
	@DisplayName("initial upload requires both files and saves pending")
	void initialUploadSuccess() {
		Long userId = 1L;
		User user = User.builder().userId(userId).build();
		MockMultipartFile residencePdf = new MockMultipartFile("residenceVerificationPdf", "residence.pdf", "application/pdf", "residence".getBytes());
		MockMultipartFile alienPdf = new MockMultipartFile("alienRegistrationApplicationPdf", "alien.pdf", "application/pdf", "alien".getBytes());

		when(userRepository.findById(userId)).thenReturn(Optional.of(user));
		when(documentRepository.existsByUser(user)).thenReturn(false);
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT)).thenReturn(Optional.empty());
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)).thenReturn(Optional.empty());
		when(userDocumentS3Uploader.createUrl(userId, residencePdf, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT, DocumentStatus.PENDING)).thenReturn("https://s3/documents/1_RESIDENCE_VERIFICATION_DOCUMENT_PENDING.pdf");
		when(userDocumentS3Uploader.createUrl(userId, alienPdf, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT, DocumentStatus.PENDING)).thenReturn("https://s3/documents/1_ALIEN_REGISTRATION_SUPPORTING_DOCUMENT_PENDING.pdf");

		userService.uploadDocuments(userId, residencePdf, alienPdf);

		ArgumentCaptor<Document> captor = ArgumentCaptor.forClass(Document.class);
		verify(documentRepository, org.mockito.Mockito.times(2)).save(captor.capture());
		assertThat(captor.getAllValues()).extracting(Document::getStatus)
			.containsExactlyInAnyOrder(DocumentStatus.PENDING, DocumentStatus.PENDING);
	}

	@Test
	@DisplayName("initial upload fails when one file is missing")
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
	@DisplayName("correction allows only rejected type")
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
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT)).thenReturn(Optional.of(latestResidence));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)).thenReturn(Optional.of(latestAlien));

		assertThatThrownBy(() -> userService.uploadDocuments(userId, null, alienPdf))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(REUPLOAD_ONLY_REJECTED_ALLOWED);
	}

	@Test
	@DisplayName("when both rejected, both must be reuploaded")
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
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT)).thenReturn(Optional.of(latestResidence));
		when(documentRepository.findTopByUserAndDocumentTypeOrderByDocumentIdDesc(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT)).thenReturn(Optional.of(latestAlien));

		assertThatThrownBy(() -> userService.uploadDocuments(userId, residencePdf, null))
			.isInstanceOf(CustomException.class)
			.extracting("exceptionStatus")
			.isEqualTo(REUPLOAD_ALL_REJECTED_REQUIRED);
	}

	@Test
	@DisplayName("user not found")
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

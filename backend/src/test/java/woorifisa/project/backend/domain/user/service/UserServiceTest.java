package woorifisa.project.backend.domain.user.service;

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
import woorifisa.project.backend.domain.user.entity.enums.DocumentType;
import woorifisa.project.backend.domain.user.repository.DocumentRepository;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.exception.CustomException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.INVALID_DOCUMENT_FILE;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.USER_NOT_FOUND;

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
    @DisplayName("uploadDocumentsSuccess")
    void uploadDocumentsSuccess() {
        Long userId = 1L;
        User user = User.builder().userId(userId).build();

        MockMultipartFile residencePdf = new MockMultipartFile("residenceVerificationPdf", "residence.pdf", "application/pdf", "residence".getBytes());
        MockMultipartFile alienPdf = new MockMultipartFile("alienRegistrationApplicationPdf", "alien.pdf", "application/pdf", "alien".getBytes());

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userDocumentS3Uploader.createUrl(userId, residencePdf, "residence")).thenReturn("https://s3/documents/residence.pdf");
        when(userDocumentS3Uploader.createUrl(userId, alienPdf, "alien")).thenReturn("https://s3/documents/alien.pdf");

        userService.uploadDocuments(userId, residencePdf, alienPdf);

        ArgumentCaptor<List<Document>> captor = ArgumentCaptor.forClass(List.class);
        verify(documentRepository).saveAll(captor.capture());
        List<Document> saved = captor.getValue();

        assertThat(saved).hasSize(2);
        assertThat(saved).extracting(Document::getDocumentType)
                .containsExactlyInAnyOrder(
                        DocumentType.RESIDENCE_VERIFICATION_DOCUMENT,
                        DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT
                );
        assertThat(saved).extracting(Document::getFileUrl)
                .containsExactlyInAnyOrder("https://s3/documents/residence.pdf", "https://s3/documents/alien.pdf");
    }

    @Test
    @DisplayName("invalidContentType")
    void invalidContentType() {
        Long userId = 1L;
        User user = User.builder().userId(userId).build();

        MockMultipartFile residencePdf = new MockMultipartFile("residenceVerificationPdf", "residence.txt", "text/plain", "residence".getBytes());
        MockMultipartFile alienPdf = new MockMultipartFile("alienRegistrationApplicationPdf", "alien.pdf", "application/pdf", "alien".getBytes());

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> userService.uploadDocuments(userId, residencePdf, alienPdf))
                .isInstanceOf(CustomException.class)
                .extracting("exceptionStatus")
                .isEqualTo(INVALID_DOCUMENT_FILE);
    }

    @Test
    @DisplayName("userNotFound")
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

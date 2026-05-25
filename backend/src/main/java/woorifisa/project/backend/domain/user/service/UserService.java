package woorifisa.project.backend.domain.user.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import woorifisa.project.backend.domain.user.entity.Document;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.entity.enums.DocumentStatus;
import woorifisa.project.backend.domain.user.entity.enums.DocumentType;
import woorifisa.project.backend.domain.user.repository.DocumentRepository;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.global.exception.CustomException;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	private final DocumentRepository documentRepository;
	private final UserDocumentS3Uploader userDocumentS3Uploader;

	@Transactional
	public void uploadDocuments(
		Long userId,
		MultipartFile residenceVerificationPdf,
		MultipartFile alienRegistrationApplicationPdf
	) {
		// 유저 로딩
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(USER_NOT_FOUND));

		// 파일 유효성 검사
		validatePdfFile(residenceVerificationPdf);
		validatePdfFile(alienRegistrationApplicationPdf);

		// 파일 URL 생성
		String residenceFileUrl = userDocumentS3Uploader.createUrl(userId, residenceVerificationPdf, "residence");
		String alienFileUrl = userDocumentS3Uploader.createUrl(userId, alienRegistrationApplicationPdf, "alien");

		// Document 객체 생성
		Document residenceDocument = createDocument(user, DocumentType.RESIDENCE_VERIFICATION_DOCUMENT,
			residenceFileUrl);
		Document alienDocument = createDocument(user, DocumentType.ALIEN_REGISTRATION_SUPPORTING_DOCUMENT,
			alienFileUrl);

		// 저장
		documentRepository.saveAll(List.of(residenceDocument, alienDocument));
	}

	private Document createDocument(User user, DocumentType documentType,
		String fileUrl) {  // 입력받은 PDF를 Document 객체로 변환
		return Document.builder()
			.user(user)
			.documentType(documentType)
			.fileUrl(fileUrl)
			.status(DocumentStatus.PENDING)  // 초기 상태 고정
			.build();
	}

	private void validatePdfFile(MultipartFile file) {  //  파일 유형 검증 -> 클라이언트에서 1차 필터링
		if (file == null || file.isEmpty() || !"application/pdf".equalsIgnoreCase(file.getContentType())) {
			throw new CustomException(INVALID_DOCUMENT_FILE);
		}
	}
}

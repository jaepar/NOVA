package woorifisa.project.backend.domain.user.service;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import woorifisa.project.backend.domain.user.dto.request.OcrDocumentType;
import woorifisa.project.backend.domain.user.dto.response.IdentityVerificationResponse;
import woorifisa.project.backend.domain.user.dto.response.ocr.IdCardOcrResponse;
import woorifisa.project.backend.domain.user.dto.response.ocr.PassportOcrResponse;
import woorifisa.project.backend.domain.user.entity.User;
import woorifisa.project.backend.domain.user.repository.UserRepository;
import woorifisa.project.backend.domain.user.service.ocr.IdCardOcrService;
import woorifisa.project.backend.domain.user.service.ocr.PassportOcrService;
import woorifisa.project.backend.global.exception.CustomException;
import woorifisa.project.backend.global.government.client.GovernmentIdentityClient;
import woorifisa.project.backend.global.government.client.response.GovermentIdentityResponse;
import woorifisa.project.backend.global.security.RegistrationNumberHmacHasher;

@Service
@RequiredArgsConstructor
public class IdentityVerificationService {

	private final PassportOcrService passportOcrService;
	private final IdCardOcrService idCardOcrService;
	private final UserRepository userRepository;
	private final GovernmentIdentityClient governmentIdentityClient;
	private final RegistrationNumberHmacHasher registrationNumberHmacHasher;
	private final NotificationService notificationService;

	@Transactional
	public IdentityVerificationResponse verifyIdentity(Long userId, MultipartFile file, OcrDocumentType ocrDocumentType) {
		if (ocrDocumentType == null) {
			throw new CustomException(IDENTITY_OCR_INVALID_DOCUMENT_TYPE);
		}

		return switch (ocrDocumentType) {
			case PASSPORT -> verifyPassport(userId, file);
			case ID_CARD -> verifyIdCard(userId, file);
		};
	}

	// 여권 인증
	private IdentityVerificationResponse verifyPassport(Long userId, MultipartFile file) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(USER_NOT_FOUND));

		PassportOcrResponse passportOcrResponse = passportOcrService.recognizePassport(file);
		if(!passportOcrResponse.fullNameKor().equals(user.getName())) {
			return IdentityVerificationResponse.builder()
				.ocrDocumentType(OcrDocumentType.PASSPORT)
				.result(passportOcrResponse)
				.nameMatchWithUser(false)
				.identityMatchWithGovDb(false)
				.verificationStatus("FAILED")
				.failureReasonCode("IDENTITY_NAME_MISMATCH_WITH_USER")
				.build();
		}

		return IdentityVerificationResponse.builder()
			.ocrDocumentType(OcrDocumentType.PASSPORT)
			.result(passportOcrResponse)
			.nameMatchWithUser(true)
			.verificationStatus("OCR_EXTRACTED")
			.build();
	}

	// 외국인 등록증(신분증) 인증
	private IdentityVerificationResponse verifyIdCard(Long userId, MultipartFile file) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(USER_NOT_FOUND));

		IdCardOcrResponse idCard = idCardOcrService.recognizeIdCard(file);
		boolean nameMatchWithUser = normalizeName(idCard.name()).equals(normalizeName(user.getName()));

		if (!nameMatchWithUser) {
			return IdentityVerificationResponse.builder()
				.ocrDocumentType(OcrDocumentType.ID_CARD)
				.result(idCard)
				.nameMatchWithUser(false)
				.identityMatchWithGovDb(false)
				.verificationStatus("FAILED")
				.failureReasonCode("IDENTITY_NAME_MISMATCH_WITH_USER")
				.build();
		}

		String registrationNumberHash = registrationNumberHmacHasher.hash(idCard.residentRegistrationNumber());
		GovermentIdentityResponse governmentIdentity =
			governmentIdentityClient.lookupByRegistrationNumberHash(registrationNumberHash);
		boolean identityMatchWithGovDb = isSameIdentity(idCard, governmentIdentity);

		if (!identityMatchWithGovDb) {
			return IdentityVerificationResponse.builder()
				.ocrDocumentType(OcrDocumentType.ID_CARD)
				.result(idCard)
				.nameMatchWithUser(true)
				.identityMatchWithGovDb(false)
				.verificationStatus("FAILED")
				.failureReasonCode("GOVERNMENT_IDENTITY_MISMATCH")
				.build();
		}

		user.registerResidenceCard();
		notificationService.deleteResidenceCardPeriodNotification(user);

		return IdentityVerificationResponse.builder()
			.ocrDocumentType(OcrDocumentType.ID_CARD)
			.result(idCard)
			.nameMatchWithUser(true)
			.identityMatchWithGovDb(true)
			.verificationStatus("VERIFIED")
			.failureReasonCode(null)
			.build();
	}

	private boolean isSameIdentity(IdCardOcrResponse idCard, GovermentIdentityResponse governmentIdentity) {
		return Boolean.TRUE.equals(governmentIdentity.active())
			&& normalizeName(idCard.name()).equals(normalizeName(governmentIdentity.name()))
			&& normalizeDigits(idCard.issueDate()).equals(normalizeDigits(governmentIdentity.issueDate()));
	}

	private String normalizeName(String value) {
		if (value == null) {
			return "";
		}
		return value.toUpperCase()
			.replaceAll("[^A-Z0-9가-힣]", "");
	}

	private String normalizeDigits(String value) {
		if (value == null) {
			return "";
		}
		return value.replaceAll("[^0-9]", "");
	}
}

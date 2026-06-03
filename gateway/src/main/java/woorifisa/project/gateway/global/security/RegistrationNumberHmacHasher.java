package woorifisa.project.gateway.global.security;

import static woorifisa.project.gateway.global.response.status.BaseExceptionResponseStatus.REGISTRATION_NUMBER_HMAC_SECRET_NOT_CONFIGURED;

import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import woorifisa.project.gateway.global.exception.CustomException;

@Component
public class RegistrationNumberHmacHasher {

	private static final String HMAC_ALGORITHM = "HmacSHA256";

	private final String secret;

	public RegistrationNumberHmacHasher(@Value("${identity.registration-number.hmac-secret}") String secret) {
		this.secret = secret;
	}

	public String hash(String registrationNumber) {
		if (secret == null || secret.isBlank()) {
			throw new CustomException(REGISTRATION_NUMBER_HMAC_SECRET_NOT_CONFIGURED);
		}

		try {
			Mac mac = Mac.getInstance(HMAC_ALGORITHM);
			mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
			return HexFormat.of().formatHex(mac.doFinal(normalize(registrationNumber).getBytes(StandardCharsets.UTF_8)));
		} catch (CustomException exception) {
			throw exception;
		} catch (Exception exception) {
			throw new CustomException(REGISTRATION_NUMBER_HMAC_SECRET_NOT_CONFIGURED);
		}
	}

	private String normalize(String value) {
		if (value == null) {
			return "";
		}
		return value.replaceAll("[^0-9]", "");
	}
}

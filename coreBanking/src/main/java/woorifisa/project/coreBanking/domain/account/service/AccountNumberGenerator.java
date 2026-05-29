package woorifisa.project.coreBanking.domain.account.service;

public class AccountNumberGenerator {
	private static final String FIXED_PREFIX = "1002"; // S=1, YYY=002

	public static String raw13(String serial8) {
		String c = modularCheckDigit(FIXED_PREFIX + serial8); // TODO: 금결원 확정식으로 교체
		return FIXED_PREFIX + c + serial8; // 숫자 13자리
	}

	public static String format(String raw13) {
		return raw13.substring(0, 4) + "-" + raw13.substring(4, 7) + "-" + raw13.substring(7, 13);
	}

	private static String modularCheckDigit(String twelveDigits) {
		// TODO: 확정 전 임시 로직
		int sum = 0;
		for (int i = 0; i < twelveDigits.length(); i++) {
			sum += twelveDigits.charAt(i) - '0';
		}
		return String.valueOf(sum % 10);
	}

	private AccountNumberGenerator() {
	}
}

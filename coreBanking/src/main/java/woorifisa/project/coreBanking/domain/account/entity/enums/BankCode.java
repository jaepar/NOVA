package woorifisa.project.coreBanking.domain.account.entity.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum BankCode {
    WOORI("020", "우리은행"),
    KOOKMIN("004", "국민은행"),
    SHINHAN("088", "신한은행"),
    NH("011", "농협은행"),
    HANA("081", "하나은행"),
    IBK("003", "기업은행"),
    SC("023", "SC제일은행"),
    CITI("027", "한국씨티은행"),
    DAEGU("031", "대구은행"),
    BUSAN("032", "부산은행"),
    KYONGNAM("039", "경남은행"),
    GWANGJU("034", "광주은행"),
    JEONBUK("037", "전북은행"),
    JEJU("035", "제주은행"),
    POST("071", "우체국");

    private final String code;
    private final String displayName;
}

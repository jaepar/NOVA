package woorifisa.project.coreBanking.domain.accountTransaction.entity.enums;

public enum TransactionType {
    SMART_WITHDRAWAL,  // 스마트 출금
    CASH_IC,           // 현금 IC
    CHECK_CARD,        // 체크카드
    ACCOUNT_TRANSFER,  // 계좌이체
    ATM_WITHDRAWAL,    // ATM 출금
    ATM_DEPOSIT,       // ATM 입금
    AUTO_DEBIT,        // 자동이체/자동출금
    FEE                // 수수료
}

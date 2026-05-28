package woorifisa.project.coreBanking.domain.accountTransaction.entity.enums;

public enum TransactionType {
    SMART_WITHDRAWAL,       // 스마트 출금
    CASH_IC,                // 현금 IC 거래
    CHECK_CARD,             // 체크카드 결제
    ACCOUNT_TRANSFER,       // 계좌 이체
    ATM_WITHDRAWAL,         // ATM 출금
    ATM_DEPOSIT,            // ATM 입금
    AUTO_DEBIT,             // 자동이체 출금
    WALLET_CHARGE,          // 월렛 충전
    FEE                     // 수수료
}

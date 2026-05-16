package woorifisa.project.coreBanking.domain.customer.entity.enums;

public enum FundSource {
    EARNED_AND_PENSION_INCOME,       // 1. 근로 및 연금소득
    BUSINESS_INCOME,                 // 2. 사업소득
    FINANCIAL_INCOME,                // 3. 이자·배당 등 금융소득
    REAL_ESTATE_INCOME,              // 4. 부동산 임대/매각 소득
    INHERITANCE_OR_GIFT,             // 5. 상속·증여
    LOAN_OR_BORROWING,               // 6. 대출금 및 차입금
    SAVINGS_OR_EXISTING_FUNDS,       // 7. 기존 저축/보유자금
    FAMILY_SUPPORT_OR_LIVING_EXPENSE,// 8. 가족지원금/생활비
    SCHOLARSHIP_OR_GOV_SUPPORT,      // 9. 장학금/정부지원금
    OVERSEAS_INCOME_OR_FOREX_INFLOW, // 10. 해외소득/외화반입
    OTHER                            // 11. 기타
}

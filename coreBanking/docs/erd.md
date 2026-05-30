# ERD

coreBanking 서버 JPA 엔티티 기준 ERD 문서.

## Diagram

```mermaid
erDiagram
  CUSTOMER {
    BIGINT customer_id PK
    VARCHAR_100 name
    VARCHAR_100 email
    VARCHAR_100 address
    VARCHAR_100 address_detail
    VARCHAR_50 job
    ENUM purpose "SAVINGS_AND_INVESTMENT | SALARY_AND_LIVING_EXPENSES | BUSINESS_TRANSACTION | INHERITANCE_OR_GIFT"
    ENUM source "EARNED_AND_PENSION_INCOME | BUSINESS_INCOME | FINANCIAL_INCOME | REAL_ESTATE_INCOME | INHERITANCE_OR_GIFT | LOAN_OR_BORROWING | SAVINGS_OR_EXISTING_FUNDS | FAMILY_SUPPORT_OR_LIVING_EXPENSE | SCHOLARSHIP_OR_GOV_SUPPORT | OVERSEAS_INCOME_OR_FOREX_INFLOW | OTHER"
    BOOLEAN has_foreign_tax
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }

  ACCOUNT {
    BIGINT account_id PK
    BIGINT customer_id FK
    ENUM account_type "DEMAND_DEPOSIT | INSTALLMENT_SAVINGS | TIME_DEPOSIT | FOREIGN_CURRENCY"
    BOOLEAN has_limit
    VARCHAR_100 account_number
    VARCHAR_100 account_name
    INT balance
    VARCHAR_100 password
    INT daily_transfer_limit
    ENUM bank_code "WOORI | KOOKMIN | SHINHAN | NH | HANA | IBK | SC | CITI | DAEGU | BUSAN | KYONGNAM | GWANGJU | JEONBUK | JEJU | POST"
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }

  ACCOUNT_TRANSACTION {
    BIGINT account_transaction_id PK
    BIGINT account_id FK
    ENUM transaction_flow "DEPOSIT | WITHDRAWAL"
    ENUM transaction_type "SMART_WITHDRAWAL | CASH_IC | CHECK_CARD | ACCOUNT_TRANSFER | ATM_WITHDRAWAL | ATM_DEPOSIT | AUTO_DEBIT | WALLET_CHARGE | FEE"
    VARCHAR_100 counter_party
    INT amount
    VARCHAR_100 memo
    VARCHAR_100 external_request_id
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }

  GLOBAL_TRANSACTION {
    BIGINT global_transaction_id PK
    BIGINT customer_id FK
    BIGINT account_id FK
    VARCHAR remit_purpose
    VARCHAR target_country
    ENUM currency "KRW | USD | EUR | JPY | CNY | VND | THB | PHP | AUD | CAD"
    VARCHAR remit_amount
    ENUM mediary_fee_payer "SENDER | RECEIVER | SHARED"
    DECIMAL exchange_rate
    VARCHAR krw_amount
    VARCHAR sender_eng_name
    VARCHAR sender_phone
    VARCHAR sender_address_detail
    VARCHAR sender_district
    VARCHAR sender_city
    VARCHAR sender_zip_code
    VARCHAR sender_country
    VARCHAR receiver_eng_name
    VARCHAR receiver_address_detail
    VARCHAR receiver_district
    VARCHAR receiver_phone
    VARCHAR swift_code
    VARCHAR receiver_account_num
    VARCHAR routing_number
    VARCHAR bank_name
    ENUM remit_reason "LIVING_EXPENSE | TUITION | MEDICAL_EXPENSE | BUSINESS_PAYMENT | GIFT | SAVINGS | OTHER"
    ENUM status "REQUESTED | REVIEWING | APPROVED | REJECTED | COMPLETED | FAILED"
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }

  CUSTOMER ||--o{ ACCOUNT : owns
  ACCOUNT ||--o{ ACCOUNT_TRANSACTION : records
  CUSTOMER ||--o{ GLOBAL_TRANSACTION : requests
  ACCOUNT ||--o{ GLOBAL_TRANSACTION : sends_from
```

## Notes

- `global_transaction`은 해외송금 트랜잭션 전용 원장성 보조 테이블이며 이상 거래 탐지를 위한 데이터를 FDS Server에 보내기위한 데이터를 저장하고 있다.
- 원장 최종 상태는 계좌 원장(`account`, `account_transaction`)과 정합성을 맞춰 확정한다.
- `account.account_number`는 숫자 13자리 raw 문자열로 저장한다.
- 계좌번호 저장 포맷은 `S(1) + YYY(3) + C(1) + NNNNNNNN(8)`이며 `S=1`, `YYY=080`를 고정한다.
- `C`는 모듈러 방식 검증숫자를 사용한다.
- 계좌번호 조회 응답은 `SYYY-CZZ-ZZZZZZ` 포맷으로 변환해 반환하며, 하이픈은 DB에 저장하지 않는다.

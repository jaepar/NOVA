package woorifisa.project.coreBanking.domain.globalTransaction.entity.enums;

public enum GlobalTransactionFailureReason {
    FDS_RISK_DETECTED,
    FDS_TIMEOUT,
    FDS_COMMUNICATION_FAILED,
    FDS_RESPONSE_INVALID,
    FDS_RETRY_EXHAUSTED
}

package woorifisa.project.coreBanking.domain.globalTransaction.fds.client;

import woorifisa.project.coreBanking.domain.globalTransaction.fds.dto.FdsGlobalTransactionScreeningRequest;
import woorifisa.project.coreBanking.domain.globalTransaction.fds.dto.FdsGlobalTransactionScreeningResponse;

public interface FdsClient {

    FdsGlobalTransactionScreeningResponse screen(FdsGlobalTransactionScreeningRequest request);
}

import logging

from fastapi import FastAPI

from app.model import THRESHOLD, fds_model
from app.schemas import (
    GlobalTransactionScreeningRequest,
    GlobalTransactionScreeningResponse,
)


app = FastAPI(title="NOVA FDS Server")
logger = logging.getLogger(__name__)


@app.post("/fds/global-transactions/screenings",
          response_model=GlobalTransactionScreeningResponse,
)
def screen_global_transaction(request: GlobalTransactionScreeningRequest) -> GlobalTransactionScreeningResponse:
    logger.info(
        "FDS screening request received globalTransactionId=%s customerId=%s accountId=%s targetCountry=%s currency=%s krwAmount=%s",
        request.globalTransactionId,
        request.customerId,
        request.accountId,
        request.targetCountry,
        request.currency,
        request.krwAmount,
    )
    anomaly_score = fds_model.score(request)
    risky = fds_model.is_risky(anomaly_score)
    response = GlobalTransactionScreeningResponse(
        globalTransactionId=request.globalTransactionId,
        status="FAILED" if risky else "SUCCESS",
        anomalyScore=anomaly_score,
        threshold=THRESHOLD,
        failureReason="FDS_RISK_DETECTED" if risky else None,
    )
    logger.info(
        "FDS screening completed globalTransactionId=%s status=%s failureReason=%s anomalyScore=%s threshold=%s",
        response.globalTransactionId,
        response.status,
        response.failureReason,
        response.anomalyScore,
        response.threshold,
    )
    return response

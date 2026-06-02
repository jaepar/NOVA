from fastapi import FastAPI

from app.model import THRESHOLD, fds_model
from app.schemas import (
    GlobalTransactionScreeningRequest,
    GlobalTransactionScreeningResponse,
)


app = FastAPI(title="NOVA FDS Server")


@app.post("/fds/global-transactions/screenings",
          response_model=GlobalTransactionScreeningResponse,
)
def screen_global_transaction(request: GlobalTransactionScreeningRequest) -> GlobalTransactionScreeningResponse:
    anomaly_score = fds_model.score(request)
    risky = fds_model.is_risky(anomaly_score)

    return GlobalTransactionScreeningResponse(
        globalTransactionId=request.globalTransactionId,
        status="FAILED" if risky else "SUCCESS",
        anomalyScore=anomaly_score,
        threshold=THRESHOLD,
        failureReason="FDS_RISK_DETECTED" if risky else None,
    )

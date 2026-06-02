from typing import Literal

from pydantic import BaseModel


ScreeningStatus = Literal["SUCCESS", "FAILED"]


class GlobalTransactionScreeningRequest(BaseModel):
    globalTransactionId: int
    customerId: int
    accountId: int
    remitPurpose: str
    targetCountry: str
    currency: str
    remitAmount: float
    mediaryFeePayer: str
    exchangeRate: float
    krwAmount: float
    senderEngName: str
    senderPhone: str
    senderAddressDetail: str
    senderDistrict: str
    senderCity: str
    senderZipCode: str
    senderCountry: str
    receiverEngName: str
    receiverAddressDetail: str
    receiverDistrict: str
    receiverPhone: str
    swiftCode: str
    receiverAccountNum: str
    routingNumber: str
    bankName: str
    remitReason: str


class GlobalTransactionScreeningResponse(BaseModel):
    globalTransactionId: int
    status: ScreeningStatus
    anomalyScore: float
    threshold: float
    failureReason: str | None

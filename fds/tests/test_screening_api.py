from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def valid_payload():
    return {
        "globalTransactionId": 1001,
        "customerId": 2001,
        "accountId": 3001,
        "remitPurpose": "LIVING_EXPENSES",
        "targetCountry": "US",
        "currency": "USD",
        "remitAmount": 100.0,
        "mediaryFeePayer": "SENDER",
        "exchangeRate": 1350.5,
        "krwAmount": 135050.0,
        "senderEngName": "Hong Gildong",
        "senderPhone": "+821012345678",
        "senderAddressDetail": "101 Test-ro",
        "senderDistrict": "Jung-gu",
        "senderCity": "Seoul",
        "senderZipCode": "04524",
        "senderCountry": "KR",
        "receiverEngName": "Jane Doe",
        "receiverAddressDetail": "1 Main Street",
        "receiverDistrict": "Manhattan",
        "receiverPhone": "+12125550123",
        "swiftCode": "TESTUS33",
        "receiverAccountNum": "1234567890",
        "routingNumber": "021000021",
        "bankName": "Test Bank",
        "remitReason": "Family support",
    }


def test_screening_returns_http_200():
    response = client.post("/fds/global-transactions/screenings", json=valid_payload())

    assert response.status_code == 200


def test_screening_response_contains_decision_fields():
    response = client.post("/fds/global-transactions/screenings", json=valid_payload())

    body = response.json()
    assert body["globalTransactionId"] == 1001
    assert body["status"] in {"SUCCESS", "FAILED"}
    assert "failureReason" in body
    assert "anomalyScore" in body
    assert "threshold" in body


def test_screening_returns_failed_when_fds_risk_detected():
    payload = valid_payload()
    payload["globalTransactionId"] = 1002
    payload["krwAmount"] = 100_000_000.0
    payload["exchangeRate"] = 5000.0
    payload["currency"] = "BTC"

    response = client.post("/fds/global-transactions/screenings", json=payload)

    body = response.json()
    assert response.status_code == 200
    assert body["globalTransactionId"] == 1002
    assert body["status"] == "FAILED"
    assert body["failureReason"] == "FDS_RISK_DETECTED"
    assert body["anomalyScore"] < body["threshold"]


def test_screening_rejects_missing_global_transaction_id():
    payload = valid_payload()
    payload.pop("globalTransactionId")

    response = client.post("/fds/global-transactions/screenings", json=payload)

    assert response.status_code == 422

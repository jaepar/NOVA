from sklearn.ensemble import IsolationForest

from app.schemas import GlobalTransactionScreeningRequest


THRESHOLD = -0.2


class FdsIsolationForestModel:
    def __init__(self) -> None:
        self._model = IsolationForest(contamination=0.2, random_state=42)
        self._model.fit(
            [
                [100_000.0, 1_300.0, 3.0],
                [250_000.0, 1_350.0, 3.0],
                [500_000.0, 1_400.0, 3.0],
                [1_000_000.0, 1_450.0, 3.0],
                [2_000_000.0, 1_500.0, 3.0],
            ]
        )

    def score(self, transaction: GlobalTransactionScreeningRequest) -> float:
        features = [
            [
                transaction.krwAmount,
                transaction.exchangeRate,
                float(len(transaction.currency)),
            ]
        ]
        return float(self._model.score_samples(features)[0])

    def is_risky(self, anomaly_score: float) -> bool:
        return anomaly_score < THRESHOLD


fds_model = FdsIsolationForestModel()

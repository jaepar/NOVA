---
title: "FDS Isolation Forest 임계값 테스트 보강"
date: "2026-06-02"
category: "testing"
module: "fds-server"
component: "FastAPI FDS screening"
tags:
  - fds
  - isolation-forest
  - fastapi
  - pytest
  - threshold
---

## Context

`fds-server`의 해외송금 이상거래 심사 API를 구현하면서 `IsolationForest` 점수와 고정 임계값 `THRESHOLD = -0.2`를 함께 사용했다.

## Guidance

`IsolationForest` 기반 FDS 테스트는 정상 응답 필드만 확인하지 말고, 위험 거래 입력이 실제로 `FAILED`와 `FDS_RISK_DETECTED`를 반환하는지 확인해야 한다.

초기 구현에서는 `decision_function()` 점수 기준으로 `THRESHOLD = -0.2`를 비교했는데, 테스트 데이터에서 위험 판정이 사실상 발생하지 않았다. `score_samples()`를 사용하면 고정 임계값과 함께 위험 경로를 재현할 수 있다.

## Why This Matters

FDS는 해외송금의 1차 게이트웨이 역할을 한다. 위험 판정 경로가 테스트되지 않으면 CoreBanking의 실패 처리, 상태 갱신, 환급 로직도 실제 연동 시 검증되지 않은 상태가 된다.

## When to Apply

- FDS 모델 점수 임계값을 고정해 API 계약 테스트를 작성할 때
- `SUCCESS` 응답뿐 아니라 `FAILED` 응답과 실패 사유를 보장해야 할 때
- 모델 스코어링 함수 변경이 API 판정 경로에 영향을 줄 수 있을 때

## Examples

테스트는 최소한 다음을 검증한다.

```python
assert body["status"] == "FAILED"
assert body["failureReason"] == "FDS_RISK_DETECTED"
assert body["anomalyScore"] < body["threshold"]
```

모델 점수는 임계값과 같은 스케일에서 비교한다.

```python
return float(self._model.score_samples(features)[0])
```

"""
Anomaly Detection Router
Detect unusual transactions using IsolationForest.
"""

import logging
from datetime import datetime

import numpy as np
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Request / Response models ──────────────────────────────────────────────────


class TransactionItem(BaseModel):
    id: str
    amount: float = Field(..., ge=0)
    category: str = ""
    date: str = Field(..., description="ISO date string, e.g. 2024-01-15")
    title: str = ""


class AnomalyDetectionRequest(BaseModel):
    transactions: list[TransactionItem] = Field(..., min_length=1)


class AnomalyResult(BaseModel):
    id: str
    anomaly_score: float
    severity: str  # low | medium | high
    reason: str


class AnomalyDetectionResponse(BaseModel):
    anomalies: list[AnomalyResult]
    total_anomalies: int
    anomaly_rate: float


# ── Helpers ────────────────────────────────────────────────────────────────────


def _parse_date(date_str: str) -> datetime:
    """Parse a date string tolerantly, falling back to today on failure."""
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%SZ", "%d/%m/%Y"):
        try:
            return datetime.strptime(date_str[:10], fmt[:8])
        except ValueError:
            continue
    return datetime.today()


def _assign_severity(score: float) -> str:
    """
    Convert IsolationForest anomaly score to a human severity label.

    IsolationForest scores are typically in (-1, 1).
    More negative = more anomalous.
    """
    if score < -0.3:
        return "high"
    elif score < -0.15:
        return "medium"
    else:
        return "low"


def _generate_reason(
    transaction: TransactionItem,
    score: float,
    category_mean: float,
    category_std: float,
) -> str:
    """Generate a human-readable explanation for why a transaction is anomalous."""
    reasons: list[str] = []

    z = (transaction.amount - category_mean) / (category_std + 1e-9)
    if z > 2:
        reasons.append(
            f"Amount ${transaction.amount:,.2f} is {z:.1f}× higher than "
            f"the average {transaction.category} spend (${category_mean:,.2f})"
        )
    elif z < -1.5:
        reasons.append(
            f"Amount ${transaction.amount:,.2f} is unusually low for "
            f"{transaction.category} transactions"
        )

    if transaction.amount > 2000:
        reasons.append(f"Large single transaction exceeding $2,000")

    if transaction.amount < 0.50 and transaction.amount > 0:
        reasons.append("Micro-transaction — possible test charge or card skimming probe")

    if not reasons:
        reasons.append(
            f"Statistical outlier based on transaction pattern analysis "
            f"(anomaly score: {score:.3f})"
        )

    return ". ".join(reasons) + "."


# ── Endpoints ──────────────────────────────────────────────────────────────────


@router.post("/detect", response_model=AnomalyDetectionResponse)
async def detect_anomalies(request_body: AnomalyDetectionRequest, request: Request):
    """
    Detect anomalous transactions using the trained IsolationForest model.

    For each transaction, extracts features:
    - amount
    - day of week (0=Monday … 6=Sunday)
    - day of month (1-31)
    - z-score proxy relative to same-category mean

    Transactions with an anomaly score < -0.1 are flagged and returned with
    a severity label and a human-readable explanation.
    """
    try:
        model_store = request.app.state.model_store
        detector = model_store.anomaly_detector
        if detector is None:
            raise HTTPException(status_code=503, detail="Anomaly detector not loaded")

        transactions = request_body.transactions

        # Pre-compute per-category statistics for z-score feature
        category_amounts: dict[str, list[float]] = {}
        for txn in transactions:
            category_amounts.setdefault(txn.category, []).append(txn.amount)

        category_mean: dict[str, float] = {
            cat: float(np.mean(vals)) for cat, vals in category_amounts.items()
        }
        category_std: dict[str, float] = {
            cat: float(np.std(vals)) if len(vals) > 1 else 0.0
            for cat, vals in category_amounts.items()
        }

        # Build feature matrix
        feature_rows: list[list[float]] = []
        for txn in transactions:
            parsed_date = _parse_date(txn.date)
            dow = float(parsed_date.weekday())
            dom = float(parsed_date.day)
            c_mean = category_mean.get(txn.category, txn.amount)
            c_std = category_std.get(txn.category, 1.0) + 1e-9
            zscore_proxy = (txn.amount - c_mean) / c_std
            feature_rows.append([txn.amount, dow, dom, zscore_proxy])

        X = np.array(feature_rows)
        scores: np.ndarray = detector.decision_function(X)  # higher = more normal
        predictions: np.ndarray = detector.predict(X)       # -1 = anomaly, 1 = normal

        anomalies: list[AnomalyResult] = []
        for i, txn in enumerate(transactions):
            score = float(scores[i])
            is_anomaly = predictions[i] == -1 or score < -0.1

            if is_anomaly:
                c_mean = category_mean.get(txn.category, txn.amount)
                c_std = category_std.get(txn.category, 1.0)
                anomalies.append(
                    AnomalyResult(
                        id=txn.id,
                        anomaly_score=round(score, 4),
                        severity=_assign_severity(score),
                        reason=_generate_reason(txn, score, c_mean, c_std),
                    )
                )

        n_total = len(transactions)
        anomaly_rate = round(len(anomalies) / n_total, 4) if n_total > 0 else 0.0

        return AnomalyDetectionResponse(
            anomalies=anomalies,
            total_anomalies=len(anomalies),
            anomaly_rate=anomaly_rate,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Anomaly detection error: {exc}")
        raise HTTPException(status_code=500, detail="Anomaly detection failed") from exc

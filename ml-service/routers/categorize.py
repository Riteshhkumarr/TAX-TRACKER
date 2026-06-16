"""
Categorization Router
Provides ML-powered expense categorization endpoints.
"""

import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter()

CATEGORIES = [
    "Housing",
    "Food & Dining",
    "Transportation",
    "Healthcare",
    "Entertainment",
    "Shopping",
    "Education",
    "Business",
    "Utilities",
    "Travel",
    "Other",
]


# ── Request / Response models ──────────────────────────────────────────────────


class CategorizeRequest(BaseModel):
    """Single expense categorization request."""

    title: str = Field(..., min_length=1, description="Expense title / name")
    description: str = Field(default="", description="Optional longer description")
    amount: float = Field(default=0.0, ge=0, description="Expense amount in USD")


class CategorizeResponse(BaseModel):
    """Single expense categorization response."""

    category: str
    confidence: float
    suggestions: list[str]


class BulkExpenseItem(BaseModel):
    """Item in a bulk categorization request."""

    id: str
    title: str
    description: str = ""


class BulkCategorizeRequest(BaseModel):
    """Bulk expense categorization request."""

    expenses: list[BulkExpenseItem]


class BulkCategorizeResultItem(BaseModel):
    id: str
    category: str
    confidence: float


class BulkCategorizeResponse(BaseModel):
    results: list[BulkCategorizeResultItem]


# ── Helpers ────────────────────────────────────────────────────────────────────


def _classify_text(text: str, model_store: Any) -> tuple[str, float, list[str]]:
    """
    Run the expense classifier pipeline and return (category, confidence, suggestions).

    Parameters
    ----------
    text:
        Combined input text (title + description).
    model_store:
        ModelStore instance with a trained expense_classifier.

    Returns
    -------
    tuple of predicted category, confidence score, and top-3 suggestion list.
    """
    if not text.strip():
        return "Other", 0.5, ["Other"]

    classifier = model_store.expense_classifier
    if classifier is None:
        raise ValueError("Expense classifier not loaded")

    # Predict probabilities for all classes
    proba = classifier.predict_proba([text])[0]
    classes = classifier.classes_

    # Sort by probability descending
    sorted_indices = proba.argsort()[::-1]
    predicted_category = classes[sorted_indices[0]]
    confidence = float(proba[sorted_indices[0]])

    # Build top-3 suggestions (excluding already predicted category)
    suggestions: list[str] = []
    for idx in sorted_indices[1:4]:
        if classes[idx] != predicted_category:
            suggestions.append(classes[idx])
        if len(suggestions) >= 3:
            break

    return predicted_category, confidence, suggestions


# ── Endpoints ──────────────────────────────────────────────────────────────────


@router.post("/", response_model=CategorizeResponse)
async def categorize_expense(request_body: CategorizeRequest, request: Request):
    """
    Categorize a single expense using the trained ML classifier.

    Combines the title and description into a single text, runs it through
    the TF-IDF + LogisticRegression pipeline, and returns the predicted
    category together with a confidence score and alternative suggestions.
    """
    try:
        model_store = request.app.state.model_store
        combined_text = f"{request_body.title} {request_body.description}".strip()
        category, confidence, suggestions = _classify_text(combined_text, model_store)

        return CategorizeResponse(
            category=category,
            confidence=round(confidence, 4),
            suggestions=suggestions,
        )

    except ValueError as exc:
        logger.error(f"Categorization error: {exc}")
        raise HTTPException(status_code=503, detail="Model not available") from exc
    except Exception as exc:
        logger.exception(f"Unexpected error during categorization: {exc}")
        raise HTTPException(status_code=500, detail="Internal server error") from exc


@router.post("/bulk", response_model=BulkCategorizeResponse)
async def bulk_categorize(request_body: BulkCategorizeRequest, request: Request):
    """
    Categorize multiple expenses in a single request.

    Accepts a list of expense items and returns a category prediction for each,
    preserving the original expense ID for easy client-side mapping.
    """
    if not request_body.expenses:
        return BulkCategorizeResponse(results=[])

    try:
        model_store = request.app.state.model_store
        results: list[BulkCategorizeResultItem] = []

        for item in request_body.expenses:
            combined_text = f"{item.title} {item.description}".strip()
            try:
                category, confidence, _ = _classify_text(combined_text, model_store)
            except Exception as exc:
                logger.warning(f"Failed to classify expense id={item.id}: {exc}")
                category, confidence = "Other", 0.0

            results.append(
                BulkCategorizeResultItem(
                    id=item.id,
                    category=category,
                    confidence=round(confidence, 4),
                )
            )

        return BulkCategorizeResponse(results=results)

    except ValueError as exc:
        logger.error(f"Bulk categorization model error: {exc}")
        raise HTTPException(status_code=503, detail="Model not available") from exc
    except Exception as exc:
        logger.exception(f"Unexpected error during bulk categorization: {exc}")
        raise HTTPException(status_code=500, detail="Internal server error") from exc

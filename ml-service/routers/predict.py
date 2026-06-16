"""
Prediction Router
Tax liability and budget prediction endpoints.
"""

import logging
import math
from datetime import date

import numpy as np
from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter()

# ── IRS-style quarter definitions ──────────────────────────────────────────────

QUARTERS = [
    {"name": "Q1", "months": [1, 2, 3], "due_date": "April 15, 2024"},
    {"name": "Q2", "months": [4, 5, 6], "due_date": "June 17, 2024"},
    {"name": "Q3", "months": [7, 8, 9], "due_date": "September 16, 2024"},
    {"name": "Q4", "months": [10, 11, 12], "due_date": "January 15, 2025"},
]

# 50/30/20 budget allocation guidelines
BUDGET_ALLOCATIONS = {
    "Needs": {
        "Housing": 0.30,
        "Food & Dining": 0.10,
        "Transportation": 0.10,
        "Utilities": 0.05,
        "Healthcare": 0.05,
    },
    "Wants": {
        "Entertainment": 0.05,
        "Shopping": 0.05,
        "Travel": 0.05,
        "Other": 0.05,
    },
    "Savings & Debt": {
        "Savings": 0.15,
        "Investment": 0.05,
    },
}


# ── Request / Response models ──────────────────────────────────────────────────


class MonthlyDataItem(BaseModel):
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000, le=2100)
    income: float = Field(..., ge=0)
    expenses: float = Field(..., ge=0)


class TaxPredictionRequest(BaseModel):
    monthly_data: list[MonthlyDataItem] = Field(
        ..., min_length=1, description="List of monthly financial data"
    )


class QuarterlyBreakdown(BaseModel):
    quarter: str
    estimated_tax: float
    due_date: str


class TaxPredictionResponse(BaseModel):
    current_year_estimate: float
    next_quarter_estimate: float
    quarterly_breakdown: list[QuarterlyBreakdown]
    confidence: float
    factors: list[str]


class BudgetCategory(BaseModel):
    category: str
    recommended_amount: float
    recommended_pct: float


class BudgetResponse(BaseModel):
    monthly_income: float
    monthly_expenses: float
    surplus_deficit: float
    savings_rate: float
    allocations: dict[str, list[BudgetCategory]]
    recommendations: list[str]


# ── Helpers ────────────────────────────────────────────────────────────────────


def _get_current_quarter() -> int:
    """Return current calendar quarter (1-4)."""
    return (date.today().month - 1) // 3 + 1


def _compute_quarterly_tax(
    monthly_data: list[MonthlyDataItem], predictor
) -> list[QuarterlyBreakdown]:
    """Compute estimated tax for each quarter using the LinearRegression model."""
    breakdowns: list[QuarterlyBreakdown] = []

    for q in QUARTERS:
        q_months = [m for m in monthly_data if m.month in q["months"]]
        if q_months:
            q_income = sum(m.income for m in q_months)
            q_expenses = sum(m.expenses for m in q_months)
            avg_month = (q["months"][0] + q["months"][-1]) / 2
            ytd_income = sum(m.income for m in monthly_data if m.month <= q["months"][-1])
            features = np.array([[q_income / 3, q_expenses / 3, avg_month, ytd_income]])
            estimated = float(predictor.predict(features)[0]) * 3
        else:
            # Estimate based on overall average if no data for this quarter
            if monthly_data:
                avg_income = np.mean([m.income for m in monthly_data])
                avg_expenses = np.mean([m.expenses for m in monthly_data])
                avg_month = (q["months"][0] + q["months"][-1]) / 2
                ytd_proxy = avg_income * avg_month
                features = np.array([[avg_income, avg_expenses, avg_month, ytd_proxy]])
                estimated = float(predictor.predict(features)[0]) * 3
            else:
                estimated = 0.0

        breakdowns.append(
            QuarterlyBreakdown(
                quarter=q["name"],
                estimated_tax=round(max(estimated, 0), 2),
                due_date=q["due_date"],
            )
        )

    return breakdowns


# ── Endpoints ──────────────────────────────────────────────────────────────────


@router.post("/tax", response_model=TaxPredictionResponse)
async def predict_tax(request_body: TaxPredictionRequest, request: Request):
    """
    Predict annual tax liability and provide quarterly breakdowns.

    Uses the trained LinearRegression model with features derived from
    user-supplied monthly income and expense data. Returns a full-year estimate,
    next-quarter estimate, and a per-quarter breakdown with IRS due dates.
    """
    try:
        model_store = request.app.state.model_store
        predictor = model_store.tax_predictor
        if predictor is None:
            raise HTTPException(status_code=503, detail="Tax predictor not loaded")

        monthly_data = request_body.monthly_data
        total_income = sum(m.income for m in monthly_data)
        total_expenses = sum(m.expenses for m in monthly_data)
        n_months = len(monthly_data)

        # Build feature vector for annual estimate
        avg_income = total_income / n_months
        avg_expenses = total_expenses / n_months
        last_month = max(m.month for m in monthly_data)
        features = np.array([[avg_income, avg_expenses, last_month, total_income]])
        monthly_tax = float(predictor.predict(features)[0])
        current_year_estimate = round(max(monthly_tax * 12, 0), 2)

        # Quarterly breakdown
        quarterly_breakdown = _compute_quarterly_tax(monthly_data, predictor)

        # Next quarter estimate
        current_q = _get_current_quarter()
        next_q_idx = current_q % 4  # 0-indexed into breakdowns (next quarter)
        next_quarter_estimate = quarterly_breakdown[next_q_idx].estimated_tax

        # Confidence: higher when more data is available
        confidence = min(0.95, 0.50 + (n_months / 12) * 0.45)

        # Explanatory factors
        savings_rate = max(0, (total_income - total_expenses) / total_income * 100) if total_income > 0 else 0
        factors: list[str] = [
            f"Based on {n_months} month(s) of financial data",
            f"Average monthly income: ${avg_income:,.2f}",
            f"Average monthly expenses: ${avg_expenses:,.2f}",
            f"Current savings rate: {savings_rate:.1f}%",
            "Federal income tax estimated using standard deduction",
            "Consult a CPA for state taxes and itemized deductions",
        ]

        return TaxPredictionResponse(
            current_year_estimate=current_year_estimate,
            next_quarter_estimate=round(next_quarter_estimate, 2),
            quarterly_breakdown=quarterly_breakdown,
            confidence=round(confidence, 3),
            factors=factors,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Tax prediction error: {exc}")
        raise HTTPException(status_code=500, detail="Tax prediction failed") from exc


@router.get("/budget", response_model=BudgetResponse)
async def predict_budget(
    monthly_income: float = Query(..., gt=0, description="Gross monthly income in USD"),
    monthly_expenses: float = Query(..., ge=0, description="Current monthly expenses in USD"),
):
    """
    Generate personalised budget recommendations using the 50/30/20 rule.

    Takes gross monthly income and current spending, and returns recommended
    per-category allocations with actionable commentary.
    """
    try:
        surplus_deficit = monthly_income - monthly_expenses
        savings_rate = round(surplus_deficit / monthly_income * 100, 1) if monthly_income > 0 else 0

        allocations: dict[str, list[BudgetCategory]] = {}
        for bucket, categories in BUDGET_ALLOCATIONS.items():
            bucket_items: list[BudgetCategory] = []
            for cat, pct in categories.items():
                bucket_items.append(
                    BudgetCategory(
                        category=cat,
                        recommended_amount=round(monthly_income * pct, 2),
                        recommended_pct=round(pct * 100, 1),
                    )
                )
            allocations[bucket] = bucket_items

        # Tailored recommendations
        recommendations: list[str] = []
        if savings_rate < 10:
            recommendations.append(
                "⚠️ Your savings rate is below 10%. Aim for at least 20% to build financial security."
            )
        elif savings_rate >= 20:
            recommendations.append(
                "✅ Great savings rate! Consider maxing out your 401(k) and Roth IRA contributions."
            )
        else:
            recommendations.append(
                "📈 You're saving between 10-20%. Try to reach 20% by trimming discretionary spending."
            )

        expense_ratio = monthly_expenses / monthly_income if monthly_income > 0 else 1
        if expense_ratio > 0.8:
            recommendations.append(
                "Your expenses exceed 80% of income. Review subscriptions and dining costs first."
            )
        if monthly_income >= 5000:
            recommendations.append(
                "Consider contributing to a Health Savings Account (HSA) for triple tax advantages."
            )
        recommendations.append(
            f"Emergency fund target: ${monthly_expenses * 3:,.0f}–${monthly_expenses * 6:,.0f} (3–6 months of expenses)."
        )
        recommendations.append(
            "Max out your 401(k) ($23,000 limit for 2024) for the largest available tax deduction."
        )

        return BudgetResponse(
            monthly_income=round(monthly_income, 2),
            monthly_expenses=round(monthly_expenses, 2),
            surplus_deficit=round(surplus_deficit, 2),
            savings_rate=savings_rate,
            allocations=allocations,
            recommendations=recommendations,
        )

    except Exception as exc:
        logger.exception(f"Budget prediction error: {exc}")
        raise HTTPException(status_code=500, detail="Budget prediction failed") from exc

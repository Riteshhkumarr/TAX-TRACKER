"""
Insights Router
AI-powered financial health scoring and actionable insight generation.
"""

import logging
import math
from typing import Literal

import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Request / Response models ──────────────────────────────────────────────────


class MonthlyDataPoint(BaseModel):
    month: int = Field(..., ge=1, le=12)
    income: float = Field(..., ge=0)
    expenses: float = Field(..., ge=0)


class InsightsRequest(BaseModel):
    total_income: float = Field(..., ge=0)
    total_expenses: float = Field(..., ge=0)
    total_deductions: float = Field(default=0.0, ge=0)
    monthly_data: list[MonthlyDataPoint] = Field(default_factory=list)
    category_breakdown: dict[str, float] = Field(default_factory=dict)
    tax_paid: float = Field(default=0.0, ge=0)


class ScoreBreakdown(BaseModel):
    savings_rate: int
    tax_efficiency: int
    expense_control: int
    income_stability: int


class FinancialScore(BaseModel):
    overall: int
    breakdown: ScoreBreakdown


InsightType = Literal["tip", "warning", "info", "success"]
ImpactLevel = Literal["high", "medium", "low"]


class Insight(BaseModel):
    type: InsightType
    title: str
    description: str
    action: str
    impact: ImpactLevel


class SavingsOpportunity(BaseModel):
    category: str
    potential_savings: float
    description: str


class InsightsResponse(BaseModel):
    financial_score: FinancialScore
    insights: list[Insight]
    recommendations: list[str]
    savings_opportunities: list[SavingsOpportunity]


# ── Scoring helpers ────────────────────────────────────────────────────────────

# Category benchmarks as % of total income (rough US averages)
CATEGORY_BENCHMARKS: dict[str, float] = {
    "Housing": 0.30,
    "Food & Dining": 0.12,
    "Transportation": 0.15,
    "Healthcare": 0.08,
    "Entertainment": 0.05,
    "Shopping": 0.05,
    "Education": 0.03,
    "Business": 0.05,
    "Utilities": 0.05,
    "Travel": 0.04,
    "Other": 0.03,
}


def _score_savings_rate(income: float, expenses: float) -> int:
    """Score savings rate on 0-100 scale."""
    if income <= 0:
        return 50
    rate = (income - expenses) / income
    # 20%+ → 100, 0% → 0, negative → 0
    return max(0, min(100, int(rate / 0.20 * 100)))


def _score_tax_efficiency(income: float, deductions: float) -> int:
    """Score how well the user is utilising deductions (0-100)."""
    if income <= 0:
        return 50
    ratio = deductions / income
    # 30%+ deduction ratio → 100, 0% → 20 (standard deduction baseline)
    return max(20, min(100, int(20 + ratio / 0.30 * 80)))


def _score_expense_control(income: float, expenses: float) -> int:
    """Score expense control — lower expense ratio is better (0-100)."""
    if income <= 0:
        return 50
    ratio = expenses / income
    # 50% or less → 100, 90%+ → 0
    if ratio <= 0.5:
        return 100
    elif ratio >= 0.9:
        return 0
    return int((0.9 - ratio) / 0.40 * 100)


def _score_income_stability(monthly_data: list[MonthlyDataPoint]) -> int:
    """Score income stability based on coefficient of variation (0-100)."""
    if len(monthly_data) < 2:
        return 75  # not enough data, assume moderate
    incomes = [m.income for m in monthly_data if m.income > 0]
    if not incomes:
        return 50
    mean = np.mean(incomes)
    std = np.std(incomes)
    cv = std / (mean + 1e-9)
    # CV 0 → 100, CV 0.5+ → 0
    return max(0, min(100, int((1 - cv / 0.50) * 100)))


def _compute_financial_score(
    income: float,
    expenses: float,
    deductions: float,
    monthly_data: list[MonthlyDataPoint],
) -> FinancialScore:
    """Compute weighted overall financial score."""
    s_savings = _score_savings_rate(income, expenses)
    s_tax = _score_tax_efficiency(income, deductions)
    s_expense = _score_expense_control(income, expenses)
    s_stability = _score_income_stability(monthly_data)

    overall = int(
        s_savings * 0.35
        + s_tax * 0.20
        + s_expense * 0.30
        + s_stability * 0.15
    )

    return FinancialScore(
        overall=overall,
        breakdown=ScoreBreakdown(
            savings_rate=s_savings,
            tax_efficiency=s_tax,
            expense_control=s_expense,
            income_stability=s_stability,
        ),
    )


def _generate_insights(
    income: float,
    expenses: float,
    deductions: float,
    category_breakdown: dict[str, float],
    tax_paid: float,
    monthly_data: list[MonthlyDataPoint],
) -> list[Insight]:
    """Generate 5-8 actionable insights based on the financial data."""
    insights: list[Insight] = []
    savings = income - expenses
    savings_rate = savings / income if income > 0 else 0

    # 1. Savings rate insight
    if savings_rate < 0:
        insights.append(Insight(
            type="warning",
            title="Spending Exceeds Income",
            description=f"You're spending ${abs(savings):,.2f} more than you earn this period. "
                        "This is unsustainable without savings or debt.",
            action="Identify and cut your top 3 discretionary expenses immediately.",
            impact="high",
        ))
    elif savings_rate < 0.10:
        insights.append(Insight(
            type="warning",
            title="Low Savings Rate",
            description=f"Your savings rate is {savings_rate*100:.1f}%, below the recommended 20%.",
            action="Try automating savings transfers on payday to reach 20%.",
            impact="high",
        ))
    elif savings_rate >= 0.20:
        insights.append(Insight(
            type="success",
            title="Strong Savings Rate",
            description=f"You're saving {savings_rate*100:.1f}% of your income — excellent! "
                        "The recommended minimum is 20%.",
            action="Consider investing surplus in index funds or maxing retirement accounts.",
            impact="medium",
        ))
    else:
        insights.append(Insight(
            type="info",
            title="Moderate Savings Rate",
            description=f"Your savings rate is {savings_rate*100:.1f}%. You're on track but can do better.",
            action="Aim to raise your savings rate to 20% by reducing dining and entertainment.",
            impact="medium",
        ))

    # 2. Tax deductions insight
    deduction_rate = deductions / income if income > 0 else 0
    if deduction_rate < 0.10:
        insights.append(Insight(
            type="tip",
            title="Untapped Tax Deductions",
            description=f"Your deductions are only {deduction_rate*100:.1f}% of income. "
                        "Many taxpayers leave thousands on the table.",
            action="Review home office, student loan interest, HSA, and 401(k) contributions.",
            impact="high",
        ))
    elif deduction_rate > 0.25:
        insights.append(Insight(
            type="success",
            title="Excellent Tax Efficiency",
            description=f"You're claiming {deduction_rate*100:.1f}% of income in deductions — well above average.",
            action="Ensure all deductions are well-documented in case of an audit.",
            impact="low",
        ))

    # 3. Category-specific insights
    if income > 0:
        for cat, amount in category_breakdown.items():
            benchmark = CATEGORY_BENCHMARKS.get(cat)
            if benchmark is None:
                continue
            actual_pct = amount / income
            if actual_pct > benchmark * 1.3:
                insights.append(Insight(
                    type="warning",
                    title=f"High {cat} Spending",
                    description=(
                        f"You're spending {actual_pct*100:.1f}% of income on {cat}, "
                        f"vs the {benchmark*100:.0f}% benchmark."
                    ),
                    action=f"Review your {cat} expenses and look for cheaper alternatives.",
                    impact="medium",
                ))
            if len(insights) >= 7:
                break

    # 4. Emergency fund
    monthly_expenses_avg = expenses / max(len(monthly_data), 1)
    emergency_target = monthly_expenses_avg * 6
    insights.append(Insight(
        type="tip",
        title="Build Your Emergency Fund",
        description=f"Aim for ${emergency_target:,.0f} (6 months of expenses) in a high-yield savings account.",
        action="Open a HYSA and set up a recurring $100–$500/month automatic transfer.",
        impact="high",
    ))

    # 5. Retirement contribution
    if income > 40_000:
        insights.append(Insight(
            type="tip",
            title="Maximise Retirement Contributions",
            description="401(k) contributions reduce your taxable income dollar-for-dollar (2024 limit: $23,000).",
            action="Increase your contribution by 1% each year until you hit the annual limit.",
            impact="high",
        ))

    return insights[:8]


def _find_savings_opportunities(
    category_breakdown: dict[str, float],
    income: float,
) -> list[SavingsOpportunity]:
    """Identify top spending categories that are above benchmarks."""
    opportunities: list[SavingsOpportunity] = []

    if income <= 0:
        return opportunities

    sorted_cats = sorted(category_breakdown.items(), key=lambda x: x[1], reverse=True)
    for cat, amount in sorted_cats:
        benchmark = CATEGORY_BENCHMARKS.get(cat, 0.05)
        benchmark_amount = income * benchmark
        if amount > benchmark_amount * 1.1:
            potential = amount - benchmark_amount
            opportunities.append(
                SavingsOpportunity(
                    category=cat,
                    potential_savings=round(potential, 2),
                    description=(
                        f"Reducing {cat} spending from ${amount:,.2f} to the "
                        f"${benchmark_amount:,.2f} benchmark could save ${potential:,.2f}/period."
                    ),
                )
            )

    return sorted(opportunities, key=lambda x: x.potential_savings, reverse=True)[:5]


# ── Endpoints ──────────────────────────────────────────────────────────────────


@router.post("/generate", response_model=InsightsResponse)
async def generate_insights(request_body: InsightsRequest):
    """
    Generate personalised financial insights and a health score.

    Analyses income, expenses, deductions, category breakdown, and monthly trends
    to produce:
    - A financial health score (0-100) with component breakdown
    - 5-8 actionable insights tagged by type and impact level
    - Curated savings opportunities with estimated potential savings
    - High-level recommendations
    """
    try:
        income = request_body.total_income
        expenses = request_body.total_expenses
        deductions = request_body.total_deductions
        monthly_data = request_body.monthly_data
        category_breakdown = request_body.category_breakdown
        tax_paid = request_body.tax_paid

        # Financial score
        financial_score = _compute_financial_score(income, expenses, deductions, monthly_data)

        # Insights
        insights = _generate_insights(
            income, expenses, deductions, category_breakdown, tax_paid, monthly_data
        )

        # Savings opportunities
        savings_opportunities = _find_savings_opportunities(category_breakdown, income)

        # Top-level recommendations
        recommendations: list[str] = [
            "Automate savings on the first day of each month before spending.",
            "Use tax-advantaged accounts (401k, IRA, HSA) to their fullest.",
            "Review subscriptions quarterly and cancel unused services.",
            "Track every expense in real-time to maintain spending awareness.",
            "Consult a CPA or CFP for a comprehensive financial plan.",
        ]
        if financial_score.overall < 50:
            recommendations.insert(0, "⚠️ Your financial health score is below 50. Focus on reducing expenses first.")
        elif financial_score.overall >= 80:
            recommendations.insert(0, "🎉 Excellent financial health! Focus on wealth-building and tax optimisation.")

        return InsightsResponse(
            financial_score=financial_score,
            insights=insights,
            recommendations=recommendations,
            savings_opportunities=savings_opportunities,
        )

    except Exception as exc:
        logger.exception(f"Insights generation error: {exc}")
        raise HTTPException(status_code=500, detail="Insights generation failed") from exc

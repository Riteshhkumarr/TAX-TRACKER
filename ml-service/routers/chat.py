"""
Chat Router
AI-powered tax and financial advisor chat endpoint.
Uses OpenAI GPT when available, falls back to rule-based responses.
"""

import logging
import os
import re
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter()

# ── System prompt ──────────────────────────────────────────────────────────────

SYSTEM_PROMPT = (
    "You are TaxBot, an expert AI financial advisor specializing in US tax law, "
    "tax optimization, and personal finance. You help users minimize their tax "
    "liability legally. Be concise, accurate, and friendly. Always recommend "
    "consulting a CPA for complex situations."
)

# ── Rule-based fallback knowledge base ────────────────────────────────────────

FALLBACK_QA: list[tuple[list[str], str, list[str]]] = [
    (
        ["deduction", "write off", "write-off", "itemize"],
        (
            "Common tax deductions include: mortgage interest, state and local taxes (SALT, capped at $10,000), "
            "charitable contributions, medical expenses exceeding 7.5% of AGI, student loan interest, and "
            "business expenses. For 2024, the standard deduction is $14,600 (single) or $29,200 (married filing jointly). "
            "Itemise only when your deductions exceed the standard deduction."
        ),
        [
            "What home expenses are tax-deductible?",
            "How do charitable donations affect my taxes?",
            "Can I deduct my home office?",
        ],
    ),
    (
        ["bracket", "tax rate", "marginal", "effective rate"],
        (
            "2024 Federal Tax Brackets (Single filers): "
            "10% on income $0–$11,600 | "
            "12% on $11,601–$47,150 | "
            "22% on $47,151–$100,525 | "
            "24% on $100,526–$191,950 | "
            "32% on $191,951–$243,725 | "
            "35% on $243,726–$609,350 | "
            "37% on income above $609,350. "
            "Your marginal rate is the rate on your last dollar earned; your effective rate is the overall average you pay."
        ),
        [
            "What is the difference between marginal and effective tax rate?",
            "How can I drop into a lower tax bracket?",
            "What are the 2024 tax brackets for married couples?",
        ],
    ),
    (
        ["deadline", "due date", "filing date", "extension", "april"],
        (
            "Key 2024 tax deadlines: "
            "April 15 — Individual tax return (Form 1040) or 6-month extension request. "
            "April 15 — Q1 estimated tax payment. "
            "June 17 — Q2 estimated tax payment. "
            "September 16 — Q3 estimated tax payment. "
            "January 15, 2025 — Q4 estimated tax payment. "
            "October 15 — Extended return deadline. "
            "An extension gives more time to FILE, not to PAY — penalties apply on unpaid tax after April 15."
        ),
        [
            "When is the deadline for estimated tax payments?",
            "How do I file a tax extension?",
            "What happens if I miss the tax deadline?",
        ],
    ),
    (
        ["business expense", "self-employed", "freelance", "schedule c", "1099"],
        (
            "Self-employed individuals can deduct ordinary and necessary business expenses on Schedule C: "
            "home office (exclusive business use), vehicle mileage ($0.67/mile in 2024), "
            "health insurance premiums, retirement plan contributions (SEP-IRA up to $69,000), "
            "software and subscriptions, professional development, advertising, and a portion of "
            "self-employment tax (50%). Keep all receipts and maintain clear records."
        ),
        [
            "What mileage rate can I deduct in 2024?",
            "How do I deduct a home office?",
            "What is a SEP-IRA and how does it save taxes?",
        ],
    ),
    (
        ["retirement", "401k", "ira", "roth", "pension"],
        (
            "2024 Retirement Contribution Limits: "
            "401(k)/403(b): $23,000 ($30,500 if 50+). "
            "Traditional IRA: $7,000 ($8,000 if 50+) — deductible if you meet income limits. "
            "Roth IRA: Same limits; income phase-out starts at $146,000 (single) / $230,000 (married). "
            "SEP-IRA: 25% of compensation or $69,000, whichever is less. "
            "Contributions to Traditional 401(k) and IRA reduce your taxable income now; "
            "Roth contributions grow tax-free for retirement."
        ),
        [
            "Should I choose a Traditional or Roth IRA?",
            "How much can I contribute to my 401(k) in 2024?",
            "What is the backdoor Roth IRA strategy?",
        ],
    ),
    (
        ["capital gain", "stock", "investment", "crypto", "cryptocurrency"],
        (
            "Capital gains tax applies when you sell assets at a profit. "
            "Short-term gains (held < 1 year) are taxed as ordinary income. "
            "Long-term gains (held ≥ 1 year) are taxed at 0%, 15%, or 20% depending on income. "
            "Crypto is treated as property — every trade is a taxable event. "
            "Tax-loss harvesting (selling losing investments to offset gains) is a key strategy. "
            "Consider keeping appreciating assets in tax-advantaged accounts when possible."
        ),
        [
            "How is cryptocurrency taxed?",
            "What is tax-loss harvesting?",
            "How long should I hold stocks to pay lower taxes?",
        ],
    ),
    (
        ["hsa", "health savings", "flexible spending", "fsa"],
        (
            "A Health Savings Account (HSA) offers a triple tax advantage: "
            "contributions are tax-deductible, growth is tax-free, and withdrawals for qualified "
            "medical expenses are tax-free. 2024 limits: $4,150 (self-only) / $8,300 (family). "
            "You must be enrolled in a High-Deductible Health Plan (HDHP) to contribute. "
            "Unspent funds roll over indefinitely — HSAs can double as retirement accounts after age 65."
        ),
        [
            "Am I eligible for an HSA?",
            "What expenses qualify for HSA withdrawals?",
            "Can I invest my HSA funds?",
        ],
    ),
    (
        ["audit", "irs notice", "examination"],
        (
            "IRS audit red flags include: unusually large deductions relative to income, "
            "unreported income (the IRS receives 1099s and W-2s), business losses for multiple years, "
            "high cash transactions, and math errors. "
            "If audited, gather all supporting documentation (receipts, bank statements, contracts). "
            "You have the right to represent yourself or hire a CPA/tax attorney. "
            "Most audits are resolved by mail — only ~0.5% of returns are audited."
        ),
        [
            "What triggers an IRS audit?",
            "How should I prepare for a tax audit?",
            "How long can the IRS audit past returns?",
        ],
    ),
]

DEFAULT_SUGGESTIONS = [
    "What deductions am I missing?",
    "How can I reduce my tax bill?",
    "When are estimated taxes due?",
]


# ── Request / Response models ──────────────────────────────────────────────────


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    context: dict[str, Any] = Field(default_factory=dict)
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    suggestions: list[str]


# ── Rule-based fallback ────────────────────────────────────────────────────────


def _rule_based_reply(message: str) -> tuple[str, list[str]]:
    """
    Match the user message against the knowledge base and return an answer.
    Returns (reply_text, follow_up_suggestions).
    """
    message_lower = message.lower()

    for keywords, answer, suggestions in FALLBACK_QA:
        if any(kw in message_lower for kw in keywords):
            reply = (
                answer
                + "\n\nFor personalised advice, please configure the OpenAI API key."
            )
            return reply, suggestions

    # Generic fallback
    reply = (
        "I'm TaxBot, your AI tax advisor. I can help with deductions, tax brackets, "
        "filing deadlines, retirement accounts, business expenses, and more. "
        "Could you rephrase your question or ask about a specific tax topic?\n\n"
        "For personalised advice, please configure the OpenAI API key."
    )
    return reply, DEFAULT_SUGGESTIONS


# ── OpenAI helper ──────────────────────────────────────────────────────────────


def _build_openai_messages(
    request_body: ChatRequest,
) -> list[dict[str, str]]:
    """Construct the messages list for the OpenAI Chat Completions API."""
    system_content = SYSTEM_PROMPT

    if request_body.context:
        ctx = request_body.context
        ctx_lines = ["\\nUser financial context:"]
        for k, v in ctx.items():
            ctx_lines.append(f"  {k}: {v}")
        system_content += "\\n".join(ctx_lines)

    messages: list[dict[str, str]] = [{"role": "system", "content": system_content}]

    # Include recent history (last 10 exchanges)
    for msg in request_body.history[-10:]:
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": request_body.message})
    return messages


async def _openai_chat(request_body: ChatRequest) -> tuple[str, list[str]]:
    """
    Call OpenAI Chat Completions API.
    Returns (reply_text, suggestions).
    Raises on any failure so the caller can fall back.
    """
    from openai import AsyncOpenAI

    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key or api_key == "your_openai_api_key_here":
        raise ValueError("OpenAI API key not configured")

    client = AsyncOpenAI(api_key=api_key)
    messages = _build_openai_messages(request_body)

    # Main response
    response = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,  # type: ignore[arg-type]
        max_tokens=600,
        temperature=0.7,
    )
    reply = response.choices[0].message.content or ""

    # Generate follow-up suggestions
    suggestion_prompt = (
        f"Given the question: '{request_body.message}' and the answer provided, "
        "generate exactly 3 concise follow-up question suggestions a user might ask next. "
        "Return them as a numbered list, one per line."
    )
    sugg_response = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": suggestion_prompt},
        ],
        max_tokens=150,
        temperature=0.5,
    )
    raw_suggestions = sugg_response.choices[0].message.content or ""
    suggestions: list[str] = []
    for line in raw_suggestions.strip().split("\n"):
        clean = re.sub(r"^\s*\d+[\.\)]\s*", "", line).strip()
        if clean:
            suggestions.append(clean)
    suggestions = suggestions[:3]

    if not suggestions:
        suggestions = DEFAULT_SUGGESTIONS

    return reply, suggestions


# ── Endpoints ──────────────────────────────────────────────────────────────────


@router.post("/", response_model=ChatResponse)
async def chat(request_body: ChatRequest):
    """
    Conversational AI tax advisor endpoint.

    Attempts to use the OpenAI GPT API for high-quality, context-aware responses.
    If the API key is not configured or the request fails for any reason, falls
    back gracefully to a rule-based knowledge base covering common tax questions.

    The endpoint accepts conversation history and optional financial context
    (income, expenses, deductions, etc.) to personalise responses.
    """
    # Try OpenAI first
    try:
        reply, suggestions = await _openai_chat(request_body)
        return ChatResponse(reply=reply, suggestions=suggestions)
    except ValueError as exc:
        # API key not set — silently fall back
        logger.info(f"OpenAI not configured, using rule-based fallback: {exc}")
    except Exception as exc:
        logger.warning(f"OpenAI API call failed, falling back: {exc}")

    # Rule-based fallback
    try:
        reply, suggestions = _rule_based_reply(request_body.message)
        return ChatResponse(reply=reply, suggestions=suggestions)
    except Exception as exc:
        logger.exception(f"Chat fallback error: {exc}")
        raise HTTPException(status_code=500, detail="Chat service unavailable") from exc

"""
notebooks/model_training.py
===========================
Standalone model training script for TaxTracker AI ML Service.

Runs outside FastAPI to:
1. Load sample data from the data/ directory
2. Train the expense categoriser with an expanded dataset
3. Train the anomaly detector
4. Train the tax liability predictor
5. Save all models to the models/ directory
6. Print evaluation metrics

Usage:
    python notebooks/model_training.py
"""

import json
import os
import sys
from pathlib import Path

# Ensure the project root is on the path so we can import model_store helpers
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import numpy as np
import pandas as pd
import joblib
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    mean_absolute_error,
    r2_score,
)

# ── Config ─────────────────────────────────────────────────────────────────────

DATA_DIR = PROJECT_ROOT / "data"
MODEL_DIR = PROJECT_ROOT / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

CLASSIFIER_PATH = MODEL_DIR / "expense_classifier.joblib"
ANOMALY_PATH = MODEL_DIR / "anomaly_detector.joblib"
PREDICTOR_PATH = MODEL_DIR / "tax_predictor.joblib"

# ── 1. Load sample data ────────────────────────────────────────────────────────

print("=" * 60)
print("TaxTracker AI - Model Training Script")
print("=" * 60)

# Load expenses
with open(DATA_DIR / "sample_expenses.json") as f:
    expenses: list[dict] = json.load(f)

# Load income
with open(DATA_DIR / "sample_income.json") as f:
    income_records: list[dict] = json.load(f)

# Load user profile
with open(DATA_DIR / "sample_user.json") as f:
    user_profile: dict = json.load(f)

expenses_df = pd.DataFrame(expenses)
income_df = pd.DataFrame(income_records)

print(f"\n✅ Loaded {len(expenses_df)} expense records")
print(f"✅ Loaded {len(income_df)} income records")
print(f"✅ User: {user_profile['name']} | Bracket: {user_profile['taxBracket']}%")

# ── 2. Expense Categoriser ─────────────────────────────────────────────────────

print("\n" + "─" * 60)
print("STEP 1: Training Expense Categoriser")
print("─" * 60)

# Extended training corpus (from model_store + sample data)
from models.model_store import EXPENSE_TRAINING_DATA

# Add sample expense data (title → category pairs from real sample data)
sample_pairs = [
    (row["title"], row["category"])
    for _, row in expenses_df.iterrows()
    if "category" in row and pd.notna(row["category"])
]

all_pairs = EXPENSE_TRAINING_DATA + sample_pairs
texts = [t for t, _ in all_pairs]
labels = [l for _, l in all_pairs]

print(f"Total training samples: {len(texts)}")
print(f"Unique categories: {len(set(labels))}")

# Split
X_train, X_test, y_train, y_test = train_test_split(
    texts, labels, test_size=0.2, random_state=42, stratify=labels
)

# Build and train pipeline
classifier_pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=15_000,
        sublinear_tf=True,
        min_df=1,
    )),
    ("clf", LogisticRegression(
        max_iter=2000,
        C=2.0,
        solver="lbfgs",
        multi_class="auto",
        class_weight="balanced",
    )),
])

classifier_pipeline.fit(X_train, y_train)

# Evaluate
y_pred = classifier_pipeline.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\nTest Accuracy: {acc:.4f} ({acc*100:.2f}%)")

# Cross-validation
cv_scores = cross_val_score(classifier_pipeline, texts, labels, cv=5, scoring="accuracy")
print(f"5-Fold CV Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

print("\nClassification Report:")
print(classification_report(y_test, y_pred, zero_division=0))

# Save
joblib.dump(classifier_pipeline, CLASSIFIER_PATH)
print(f"\n✅ Expense classifier saved → {CLASSIFIER_PATH}")

# Quick sanity check
test_cases = [
    ("monthly rent payment landlord", "Housing"),
    ("netflix subscription", "Entertainment"),
    ("grocery shopping whole foods", "Food & Dining"),
    ("doctor copay visit", "Healthcare"),
    ("gas station fuel", "Transportation"),
    ("online course udemy python", "Education"),
]
print("\nSanity Checks:")
for text, expected in test_cases:
    pred = classifier_pipeline.predict([text])[0]
    proba = classifier_pipeline.predict_proba([text]).max()
    status = "✅" if pred == expected else "❌"
    print(f"  {status}  '{text[:40]:<40}' → {pred} ({proba:.2f}) [expected: {expected}]")

# ── 3. Anomaly Detector ────────────────────────────────────────────────────────

print("\n" + "─" * 60)
print("STEP 2: Training Anomaly Detector")
print("─" * 60)

# Build feature matrix from sample expenses + synthetic data
def parse_date_safe(d: str) -> pd.Timestamp:
    try:
        return pd.to_datetime(d)
    except Exception:
        return pd.Timestamp.today()

expenses_df["parsed_date"] = expenses_df["date"].apply(parse_date_safe)
expenses_df["dow"] = expenses_df["parsed_date"].dt.dayofweek.astype(float)
expenses_df["dom"] = expenses_df["parsed_date"].dt.day.astype(float)

cat_mean = expenses_df.groupby("category")["amount"].transform("mean")
cat_std = expenses_df.groupby("category")["amount"].transform("std").fillna(1.0)
expenses_df["zscore"] = ((expenses_df["amount"] - cat_mean) / (cat_std + 1e-9))

real_features = expenses_df[["amount", "dow", "dom", "zscore"]].values

# Augment with synthetic normal + anomalous data
rng = np.random.default_rng(42)
n_normal = 300
normal_amounts = rng.uniform(5, 800, n_normal)
normal_dow = rng.integers(0, 7, n_normal).astype(float)
normal_dom = rng.integers(1, 29, n_normal).astype(float)
normal_z = rng.normal(0, 1, n_normal)
synthetic_normal = np.column_stack([normal_amounts, normal_dow, normal_dom, normal_z])

n_anomaly = 30
anomaly_amounts = np.concatenate([
    rng.uniform(2000, 10000, n_anomaly // 2),
    rng.uniform(0.01, 0.50, n_anomaly // 2),
])
anomaly_dow = rng.integers(0, 7, n_anomaly).astype(float)
anomaly_dom = rng.integers(1, 29, n_anomaly).astype(float)
anomaly_z = rng.uniform(3, 6, n_anomaly)
synthetic_anomalous = np.column_stack([anomaly_amounts, anomaly_dow, anomaly_dom, anomaly_z])

X_anomaly = np.vstack([real_features, synthetic_normal, synthetic_anomalous])
print(f"Total anomaly training samples: {len(X_anomaly)}")

# Train IsolationForest
anomaly_detector = IsolationForest(
    n_estimators=150,
    contamination=0.09,
    random_state=42,
    max_samples="auto",
)
anomaly_detector.fit(X_anomaly)

# Evaluate on known anomalies
anomaly_scores = anomaly_detector.decision_function(synthetic_anomalous)
normal_scores = anomaly_detector.decision_function(synthetic_normal[:50])
print(f"\nMean score - Normal samples: {normal_scores.mean():.4f}")
print(f"Mean score - Anomalous samples: {anomaly_scores.mean():.4f}")

detected = (anomaly_detector.predict(synthetic_anomalous) == -1).sum()
print(f"Anomaly detection rate on injected anomalies: {detected}/{n_anomaly} ({detected/n_anomaly*100:.1f}%)")

# Save
joblib.dump(anomaly_detector, ANOMALY_PATH)
print(f"\n✅ Anomaly detector saved → {ANOMALY_PATH}")

# ── 4. Tax Predictor ──────────────────────────────────────────────────────────

print("\n" + "─" * 60)
print("STEP 3: Training Tax Predictor")
print("─" * 60)

# Build training data from income records + synthetic augmentation
income_df["parsed_date"] = income_df["date"].apply(parse_date_safe)
income_df["month"] = income_df["parsed_date"].dt.month
income_df["year"] = income_df["parsed_date"].dt.year

# Monthly aggregates
monthly_income = (
    income_df.groupby(["year", "month"])["amount"].sum().reset_index()
)

# Match with monthly expenses
expenses_df["year"] = expenses_df["parsed_date"].dt.year
expenses_df["month"] = expenses_df["parsed_date"].dt.month
monthly_expenses_agg = (
    expenses_df.groupby(["year", "month"])["amount"].sum().reset_index()
    .rename(columns={"amount": "expenses"})
)

monthly = monthly_income.merge(monthly_expenses_agg, on=["year", "month"], how="left").fillna(0)
monthly.rename(columns={"amount": "income"}, inplace=True)

# Compute YTD income and tax target
monthly = monthly.sort_values(["year", "month"])
monthly["ytd_income"] = monthly.groupby("year")["income"].cumsum()
standard_deduction = 14600
effective_rate = 0.22
monthly["tax_liability"] = (
    (monthly["income"] - monthly["expenses"] * 0.30) * effective_rate
).clip(lower=0)

# Build feature matrix from real data
X_real = monthly[["income", "expenses", "month", "ytd_income"]].values
y_real = monthly["tax_liability"].values

print(f"Real monthly data points: {len(X_real)}")

# Augment with synthetic data for robustness
rng2 = np.random.default_rng(99)
n_synth = 200
s_income = rng2.uniform(3000, 15000, n_synth)
s_expenses = rng2.uniform(1000, s_income * 0.8)
s_month = rng2.integers(1, 13, n_synth).astype(float)
s_ytd = s_income * s_month * rng2.uniform(0.85, 1.15, n_synth)

X_synth = np.column_stack([s_income, s_expenses, s_month, s_ytd])
rate_synth = 0.15 + (s_income / 15000) * 0.13
y_synth = np.maximum((s_income - s_expenses * 0.3) * rate_synth + rng2.normal(0, 80, n_synth), 0)

X_all = np.vstack([X_real, X_synth])
y_all = np.concatenate([y_real, y_synth])

print(f"Total tax predictor training samples: {len(X_all)}")

# Train
X_tr, X_te, y_tr, y_te = train_test_split(X_all, y_all, test_size=0.2, random_state=42)
tax_predictor = LinearRegression()
tax_predictor.fit(X_tr, y_tr)

y_pred_tax = tax_predictor.predict(X_te)
mae = mean_absolute_error(y_te, y_pred_tax)
r2 = r2_score(y_te, y_pred_tax)

print(f"\nTax Predictor Results:")
print(f"  R² Score:  {r2:.4f}")
print(f"  MAE:       ${mae:,.2f}")
print(f"  Coefficients: {tax_predictor.coef_}")
print(f"  Intercept:    {tax_predictor.intercept_:.2f}")

# Sanity check
test_inputs = np.array([
    [5000,  3000,  6,  30000],   # mid-year, moderate income
    [10000, 6000,  12, 120000],  # year-end, high income
    [3000,  2500,  1,  3000],    # January, low income
])
preds = tax_predictor.predict(test_inputs)
print(f"\nSanity Checks (monthly tax estimates):")
labels_test = ["Mid-year moderate", "Year-end high income", "January low income"]
for lbl, pred in zip(labels_test, preds):
    print(f"  {lbl}: ${max(pred, 0):,.2f}/month")

# Save
joblib.dump(tax_predictor, PREDICTOR_PATH)
print(f"\n✅ Tax predictor saved → {PREDICTOR_PATH}")

# ── 5. Summary ────────────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("TRAINING COMPLETE - Model Summary")
print("=" * 60)
print(f"  Expense Classifier:  {CLASSIFIER_PATH}")
print(f"    - Algorithm:     TF-IDF + LogisticRegression")
print(f"    - Test Accuracy: {acc*100:.2f}%")
print(f"    - CV Accuracy:   {cv_scores.mean()*100:.2f}%")
print(f"\n  Anomaly Detector:    {ANOMALY_PATH}")
print(f"    - Algorithm:     IsolationForest (n_estimators=150)")
print(f"    - Detection Rate: {detected/n_anomaly*100:.1f}% on injected anomalies")
print(f"\n  Tax Predictor:       {PREDICTOR_PATH}")
print(f"    - Algorithm:     LinearRegression")
print(f"    - R² Score:      {r2:.4f}")
print(f"    - MAE:           ${mae:,.2f}")
print("\nAll models saved successfully! ✅")
print("=" * 60)

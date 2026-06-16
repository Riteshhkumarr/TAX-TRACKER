"""
ModelStore: Singleton class managing all ML models for TaxTracker AI.

Handles training, persistence, and loading of:
- Expense Classifier (TF-IDF + LogisticRegression)
- Anomaly Detector (IsolationForest)
- Tax Predictor (LinearRegression)
"""

import os
import logging
from pathlib import Path
from typing import Optional

import numpy as np
import joblib
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

logger = logging.getLogger(__name__)

# Paths
MODEL_PATH = Path(os.getenv("MODEL_PATH", "./models"))
CLASSIFIER_PATH = MODEL_PATH / "expense_classifier.joblib"
ANOMALY_PATH = MODEL_PATH / "anomaly_detector.joblib"
PREDICTOR_PATH = MODEL_PATH / "tax_predictor.joblib"

# ── Training data ──────────────────────────────────────────────────────────────

EXPENSE_TRAINING_DATA: list[tuple[str, str]] = [
    # Housing
    ("monthly rent payment", "Housing"),
    ("rent due landlord", "Housing"),
    ("apartment rent", "Housing"),
    ("mortgage payment home loan", "Housing"),
    ("home insurance premium", "Housing"),
    ("property tax payment", "Housing"),
    ("HOA fees homeowners association", "Housing"),
    ("home maintenance repair plumber", "Housing"),
    ("renter insurance", "Housing"),
    ("moving expenses new apartment", "Housing"),
    ("storage unit rental", "Housing"),
    ("home security system", "Housing"),
    ("pest control home", "Housing"),
    ("lawn care landscaping", "Housing"),
    ("home renovation remodel", "Housing"),
    # Food & Dining
    ("grocery shopping supermarket", "Food & Dining"),
    ("whole foods market groceries", "Food & Dining"),
    ("restaurant dinner lunch", "Food & Dining"),
    ("coffee shop starbucks", "Food & Dining"),
    ("fast food mcdonalds burger", "Food & Dining"),
    ("pizza delivery order", "Food & Dining"),
    ("meal prep delivery hello fresh", "Food & Dining"),
    ("doordash uber eats food delivery", "Food & Dining"),
    ("farmers market produce", "Food & Dining"),
    ("wine spirits alcohol beverages", "Food & Dining"),
    ("chinese restaurant takeout", "Food & Dining"),
    ("sushi japanese dining", "Food & Dining"),
    ("breakfast brunch cafe", "Food & Dining"),
    ("bakery pastry bread", "Food & Dining"),
    ("costco wholesale groceries bulk", "Food & Dining"),
    # Transportation
    ("gas station fuel petrol", "Transportation"),
    ("uber lyft rideshare", "Transportation"),
    ("metro bus train ticket", "Transportation"),
    ("car insurance auto insurance", "Transportation"),
    ("vehicle registration dmv", "Transportation"),
    ("parking fee garage", "Transportation"),
    ("car wash detailing", "Transportation"),
    ("auto repair mechanic shop", "Transportation"),
    ("oil change tune up", "Transportation"),
    ("tire replacement rotation", "Transportation"),
    ("toll road bridge fee", "Transportation"),
    ("bike rental scooter", "Transportation"),
    ("airport taxi transfer", "Transportation"),
    ("flight ticket airline", "Transportation"),
    ("car rental enterprise hertz", "Transportation"),
    # Healthcare
    ("doctor visit copay", "Healthcare"),
    ("pharmacy prescription medication", "Healthcare"),
    ("dental cleaning checkup", "Healthcare"),
    ("eye exam glasses optometrist", "Healthcare"),
    ("health insurance premium", "Healthcare"),
    ("hospital emergency room", "Healthcare"),
    ("physical therapy session", "Healthcare"),
    ("gym membership fitness", "Healthcare"),
    ("vitamins supplements wellness", "Healthcare"),
    ("mental health therapy counseling", "Healthcare"),
    ("lab test blood work", "Healthcare"),
    ("urgent care clinic", "Healthcare"),
    ("chiropractic adjustment", "Healthcare"),
    ("allergy shots immunotherapy", "Healthcare"),
    ("dermatologist skin care medical", "Healthcare"),
    # Entertainment
    ("netflix subscription streaming", "Entertainment"),
    ("spotify music subscription", "Entertainment"),
    ("movie theater cinema", "Entertainment"),
    ("concert tickets live music", "Entertainment"),
    ("amazon prime subscription", "Entertainment"),
    ("hulu disney plus streaming", "Entertainment"),
    ("video games playstation xbox", "Entertainment"),
    ("bowling arcade games", "Entertainment"),
    ("sports event ticket stadium", "Entertainment"),
    ("book kindle purchase reading", "Entertainment"),
    ("museum art gallery ticket", "Entertainment"),
    ("amusement park theme park", "Entertainment"),
    ("golf course green fees", "Entertainment"),
    ("poker casino gambling", "Entertainment"),
    ("escape room activity", "Entertainment"),
    # Shopping
    ("amazon online shopping", "Shopping"),
    ("clothing apparel fashion", "Shopping"),
    ("shoes footwear purchase", "Shopping"),
    ("electronics gadgets tech purchase", "Shopping"),
    ("furniture home decor", "Shopping"),
    ("target walmart retail store", "Shopping"),
    ("department store macy's nordstrom", "Shopping"),
    ("gifts presents birthday", "Shopping"),
    ("jewelry accessories", "Shopping"),
    ("sporting goods equipment", "Shopping"),
    ("office supplies stationary", "Shopping"),
    ("pet supplies food grooming", "Shopping"),
    ("cosmetics beauty products sephora", "Shopping"),
    ("toys children kids", "Shopping"),
    ("online marketplace etsy ebay", "Shopping"),
    # Education
    ("tuition college university", "Education"),
    ("online course udemy coursera", "Education"),
    ("textbooks school supplies", "Education"),
    ("student loan payment", "Education"),
    ("tutoring lessons private", "Education"),
    ("professional certification exam", "Education"),
    ("workshop seminar conference", "Education"),
    ("language learning duolingo rosetta", "Education"),
    ("coding bootcamp programming course", "Education"),
    ("library fee research database", "Education"),
    # Business
    ("office supplies business", "Business"),
    ("software subscription saas tools", "Business"),
    ("marketing advertising facebook google ads", "Business"),
    ("business travel expense", "Business"),
    ("client entertainment dinner", "Business"),
    ("professional services consulting", "Business"),
    ("accounting bookkeeping tax prep", "Business"),
    ("legal services attorney", "Business"),
    ("domain hosting website", "Business"),
    ("coworking space membership", "Business"),
    ("business insurance liability", "Business"),
    ("equipment purchase depreciation", "Business"),
    # Utilities
    ("electric bill utility", "Utilities"),
    ("gas natural utility heating", "Utilities"),
    ("water sewer utility bill", "Utilities"),
    ("internet provider comcast att", "Utilities"),
    ("cell phone mobile plan", "Utilities"),
    ("cable tv satellite", "Utilities"),
    ("trash recycling waste management", "Utilities"),
    ("phone landline service", "Utilities"),
    # Travel
    ("hotel accommodation booking", "Travel"),
    ("airbnb vacation rental", "Travel"),
    ("international flight ticket", "Travel"),
    ("travel insurance trip protection", "Travel"),
    ("cruise ship vacation", "Travel"),
    ("resort spa vacation", "Travel"),
    ("passport visa fees", "Travel"),
    ("luggage baggage fee", "Travel"),
    ("tourist attraction sightseeing", "Travel"),
    ("souvenir travel shopping", "Travel"),
    # Other
    ("bank fee atm withdrawal", "Other"),
    ("charitable donation nonprofit", "Other"),
    ("subscription service monthly", "Other"),
    ("miscellaneous purchase", "Other"),
    ("transfer wire payment", "Other"),
    ("fine penalty late fee", "Other"),
    ("cash withdrawal", "Other"),
    ("loan payment interest", "Other"),
]


def _build_classifier_training_data() -> tuple[list[str], list[str]]:
    """Return parallel lists of texts and labels."""
    texts = [t for t, _ in EXPENSE_TRAINING_DATA]
    labels = [l for _, l in EXPENSE_TRAINING_DATA]
    return texts, labels


def _build_anomaly_training_data() -> np.ndarray:
    """
    Build synthetic transaction feature matrix for IsolationForest training.
    Columns: [amount, day_of_week, day_of_month, amount_zscore_proxy]
    """
    rng = np.random.default_rng(42)

    # Normal transactions: amounts between $5 and $500
    n_normal = 200
    normal_amounts = rng.uniform(5, 500, n_normal)
    normal_dow = rng.integers(0, 7, n_normal).astype(float)
    normal_dom = rng.integers(1, 29, n_normal).astype(float)
    normal_zscore = rng.normal(0, 1, n_normal)
    normal = np.column_stack([normal_amounts, normal_dow, normal_dom, normal_zscore])

    # Anomalous transactions: very large or very small amounts
    n_anomaly = 20
    anomaly_amounts = np.concatenate([
        rng.uniform(2000, 10000, n_anomaly // 2),   # unusually large
        rng.uniform(0.01, 0.50, n_anomaly // 2),    # unusually small
    ])
    anomaly_dow = rng.integers(0, 7, n_anomaly).astype(float)
    anomaly_dom = rng.integers(1, 29, n_anomaly).astype(float)
    anomaly_zscore = rng.uniform(3, 6, n_anomaly)
    anomalous = np.column_stack([anomaly_amounts, anomaly_dow, anomaly_dom, anomaly_zscore])

    return np.vstack([normal, anomalous])


def _build_tax_predictor_training_data() -> tuple[np.ndarray, np.ndarray]:
    """
    Build synthetic training data for LinearRegression tax predictor.
    Features: [monthly_income, monthly_expenses, month_number, ytd_income]
    Target:   tax_liability (simplified effective-rate estimate)
    """
    rng = np.random.default_rng(42)
    n = 100

    monthly_income = rng.uniform(3000, 15000, n)
    monthly_expenses = rng.uniform(1000, monthly_income * 0.8)
    month_number = rng.integers(1, 13, n).astype(float)
    ytd_income = monthly_income * month_number * rng.uniform(0.9, 1.1, n)

    X = np.column_stack([monthly_income, monthly_expenses, month_number, ytd_income])

    # Approximate tax: effective rate ~ 15-28% of (income - 30% deductions)
    effective_rate = 0.15 + (monthly_income / 15000) * 0.13
    tax_liability = (monthly_income - monthly_expenses * 0.3) * effective_rate
    tax_liability = np.maximum(tax_liability, 0) + rng.normal(0, 50, n)

    return X, tax_liability


class ModelStore:
    """
    Singleton-style store for all ML models used by TaxTracker AI.

    Attributes
    ----------
    expense_classifier : sklearn.pipeline.Pipeline or None
        TF-IDF + LogisticRegression pipeline for expense categorisation.
    anomaly_detector : IsolationForest or None
        Trained anomaly detector.
    tax_predictor : LinearRegression or None
        Trained tax liability predictor.
    """

    def __init__(self) -> None:
        self.expense_classifier: Optional[Pipeline] = None
        self.anomaly_detector: Optional[IsolationForest] = None
        self.tax_predictor: Optional[LinearRegression] = None

    # ── Public API ─────────────────────────────────────────────────────────────

    def load_or_train_models(self) -> None:
        """
        Load models from disk if they exist, otherwise train from scratch and save.
        """
        MODEL_PATH.mkdir(parents=True, exist_ok=True)

        self.expense_classifier = self._load_or_train_classifier()
        self.anomaly_detector = self._load_or_train_anomaly_detector()
        self.tax_predictor = self._load_or_train_tax_predictor()

        logger.info("All models ready.")

    # ── Private helpers ────────────────────────────────────────────────────────

    def _load_or_train_classifier(self) -> Pipeline:
        if CLASSIFIER_PATH.exists():
            logger.info(f"Loading expense classifier from {CLASSIFIER_PATH}")
            return joblib.load(CLASSIFIER_PATH)

        logger.info("Training expense classifier on synthetic data…")
        texts, labels = _build_classifier_training_data()

        pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=10_000,
                sublinear_tf=True,
            )),
            ("clf", LogisticRegression(
                max_iter=1000,
                C=1.0,
                solver="lbfgs",
                multi_class="auto",
            )),
        ])

        X_train, X_test, y_train, y_test = train_test_split(
            texts, labels, test_size=0.2, random_state=42, stratify=labels
        )
        pipeline.fit(X_train, y_train)
        acc = accuracy_score(y_test, pipeline.predict(X_test))
        logger.info(f"Expense classifier accuracy: {acc:.3f}")

        joblib.dump(pipeline, CLASSIFIER_PATH)
        logger.info(f"Saved expense classifier to {CLASSIFIER_PATH}")
        return pipeline

    def _load_or_train_anomaly_detector(self) -> IsolationForest:
        if ANOMALY_PATH.exists():
            logger.info(f"Loading anomaly detector from {ANOMALY_PATH}")
            return joblib.load(ANOMALY_PATH)

        logger.info("Training anomaly detector on synthetic data…")
        X = _build_anomaly_training_data()

        detector = IsolationForest(
            n_estimators=100,
            contamination=0.1,
            random_state=42,
        )
        detector.fit(X)
        logger.info("Anomaly detector trained.")

        joblib.dump(detector, ANOMALY_PATH)
        logger.info(f"Saved anomaly detector to {ANOMALY_PATH}")
        return detector

    def _load_or_train_tax_predictor(self) -> LinearRegression:
        if PREDICTOR_PATH.exists():
            logger.info(f"Loading tax predictor from {PREDICTOR_PATH}")
            return joblib.load(PREDICTOR_PATH)

        logger.info("Training tax predictor on synthetic data…")
        X, y = _build_tax_predictor_training_data()

        predictor = LinearRegression()
        predictor.fit(X, y)

        # Quick R² log
        r2 = predictor.score(X, y)
        logger.info(f"Tax predictor R²: {r2:.3f}")

        joblib.dump(predictor, PREDICTOR_PATH)
        logger.info(f"Saved tax predictor to {PREDICTOR_PATH}")
        return predictor

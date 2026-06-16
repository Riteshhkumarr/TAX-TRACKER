# ML Workflow Documentation

## Overview

The TaxTracker AI ML microservice is a FastAPI Python service that provides 5 AI-powered features. It runs on port 8000 and is called by the Node.js backend.

---

## Architecture

```
React Frontend
     ↓ (HTTP)
Node.js Backend (port 5000)
     ↓ (HTTP via axios)
Python FastAPI ML Service (port 8000)
     ↓
Scikit-learn Models + OpenAI API
```

---

## Feature 1: Expense Auto-Categorization

### Endpoint
`POST http://localhost:8000/categorize`

### Algorithm
- **Model:** TF-IDF Vectorizer + Logistic Regression Pipeline
- **Input:** Expense title + description (concatenated text)
- **Output:** Category label + confidence score + top-3 suggestions

### Categories
| Category | Examples |
|----------|---------|
| Housing | Rent, mortgage, utilities, repairs |
| Food & Dining | Restaurants, groceries, delivery |
| Transportation | Gas, uber, car payment, parking |
| Healthcare | Doctor visits, prescriptions, insurance |
| Entertainment | Netflix, movies, concerts, games |
| Shopping | Clothing, electronics, Amazon |
| Education | Tuition, books, courses, training |
| Business | Software, office supplies, meetings |
| Utilities | Electric, water, internet, phone |
| Travel | Flights, hotels, vacation |
| Other | Uncategorized items |

### Training Data
- 11 categories × ~30 examples each = ~330 labeled samples
- Generated synthetic training data at startup
- Model re-trained if no saved model found at `./models/expense_classifier.pkl`

### Performance (on synthetic data)
- Accuracy: ~85-92%
- Top-3 accuracy: ~97%

---

## Feature 2: Tax Liability Prediction

### Endpoint
`POST http://localhost:8000/predict/tax`

### Algorithm
- **Model:** Linear Regression (expandable to Gradient Boosting)
- **Features:**
  - Monthly income (average)
  - Monthly expenses (average)
  - Month number (seasonal patterns)
  - Year-to-date cumulative income
- **Target:** Quarterly tax liability

### Output
```json
{
  "current_year_estimate": 18500.00,
  "next_quarter_estimate": 4625.00,
  "quarterly_breakdown": [
    {"quarter": "Q1", "estimated_tax": 4200, "due_date": "2024-04-15"},
    {"quarter": "Q2", "estimated_tax": 4400, "due_date": "2024-06-17"},
    {"quarter": "Q3", "estimated_tax": 4800, "due_date": "2024-09-16"},
    {"quarter": "Q4", "estimated_tax": 5100, "due_date": "2025-01-15"}
  ],
  "confidence": 0.82,
  "factors": ["High income growth trend", "Reduced deductions this year"]
}
```

### US Tax Brackets (2024, Single Filer)
| Rate | Income Range |
|------|-------------|
| 10% | $0 – $11,600 |
| 12% | $11,601 – $47,150 |
| 22% | $47,151 – $100,525 |
| 24% | $100,526 – $191,950 |
| 32% | $191,951 – $243,725 |
| 35% | $243,726 – $609,350 |
| 37% | Over $609,350 |

---

## Feature 3: Anomaly Detection

### Endpoint
`POST http://localhost:8000/anomaly/detect`

### Algorithm
- **Model:** Isolation Forest (contamination=0.1)
- **Features:**
  - Transaction amount
  - Day of week (0=Monday, 6=Sunday)
  - Day of month
  - Amount deviation from category mean (z-score proxy)

### Severity Classification
| Anomaly Score | Severity | Description |
|--------------|----------|-------------|
| < -0.5 | High | Very unusual transaction |
| -0.5 to -0.2 | Medium | Moderately unusual |
| -0.2 to 0 | Low | Slightly unusual |

### Example Output
```json
{
  "anomalies": [
    {
      "id": "expense_123",
      "anomaly_score": -0.72,
      "severity": "high",
      "reason": "Transaction amount is 4.2x higher than usual for this category"
    }
  ],
  "total_anomalies": 3,
  "anomaly_rate": 0.06
}
```

---

## Feature 4: Financial Health Score

### Endpoint
`POST http://localhost:8000/insights/generate`

### Algorithm
Weighted scoring system (0-100):

| Component | Weight | Calculation |
|-----------|--------|-------------|
| Savings Rate | 30% | (Income - Expenses) / Income × 100 |
| Tax Efficiency | 25% | Deductions / Income ratio vs benchmark |
| Expense Control | 25% | Expenses / Income ratio (lower = better) |
| Income Stability | 20% | 1 - (monthly std deviation / mean) |

### Score Interpretation
| Score | Grade | Description |
|-------|-------|-------------|
| 80-100 | Excellent | Strong financial health |
| 60-79 | Good | Above average, room to improve |
| 40-59 | Fair | Needs attention in several areas |
| 0-39 | Poor | Immediate action recommended |

---

## Feature 5: AI Chatbot (TaxBot)

### Endpoint
`POST http://localhost:8000/chat`

### Mode 1: OpenAI GPT-4o
- Requires `OPENAI_API_KEY` environment variable
- System prompt: Expert US tax advisor context
- Includes user's financial context in system message
- Streaming supported (future)

### Mode 2: Rule-based Fallback (No API Key Required)
Pre-written answers for common tax questions:
- Standard deduction amounts
- Tax bracket explanations
- Quarterly payment deadlines
- Business expense deductions
- Home office deduction
- Retirement contribution limits (401k, IRA)
- Capital gains tax rates
- Self-employment tax
- SALT deduction limits

### Request Format
```json
{
  "message": "What can I deduct as a home office?",
  "context": {
    "total_income": 85000,
    "total_expenses": 42000,
    "tax_bracket": 22
  },
  "history": [
    {"role": "user", "content": "Previous question..."},
    {"role": "assistant", "content": "Previous answer..."}
  ]
}
```

---

## Model Training

### Automatic Training
Models are trained automatically on first startup:
1. Synthetic training data is generated
2. Models are trained on the data
3. Saved to `./models/` directory using joblib
4. Subsequent startups load from disk (faster)

### Manual Retraining
```bash
cd ml-service
python notebooks/model_training.py
```

### Adding Real Training Data
Replace synthetic data in `models/model_store.py`:
```python
# Load your labeled dataset
import pandas as pd
df = pd.read_csv('data/labeled_expenses.csv')
X = df['description'].tolist()
y = df['category'].tolist()
```

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/categorize` | POST | Categorize single expense |
| `/categorize/bulk` | POST | Categorize multiple expenses |
| `/predict/tax` | POST | Predict tax liability |
| `/predict/budget` | GET | Budget recommendations |
| `/anomaly/detect` | POST | Detect transaction anomalies |
| `/insights/generate` | POST | Generate financial insights |
| `/chat` | POST | Chat with TaxBot |

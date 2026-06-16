# TaxTracker AI — ML Service

FastAPI microservice powering the AI features of the TaxTracker application.

## Features

| Endpoint | Description |
|---|---|
| `POST /categorize/` | ML-based single expense categorization |
| `POST /categorize/bulk` | Batch categorization |
| `POST /predict/tax` | Annual + quarterly tax liability prediction |
| `GET /predict/budget` | 50/30/20 budget allocation recommendations |
| `POST /anomaly/detect` | IsolationForest anomaly detection |
| `POST /insights/generate` | Financial health score + actionable insights |
| `POST /chat/` | TaxBot chat (OpenAI GPT or rule-based fallback) |
| `GET /health` | Health check |

## Quick Start

```bash
# 1. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment (optional — service works without OpenAI key)
copy .env.example .env
# Edit .env and add your OPENAI_API_KEY if desired

# 4. Run the service
python main.py
# or
uvicorn main:app --reload --port 8000
```

The service auto-trains all ML models on first startup. Models are cached in `models/`.

## Project Structure

```
ml-service/
├── main.py                    # FastAPI app, CORS, router registration
├── requirements.txt
├── .env.example
├── Dockerfile
├── models/
│   ├── __init__.py
│   └── model_store.py         # Singleton: train/load/save all 3 ML models
├── routers/
│   ├── __init__.py
│   ├── categorize.py          # TF-IDF + LogisticRegression
│   ├── predict.py             # LinearRegression tax + budget
│   ├── anomaly.py             # IsolationForest
│   ├── insights.py            # Rule-based financial scoring
│   └── chat.py                # OpenAI GPT + rule-based fallback
├── data/
│   ├── sample_expenses.json   # 50 realistic sample expenses
│   ├── sample_income.json     # 50 income records (2 years)
│   └── sample_user.json       # Sample user profile
└── notebooks/
    └── model_training.py      # Standalone training + evaluation script
```

## ML Models

### Expense Classifier
- **Algorithm**: TF-IDF (bigrams, 10k features) + LogisticRegression
- **Categories**: Housing, Food & Dining, Transportation, Healthcare, Entertainment, Shopping, Education, Business, Utilities, Travel, Other
- **Training**: 130+ labeled examples + synthetic augmentation

### Anomaly Detector
- **Algorithm**: IsolationForest (contamination=0.1)
- **Features**: amount, day_of_week, day_of_month, category z-score
- **Output**: anomaly score + severity (low/medium/high) + human reason

### Tax Predictor
- **Algorithm**: LinearRegression
- **Features**: monthly_income, monthly_expenses, month_number, ytd_income
- **Output**: monthly tax estimate → annualized / quarterly breakdown

## Running the Training Script

```bash
# From the ml-service/ directory
python notebooks/model_training.py
```

This re-trains all models, prints detailed evaluation metrics, and overwrites saved `.joblib` files.

## API Docs

When the service is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Docker

```bash
docker build -t taxtracker-ml .
docker run -p 8000:8000 -e OPENAI_API_KEY=your_key taxtracker-ml
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | _(empty)_ | Optional. Enables GPT-powered chat. |
| `MODEL_PATH` | `./models` | Directory to save/load `.joblib` model files |
| `PORT` | `8000` | HTTP port |
| `NODE_BACKEND_URL` | `http://localhost:5000` | URL of the Node.js backend |

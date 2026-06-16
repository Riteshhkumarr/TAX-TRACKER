# 🧾 TaxTracker AI — Smart Financial Intelligence Platform

> An AI-powered full-stack web application to track income, expenses, tax liabilities, and receive intelligent financial insights.

![TaxTracker AI](https://img.shields.io/badge/TaxTracker-AI%20Powered-6366F1?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [ML Workflow](#-ml-workflow)
- [Deployment Guide](#-deployment-guide)
- [Future Enhancements](#-future-enhancements)

---

## ✨ Features

### Core Features
- ✅ **Income Tracking** — Add/Edit/Delete income records with categories
- ✅ **Expense Tracking** — Track expenses with receipt upload and OCR
- ✅ **Real-time Tax Calculation** — US 2024 federal tax brackets
- ✅ **Monthly & Yearly Analytics** — Interactive charts and breakdowns
- ✅ **PDF & Excel Export** — Professional tax reports
- ✅ **Multi-user Support** — JWT-secured multi-tenant system
- ✅ **Notification System** — Tax deadline reminders

### AI/ML Features
- 🤖 **Expense Auto-Categorization** — ML-powered text classification
- 🔮 **Tax Liability Prediction** — Forecast next quarter's tax
- 🚨 **Anomaly Detection** — Flag unusual transactions
- 📊 **Financial Health Score** — Weighted scoring algorithm
- 💬 **AI Chatbot** — Tax advisor powered by GPT-4o (or rule-based fallback)
- 💡 **Smart Insights** — Personalized savings recommendations
- 🎤 **Voice Assistant** — Add expenses by voice (Web Speech API)

### UI/UX Features
- 🌙 **Dark/Light Mode** — Persistent theme preference
- 📱 **Fully Responsive** — Mobile, tablet, desktop
- ✨ **Smooth Animations** — Framer Motion transitions
- 🔍 **Search & Filter** — All data tables
- 📈 **Interactive Charts** — Recharts data visualizations

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Framer Motion |
| **Backend** | Node.js 18, Express.js, Mongoose |
| **Database** | MongoDB (Atlas or local) |
| **AI/ML Service** | Python 3.11, FastAPI, Scikit-learn |
| **Authentication** | JWT (jsonwebtoken) + bcrypt |
| **File Upload** | Multer |
| **PDF Generation** | PDFKit |
| **Excel Export** | ExcelJS |
| **AI Chatbot** | OpenAI GPT-4o (optional) |

---

## 📁 Project Structure

```
tax-tracker/
├── frontend/               # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Axios API calls
│   │   └── utils/          # Helpers and constants
│   └── index.html
│
├── backend/                # Node.js + Express
│   ├── config/             # Database connection
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth, error, upload
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── utils/              # Helpers, PDF generator
│   └── server.js
│
├── ml-service/             # Python FastAPI ML
│   ├── routers/            # API endpoints
│   ├── models/             # Trained ML models
│   ├── data/               # Sample datasets
│   └── main.py
│
├── docs/                   # Documentation
│   ├── api-routes.md
│   ├── database-schema.md
│   └── ml-workflow.md
│
└── README.md
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Check |
|-------------|---------|-------|
| Node.js | ≥ 18.0 | `node --version` |
| npm | ≥ 9.0 | `npm --version` |
| Python | ≥ 3.11 | `python --version` |
| pip | ≥ 23.0 | `pip --version` |
| MongoDB | Atlas or Local | — |
| Git | Any | `git --version` |

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/tax-tracker.git
cd tax-tracker
```

### Step 2: Set Up the Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
copy .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### Step 3: Set Up the Frontend

```bash
cd ../frontend

# Install dependencies
npm install
```

### Step 4: Set Up the ML Service

```bash
cd ../ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
copy .env.example .env
# Edit .env with your OpenAI API key (optional)
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taxtracker
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_chars
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### ML Service (`ml-service/.env`)

```env
OPENAI_API_KEY=sk-your_openai_api_key_here  # Optional - chatbot works without it
MODEL_PATH=./models
PORT=8000
NODE_BACKEND_URL=http://localhost:5000
```

> **Note:** The OpenAI API key is optional. If not provided, the chatbot uses a rule-based fallback with pre-written tax FAQ answers.

---

## ▶️ Running the Application

You need **three terminal windows** to run all services:

### Terminal 1 — Backend API Server

```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

### Terminal 2 — ML Service

```bash
cd ml-service
# Activate venv first
venv\Scripts\activate   # Windows
uvicorn main:app --reload --port 8000
# ML service starts at http://localhost:8000
# Models are trained automatically on first startup
```

### Terminal 3 — Frontend Dev Server

```bash
cd frontend
npm run dev
# App opens at http://localhost:5173
```

### Access the Application

Open your browser and navigate to: **http://localhost:5173**

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get JWT |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |
| PUT | `/auth/me` | Update profile |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |

### Income Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/income` | List all income records |
| POST | `/income` | Create income record |
| GET | `/income/:id` | Get single record |
| PUT | `/income/:id` | Update record |
| DELETE | `/income/:id` | Delete record |
| GET | `/income/analytics/monthly` | Monthly analytics |
| GET | `/income/analytics/yearly` | Yearly analytics |

### Expense Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expenses` | List all expenses |
| POST | `/expenses` | Create expense |
| GET | `/expenses/:id` | Get single expense |
| PUT | `/expenses/:id` | Update expense |
| DELETE | `/expenses/:id` | Delete expense |
| POST | `/expenses/upload-receipt` | Upload receipt image |
| GET | `/expenses/analytics/categories` | Category breakdown |
| GET | `/expenses/analytics/monthly` | Monthly analytics |

### Tax Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tax/calculate` | Calculate tax liability |
| GET | `/tax/records` | All tax records |
| GET | `/tax/records/:year` | Records for year |
| PUT | `/tax/records/:id` | Update record |
| GET | `/tax/deadlines` | Quarterly deadlines |

### AI/ML Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ai/insights` | Personalized AI insights |
| GET | `/ai/financial-score` | Financial health score |
| POST | `/ai/categorize-expense` | Auto-categorize expense |
| GET | `/ai/anomalies` | Detected anomalies |
| GET | `/ai/tax-prediction` | Predicted tax liability |
| POST | `/ai/chat` | Chat with TaxBot |

### Reports Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/pdf/:year` | Download PDF report |
| GET | `/reports/excel/:year` | Download Excel report |
| GET | `/reports/summary` | JSON summary |

---

## 🗄️ Database Schema

See [docs/database-schema.md](./docs/database-schema.md) for the full MongoDB schema.

**Collections:**
- `users` — User accounts and preferences
- `incomes` — Income transaction records
- `expenses` — Expense records with ML categories
- `taxrecords` — Quarterly/annual tax summaries
- `notifications` — System and deadline notifications

---

## 🤖 ML Workflow

See [docs/ml-workflow.md](./docs/ml-workflow.md) for the complete ML pipeline documentation.

### Models

| Model | Algorithm | Purpose |
|-------|-----------|---------|
| Expense Classifier | TF-IDF + Logistic Regression | Auto-categorize expenses |
| Anomaly Detector | Isolation Forest | Flag unusual transactions |
| Tax Predictor | Linear Regression | Forecast tax liability |
| Financial Scorer | Weighted Algorithm | Health score 0-100 |
| TaxBot | GPT-4o / Rule-based | Tax Q&A chatbot |

### ML Service Endpoints (Port 8000)

| Endpoint | Description |
|----------|-------------|
| `POST /categorize` | Categorize expense text |
| `POST /anomaly/detect` | Detect anomalous transactions |
| `POST /predict/tax` | Predict tax liability |
| `POST /insights/generate` | Generate financial insights |
| `POST /chat` | Chat with TaxBot |

---

## 🌍 Deployment Guide

### Frontend — Vercel

1. Push the `frontend/` folder to a GitHub repo
2. Connect to [Vercel](https://vercel.com)
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables (set `VITE_API_URL` to your backend URL)

### Backend — Render

1. Push the `backend/` folder to a GitHub repo
2. Create a new **Web Service** on [Render](https://render.com)
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add all environment variables from `.env`
6. Set `MONGODB_URI` to your MongoDB Atlas connection string

### ML Service — Render (Docker)

1. Create a `Dockerfile` in `ml-service/`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```
2. Deploy as a Docker service on Render
3. Add `OPENAI_API_KEY` if using chatbot

### MongoDB — Atlas

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a database user with read/write permissions
3. Whitelist `0.0.0.0/0` for IP access (or specific IPs)
4. Copy the connection string to `MONGODB_URI` in backend `.env`

---

## 🔭 Future Enhancements

| Feature | Description | Priority |
|---------|-------------|----------|
| Bank Account Sync | Plaid API integration for automatic transaction import | High |
| Multi-currency | Live FX rates, automatic currency conversion | High |
| Tax Form Auto-fill | Generate IRS 1040, W-2 from your data | Medium |
| Mobile App | React Native mobile application | Medium |
| LSTM Forecasting | Deep learning for income/expense prediction | Medium |
| QuickBooks Sync | Import/export to accounting software | Low |
| Blockchain Audit | Immutable expense audit trail | Low |
| Family Tax Planning | Collaborative multi-user household planning | Low |
| AI Tax Filing | Guided step-by-step tax return filing | High |
| Investment Tracker | Capital gains and portfolio tracking | Medium |

---

## 🧪 Sample Test Data

The ML service includes sample datasets in `ml-service/data/`:
- `sample_expenses.json` — 50 categorized expense records
- `sample_income.json` — 24 months of income data
- `sample_user.json` — Sample user financial profile

To seed the database with test data, run:
```bash
cd backend
node utils/seedData.js
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📬 Contact

Built with ❤️ using AI-powered development.
For questions or support, open a GitHub issue.

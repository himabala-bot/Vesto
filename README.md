# VESTO - Modern Personal Finance & Safe to Spend Web App

**VESTO** is a high-polish personal finance application built to help users clearly understand, track, and control their spending with a core emphasis on the **Safe to Spend** calculation engine.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + Recharts + Lucide Icons + Sonner + Canvas Confetti
- **Backend**: Django 5 + Django REST Framework + PostgreSQL (dj-database-url / SQLite for local) + JWT Authentication (SimpleJWT) + WhiteNoise + Gunicorn

---

## ⚡ Quick Start (Run Locally)

### 1. Backend (Django REST API)
```bash
# Navigate to project root and create virtual environment
python -m venv backend_env

# Activate virtual environment
# Windows:
.\backend_env\Scripts\activate
# Linux / macOS:
source backend_env/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run migrations
cd backend
python manage.py migrate

# Start Django server (runs on http://127.0.0.1:8000)
python manage.py runserver 8000
```

### 2. Frontend (Next.js)
```bash
# In a new terminal, navigate to frontend/
cd frontend

# Install dependencies
npm install

# Start Next.js development server (runs on http://localhost:3000)
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🌟 Key Features

1. **Interactive Safe to Spend Calculator**: Works immediately on the landing page without login.
2. **Safe to Spend Daily Allowance**: Dynamic formula computing your exact safe daily and monthly spending limit:
   $$\text{Safe to Spend} = \frac{\text{Income} - \text{Committed Bills} - \text{Savings Goals} - \text{Spent So Far}}{\text{Remaining Days in Month}}$$
3. **Real Financial Ledger**: Complete transaction management with income/expense tracking, search, category filters, and CSV export.
4. **Monthly Category Budgets**: Category threshold planner with utilization progress bars and 1-click previous month copying.
5. **Milestone Savings Goals**: Goal cards with progress dials, fund deposit modal, and celebration confetti animation.
6. **Recurring Subscriptions Radar**: Tracks recurring bills, monthly/annual commitment sums, and 1-click payment logging.
7. **Insights & Spending Velocity**: Day-by-day cumulative velocity line curves comparing current month with prior month, and rule-based smart alerts.
8. **Settings & Custom Categories**: Change currency (`$`, `€`, `£`, `₹`, `CAD`, `AUD`, `JPY`), customize categories with custom colors, and set financial baseline targets.

---

## 🚀 Production Deployment

See the comprehensive step-by-step production deployment guide in [DEPLOYMENT.md](DEPLOYMENT.md) for deploying Next.js to **Vercel** and Django to **Render / Railway / Fly.io** with managed **PostgreSQL**.

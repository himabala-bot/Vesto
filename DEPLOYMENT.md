# VESTO - Complete Production Deployment Guide

This guide provides step-by-step instructions for deploying the **VESTO** personal finance application across a modern production architecture: **Next.js on Vercel** and **Django REST API on Render / Railway / Fly.io** with **Managed PostgreSQL**.

---

## 1. Architectural Overview & Vercel Limitations

### Can Django Run Directly on Vercel?
- **Why Separate Backend Hosting is Recommended**: Vercel is optimized for Serverless / Edge compute (Next.js, Node.js). While WSGI/ASGI adapters for Vercel Serverless exist, they have strict limitations:
  1. **Execution Timeouts**: Serverless functions timeout after 10-15s (Hobby tier).
  2. **Database Connection Pool Exhaustion**: Each serverless invocation spawns new database connections, easily overwhelming PostgreSQL connection limits without an external connection pooler like PgBouncer.
  3. **Stateless Ephemeral FS**: Migrations, cron jobs, and background workers cannot run persistently on serverless functions.
  4. **Cold Starts**: PyPI packages (NumPy, Psycopg2, Pandas) cause slow Python cold starts.
- **Recommended Best Practice**:
  - **Frontend**: Deploy Next.js to **Vercel** (Global Edge CDN, instantaneous SSR/prerendering).
  - **Backend**: Deploy Django + Gunicorn to **Render** or **Railway** (Persistent containerized Linux process with WhiteNoise static assets).
  - **Database**: Use Managed **PostgreSQL** (Neon, Supabase, Render Postgres, or AWS RDS).

---

## 2. Step 1: Provision Managed PostgreSQL Database

You can provision a free or low-cost cloud PostgreSQL instance using **Neon**, **Supabase**, or **Render**:

1. Go to [Neon.tech](https://neon.tech) (or Render Dashboard -> "New PostgreSQL").
2. Create a database named `vestodb`.
3. Copy your pooled connection URI string, which looks like:
   ```
   postgres://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/vestodb?sslmode=require
   ```

---

## 3. Step 2: Deploy Django Backend (Render / Railway)

### A. Deploy on Render (Recommended)
1. Push your repository to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com) and click **"New +" -> "Web Service"**.
3. Connect your GitHub repository.
4. Set the following build configuration:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
     ```
   - **Start Command**:
     ```bash
     gunicorn vesto_backend.wsgi:application
     ```
5. Add the **Environment Variables** in the Render UI:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `PYTHON_VERSION` | `3.12.10` | Python runtime version |
   | `DEBUG` | `False` | Disables debug mode in production |
   | `SECRET_KEY` | *(Generate a 64+ char random string)* | Production JWT & Django signature key |
   | `DATABASE_URL` | `postgres://user:pass@host/vestodb?sslmode=require` | Managed PostgreSQL connection string |
   | `ALLOWED_HOSTS` | `.onrender.com,api.yourdomain.com` | Allowed host headers |
   | `CORS_ALLOWED_ORIGINS` | `https://your-vesto-app.vercel.app` | Frontend production origin |

6. Click **Create Web Service**.
7. Once deployed, note your backend URL (e.g. `https://vesto-api.onrender.com`).
8. Test the health endpoint:
   ```bash
   curl https://vesto-api.onrender.com/api/health/
   # Response: {"status":"healthy","service":"VESTO API Engine","version":"1.0.0"}
   ```

---

## 4. Step 3: Deploy Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import your GitHub repository.
3. In the project setup settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click "Edit" and select `frontend`.
   - **Build Command**: `npm run build` (automatic)
   - **Output Directory**: `.next` (automatic)
4. Configure **Environment Variables** in Vercel:
   | Variable | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://vesto-api.onrender.com/api` |

   > **Note:** Ensure `NEXT_PUBLIC_API_URL` includes the `/api` suffix and matches your deployed backend URL.

5. Click **Deploy**. Vercel will build and deploy your frontend globally across edge regions.

---

## 5. Step 4: Verify Frontend-to-Backend Connection & CORS

1. In Render (or Railway), ensure your backend's `CORS_ALLOWED_ORIGINS` variable includes your exact Vercel production URL:
   ```env
   CORS_ALLOWED_ORIGINS=https://your-vesto-app.vercel.app,https://your-custom-domain.com
   ```
2. Open your live Vercel app (e.g., `https://your-vesto-app.vercel.app`):
   - **Landing Page**: Test the interactive "Safe to Spend" calculator.
   - **Registration Flow**: Register a new user account.
   - **Check Browser Network Tab**: Verify that requests to `https://vesto-api.onrender.com/api/auth/register/` return `201 Created` with JWT access and refresh tokens.
   - **Dashboard**: Confirm the dashboard opens with real zero-data initial state, add income, and verify Safe to Spend renders real calculations.

---

## 6. Production Security & Best Practices Checklist

- [x] **No Secrets Exposed**: All sensitive database credentials, JWT secret keys, and passwords reside exclusively in server-side environment variables.
- [x] **WhiteNoise Static Hosting**: Static assets are compressed and fingerprinted with `CompressedManifestStaticFilesStorage`.
- [x] **JWT Token Lifecycles**: 7-day access token and 30-day refresh token with automatic client-side rotation.
- [x] **Database SSL**: `dj-database-url` automatically enforces `sslmode=require` for secure TLS communication with PostgreSQL.
- [x] **Cross-Origin Resource Sharing (CORS)**: Restricted strictly to the Vercel production domain and local development origins.
- [x] **Zero Fake Data**: The application starts empty for fresh user accounts, computing all charts and metrics from real database records.

# 🚀 IntelliWealth - Full-Scale SaaS Application

Complete full-stack SaaS financial planning application built with React, TypeScript, Node.js, and PostgreSQL.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Features](#features)
- [API Documentation](#api-documentation)

---

## 🎯 Overview

IntelliWealth is a comprehensive financial planning platform that helps users:
- Track income and expenses with interactive sliders
- Manage assets and liabilities with visual balance sheets
- Plan financial goals on a lifetime timeline
- Calculate retirement needs and savings targets
- Sync data across devices with cloud storage

**Based on:** gamified-ui5.html - migrated to a production-ready full-stack application

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool (fast HMR)
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management (with persistence)
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **Node.js 18+** - Runtime
- **Express.js** - Web framework
- **PostgreSQL 14+** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

### DevOps
- **Git** - Version control
- **GitHub** - Repository hosting
- **Railway/Render** - Backend deployment
- **Vercel** - Frontend deployment
- **GitHub Actions** - CI/CD (future)

---

## 📁 Project Structure

```
hello-world/
├── frontend/                  # React TypeScript application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── AmountSlider.tsx
│   │   │   └── BalanceScale.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── IncomeExpenses.tsx
│   │   │   ├── BalanceSheet.tsx
│   │   │   └── Timeline.tsx
│   │   ├── services/         # API service layer
│   │   │   ├── authService.ts
│   │   │   ├── financialService.ts
│   │   │   ├── assetService.ts
│   │   │   ├── liabilityService.ts
│   │   │   └── goalService.ts
│   │   ├── stores/           # Zustand stores
│   │   │   └── authStore.ts
│   │   ├── types/            # TypeScript types
│   │   │   └── index.ts
│   │   ├── lib/              # Utilities
│   │   │   └── api.ts
│   │   ├── App.tsx           # Root component
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── .env                  # Environment variables
│
├── backend/                   # Node.js Express API
│   ├── config/
│   │   └── database.js       # PostgreSQL connection
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── financialController.js
│   │   ├── assetsController.js
│   │   ├── liabilitiesController.js
│   │   └── goalsController.js
│   ├── middleware/           # Express middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── financial.js
│   │   ├── assets.js
│   │   ├── liabilities.js
│   │   └── goals.js
│   ├── database/
│   │   └── schema.sql        # Database schema
│   ├── server.js             # Express server
│   ├── package.json
│   └── .env                  # Environment variables
│
├── gamified-ui5.html         # Original prototype
├── BACKEND_INTEGRATION_GUIDE.md
└── README_FULLSCALE_SAAS.md  # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

### 1. Clone Repository

```bash
git clone https://github.com/GitHub-code542/hello-world.git
cd hello-world
git checkout claude/add-timeline-chart-01Qk8gk3kECo1xo5XeTNZgvc
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create PostgreSQL database
createdb intelliwealth

# Run database schema
psql intelliwealth < database/schema.sql

# Configure environment
cp .env.example .env
# Edit .env and add your database credentials and JWT secrets

# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env if needed (default: http://localhost:5000/api/v1)

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Access Application

Open browser: `http://localhost:3000`

1. Click "Register" to create an account
2. Login with your credentials
3. Start planning your finances!

---

## 💻 Development

### Backend Development

```bash
cd backend

# Start with auto-reload
npm run dev

# Run without dev mode
npm start

# Test database connection
node -e "const {connectDB} = require('./config/database'); connectDB();"
```

### Frontend Development

```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Database Management

```bash
# Access PostgreSQL
psql intelliwealth

# View tables
\dt

# View users
SELECT * FROM users;

# View all data for a user
SELECT * FROM financial_data WHERE user_id = 'user-uuid';
SELECT * FROM assets WHERE user_id = 'user-uuid';
SELECT * FROM liabilities WHERE user_id = 'user-uuid';
SELECT * FROM goals WHERE user_id = 'user-uuid';
```

---

## 🌐 Deployment

### Deploy Backend (Railway.app)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `hello-world` repository
   - Set root directory to `backend`

3. **Add PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway auto-connects it

4. **Set Environment Variables**
   ```
   JWT_SECRET=<your-generated-secret>
   JWT_REFRESH_SECRET=<your-generated-refresh-secret>
   FRONTEND_URL=http://localhost:3000
   FRONTEND_PROD_URL=https://your-username.github.io
   ```

5. **Deploy**
   - Railway auto-deploys on push
   - Get API URL: Settings → Domains → Generate Domain

### Deploy Frontend (Vercel)

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import `hello-world` repository
   - Set root directory to `frontend`
   - Framework: Vite

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://your-app.up.railway.app/api/v1
   VITE_APP_NAME=IntelliWealth
   VITE_APP_VERSION=1.0.0
   ```

4. **Deploy**
   - Click "Deploy"
   - Access at: `https://your-project.vercel.app`

### Alternative: GitHub Pages (Frontend Only)

```bash
cd frontend

# Build
npm run build

# Deploy to gh-pages branch
npm install -g gh-pages
gh-pages -d dist
```

---

## ✨ Features

### 1. Authentication & Security
- ✅ User registration with email and password
- ✅ Secure login with JWT tokens
- ✅ Automatic token refresh on expiration
- ✅ Password hashing with bcrypt
- ✅ Protected routes
- ✅ CORS protection
- ✅ Rate limiting
- ⏳ Email verification (planned)
- ⏳ Password reset (planned)

### 2. Income & Expenses (Page 1)
- ✅ Interactive sliders for income categories:
  - Salary/Business Income
  - Rental Income
  - Interest Income
  - Dividend Income
  - Other Income
- ✅ Interactive sliders for expense categories:
  - Housing, Food, Transportation
  - Utilities, Insurance, Education
  - Entertainment, Healthcare, Shopping
- ✅ Real-time calculation of:
  - Total Income
  - Total Expenses
  - Net Income
  - Savings Rate
- ✅ Click-to-edit values
- ✅ Cloud sync across devices

### 3. Balance Sheet (Page 2)
- ✅ Visual balance scale showing assets vs liabilities
- ✅ Add/Edit/Delete assets:
  - Property, Stocks, Cash, etc.
  - Editable values
- ✅ Add/Edit/Delete liabilities:
  - Home Loan, Car Loan, Credit Card, etc.
  - Editable balances
- ✅ Real-time net worth calculation
- ✅ Tilt animation based on balance
- ✅ Color-coded indicators

### 4. Financial Timeline (Page 3)
- ✅ Lifetime financial goals visualization
- ✅ Add/Edit/Delete goals with:
  - Goal name
  - Target age
  - Target amount
  - Priority level
- ✅ Special retirement goal (unique, age 60 default)
- ✅ Interactive timeline chart
- ✅ Age-based planning
- ✅ Configurable:
  - Current age
  - Retirement age
  - Life expectancy

### 5. Data Management
- ✅ Auto-save to PostgreSQL cloud database
- ✅ Multi-device sync
- ✅ Data persistence
- ✅ RESTful API
- ⏳ Data export (CSV, PDF) - planned
- ⏳ Data snapshots/history - planned

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000/api/v1
Production: https://your-app.up.railway.app/api/v1
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "full_name": "John Doe" },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: Same as register
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "current_age": 30,
    "retirement_age": 60,
    "life_expectancy": 100
  }
}
```

### Financial Data Endpoints

#### Get All Financial Data
```http
GET /financial
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "category": "Salary / Business Income",
      "amount": 100000,
      "data_type": "income",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Save Financial Data (Batch)
```http
POST /financial
Authorization: Bearer {token}
Content-Type: application/json

[
  { "category": "Salary / Business Income", "amount": 100000, "data_type": "income" },
  { "category": "Housing (Rent/EMI)", "amount": 20000, "data_type": "expense" }
]

Response:
{
  "success": true,
  "message": "Financial data saved successfully",
  "data": [...]
}
```

### Assets Endpoints

#### Get All Assets
```http
GET /assets
Authorization: Bearer {token}
```

#### Create Asset
```http
POST /assets
Authorization: Bearer {token}
Content-Type: application/json

{
  "asset_name": "Apartment",
  "asset_type": "Property",
  "current_value": 5000000
}
```

#### Update Asset
```http
PUT /assets/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "current_value": 5500000
}
```

#### Delete Asset
```http
DELETE /assets/:id
Authorization: Bearer {token}
```

### Liabilities Endpoints

#### Get All Liabilities
```http
GET /liabilities
Authorization: Bearer {token}
```

#### Create Liability
```http
POST /liabilities
Authorization: Bearer {token}
Content-Type: application/json

{
  "liability_name": "Home Loan",
  "liability_type": "Mortgage",
  "current_balance": 2000000,
  "interest_rate": 8.5,
  "monthly_payment": 25000
}
```

#### Update Liability
```http
PUT /liabilities/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "current_balance": 1900000
}
```

#### Delete Liability
```http
DELETE /liabilities/:id
Authorization: Bearer {token}
```

### Goals Endpoints

#### Get All Goals
```http
GET /goals
Authorization: Bearer {token}
```

#### Create Goal
```http
POST /goals
Authorization: Bearer {token}
Content-Type: application/json

{
  "goal_name": "Buy Car",
  "target_amount": 1500000,
  "target_age": 35,
  "priority": "medium"
}
```

#### Update Goal
```http
PUT /goals/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "target_age": 36,
  "target_amount": 1600000
}
```

#### Delete Goal
```http
DELETE /goals/:id
Authorization: Bearer {token}
```

---

## 🧪 Testing

### Manual API Testing with curl

```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","full_name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Get financial data (replace TOKEN)
curl http://localhost:5000/api/v1/financial \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Browser Testing

1. Register a new account
2. Login
3. Navigate through all 3 pages:
   - Income & Expenses
   - Balance Sheet
   - Timeline
4. Add data to each section
5. Logout and login again
6. Verify data persists

---

## 🔒 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ SQL injection protection (parameterized queries)
- ✅ XSS protection (React escaping)
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Environment variable configuration
- ✅ Secure token storage (localStorage with Zustand persistence)
- ✅ Automatic token refresh on expiration

---

## 🐛 Troubleshooting

### CORS Error
```
Access to fetch at 'API_URL' from origin 'FRONTEND_URL' has been blocked by CORS
```
**Fix:** Update `FRONTEND_URL` and `FRONTEND_PROD_URL` in backend `.env`

### 401 Unauthorized
```
{ success: false, message: "Not authorized" }
```
**Fix:** Check if token is valid and not expired. Try logging in again.

### Database Connection Error
```
Error: connect ECONNREFUSED
```
**Fix:** Ensure PostgreSQL is running and `DATABASE_URL` is correct in `.env`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Fix:** Kill process on port or change `PORT` in `.env`

---

## 📈 Roadmap

### Phase 1: Core Features (✅ Complete)
- [x] React + TypeScript frontend
- [x] Node.js + Express backend
- [x] PostgreSQL database
- [x] JWT authentication
- [x] Income & Expenses tracking
- [x] Balance Sheet management
- [x] Timeline planning
- [x] Cloud data sync

### Phase 2: Enhanced Features (Next 2-4 weeks)
- [ ] Retirement calculator with projections
- [ ] Advanced financial calculations
- [ ] Data visualization charts (Recharts)
- [ ] PDF report generation
- [ ] Data export (CSV, Excel)
- [ ] Email verification
- [ ] Password reset
- [ ] Profile management

### Phase 3: SaaS Features (4-8 weeks)
- [ ] Subscription plans (Free, Pro, Premium)
- [ ] Stripe payment integration
- [ ] Admin dashboard
- [ ] User analytics
- [ ] Email notifications (SendGrid)
- [ ] Social login (Google, Facebook)
- [ ] Mobile responsive improvements

### Phase 4: Production Ready (8-12 weeks)
- [ ] Comprehensive testing (Jest, Playwright)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Documentation site
- [ ] Marketing landing page
- [ ] User onboarding flow

---

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 👤 Author

**IntelliWealth Team**
- GitHub: [@GitHub-code542](https://github.com/GitHub-code542)

---

## 🙏 Acknowledgments

- Original prototype: gamified-ui5.html
- Built with Claude Code assistance
- Inspired by modern financial planning tools

---

**Built with ❤️ for better financial planning**

Last Updated: 2024-12-06

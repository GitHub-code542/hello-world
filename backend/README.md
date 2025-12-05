# IntelliWealth Backend API

Complete backend infrastructure for the IntelliWealth financial planning application.

## 🏗️ Architecture

```
Backend Stack:
├── Node.js 18+
├── Express.js (Web framework)
├── PostgreSQL (Database)
├── JWT (Authentication)
├── bcrypt (Password hashing)
└── Railway/Render (Deployment)
```

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js           # PostgreSQL connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User management
│   ├── financialController.js
│   ├── assetsController.js
│   ├── liabilitiesController.js
│   └── goalsController.js
├── middleware/
│   ├── auth.js               # JWT verification
│   ├── errorHandler.js       # Global error handling
│   └── validate.js           # Input validation
├── models/
│   └── (Optional: ORM models)
├── routes/
│   ├── auth.js               # Auth endpoints
│   ├── users.js
│   ├── financial.js
│   ├── assets.js
│   ├── liabilities.js
│   └── goals.js
├── utils/
│   └── helpers.js
├── database/
│   └── schema.sql            # Database schema
├── .env.example              # Environment variables template
├── server.js                 # Main server file
├── package.json
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database

**Option A: Supabase (Recommended - Free)**

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Run the schema:
   - Go to SQL Editor in Supabase
   - Paste contents of `database/schema.sql`
   - Click RUN

**Option B: Local PostgreSQL**

```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start  # Ubuntu

# Create database
createdb intelliwealth

# Run schema
psql intelliwealth < database/schema.sql
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
NODE_ENV=development
PORT=5000

# Database (get from Supabase)
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Secrets (generate random strings)
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Frontend URL
FRONTEND_URL=http://localhost:8000
```

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |
| POST | `/api/v1/auth/logout` | Logout user | Yes |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/users/profile` | Get user profile | Yes |
| PUT | `/api/v1/users/profile` | Update profile | Yes |
| DELETE | `/api/v1/users/account` | Delete account | Yes |

### Financial Data

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/financial` | Get all financial data | Yes |
| POST | `/api/v1/financial` | Add financial data | Yes |
| PUT | `/api/v1/financial/:id` | Update financial data | Yes |
| DELETE | `/api/v1/financial/:id` | Delete financial data | Yes |

### Assets

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/assets` | Get all assets | Yes |
| POST | `/api/v1/assets` | Add asset | Yes |
| PUT | `/api/v1/assets/:id` | Update asset | Yes |
| DELETE | `/api/v1/assets/:id` | Delete asset | Yes |

### Liabilities

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/liabilities` | Get all liabilities | Yes |
| POST | `/api/v1/liabilities` | Add liability | Yes |
| PUT | `/api/v1/liabilities/:id` | Update liability | Yes |
| DELETE | `/api/v1/liabilities/:id` | Delete liability | Yes |

### Goals

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/goals` | Get all goals | Yes |
| POST | `/api/v1/goals` | Add goal | Yes |
| PUT | `/api/v1/goals/:id` | Update goal | Yes |
| DELETE | `/api/v1/goals/:id` | Delete goal | Yes |

## 🔐 Authentication Flow

### 1. Register

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### 3. Access Protected Routes

```bash
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🌐 Deployment

### Deploy to Railway.app (Recommended)

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd backend
   railway init
   ```

4. **Add PostgreSQL**
   ```bash
   railway add --plugin postgresql
   ```

5. **Set Environment Variables**
   ```bash
   railway variables set JWT_SECRET=your-secret
   railway variables set JWT_REFRESH_SECRET=your-refresh-secret
   railway variables set FRONTEND_URL=https://yourdomain.com
   ```

6. **Deploy**
   ```bash
   railway up
   ```

7. **Get your API URL**
   ```bash
   railway domain
   ```

### Deploy to Render.com (Alternative)

1. Go to [render.com](https://render.com)
2. Create New → Web Service
3. Connect your GitHub repository
4. Configure:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Add environment variables
5. Click "Create Web Service"

## 🧪 Testing

### Test with curl

```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "full_name": "Test User"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Get user (replace TOKEN with your JWT)
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Development

### Run Development Server
```bash
npm run dev  # With auto-reload
```

### Run Tests
```bash
npm test
```

### Check Database Connection
```bash
node -e "const {connectDB} = require('./config/database'); connectDB();"
```

## 📦 Next Steps (TODO)

1. ✅ Basic authentication working
2. ⏳ Implement remaining controllers:
   - [ ] userController.js
   - [ ] financialController.js
   - [ ] assetsController.js
   - [ ] liabilitiesController.js
   - [ ] goalsController.js
3. ⏳ Create corresponding routes
4. ⏳ Add input validation
5. ⏳ Write tests
6. ⏳ Add email verification
7. ⏳ Add password reset
8. ⏳ Deploy to production

## 🛡️ Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Refresh tokens
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ SQL injection protection (parameterized queries)
- ✅ XSS protection

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| NODE_ENV | Environment | No | development |
| PORT | Server port | No | 5000 |
| DATABASE_URL | PostgreSQL connection string | Yes | - |
| JWT_SECRET | JWT signing secret | Yes | - |
| JWT_EXPIRE | JWT expiration | No | 7d |
| JWT_REFRESH_SECRET | Refresh token secret | Yes | - |
| JWT_REFRESH_EXPIRE | Refresh token expiration | No | 30d |
| FRONTEND_URL | Frontend URL for CORS | Yes | - |
| BCRYPT_ROUNDS | Password hashing rounds | No | 10 |

## 🤝 Contributing

This is part of IntelliWealth MVP. For Phase 3, we'll add:
- Advanced financial calculations
- Email notifications
- Payment processing
- Analytics

## 📄 License

Copyright © 2024 IntelliWealth

---

**Built with ❤️ for better financial planning**

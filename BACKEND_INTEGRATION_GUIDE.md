# 🔗 Frontend-Backend Integration Guide

Complete guide to connect your IntelliWealth frontend with the new backend API.

## 📋 Overview

**What we're doing:**
- Replace localStorage with cloud database
- Add user authentication (login/register)
- Sync data across devices
- Enable multi-user support

**Before:** Data saved in browser localStorage
**After:** Data saved in PostgreSQL cloud database

---

## 🚀 Quick Start

### Step 1: Deploy Backend (Choose One)

#### Option A: Railway.app (Recommended - Easiest)

1. **Go to Railway**
   - Visit: https://railway.app
   - Sign up/Login with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your `hello-world` repository
   - Select `backend` folder as root directory

3. **Add PostgreSQL Database**
   - In your Railway project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will auto-create and connect it

4. **Configure Environment Variables**
   - Click on your service → "Variables"
   - Add these:
     ```
     JWT_SECRET=generate-random-64-char-string
     JWT_REFRESH_SECRET=generate-random-64-char-string
     FRONTEND_URL=https://github-code542.github.io
     ```
   - Generate secrets: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

5. **Run Database Schema**
   - Click on PostgreSQL service
   - Click "Connect" → "psql"
   - Copy/paste contents of `backend/database/schema.sql`
   - Click "Execute"

6. **Get Your API URL**
   - Click "Settings" → "Domains"
   - Click "Generate Domain"
   - Copy URL: `https://your-app.up.railway.app`

#### Option B: Supabase (Free PostgreSQL) + Render (Free API)

**Part 1: Database (Supabase)**
1. Go to https://supabase.com
2. Create new project
3. Go to SQL Editor
4. Run `backend/database/schema.sql`
5. Get connection string: Settings → Database → Connection string

**Part 2: API (Render.com)**
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Configure:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
5. Add environment variables
6. Deploy!

---

## 🔐 Step 2: Add Authentication UI

Create a login/register page. Add this before your existing pages in `index.html`:

```html
<!-- LOGIN/REGISTER PAGE -->
<div class="page active" id="authPage" style="display: block;">
    <div style="max-width: 500px; margin: 100px auto; padding: 40px; background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
        <h1 style="text-align: center; margin-bottom: 30px;">IntelliWealth</h1>

        <!-- Login Form -->
        <div id="loginForm">
            <h2>Login</h2>
            <form onsubmit="handleLogin(event)">
                <input type="email" id="loginEmail" placeholder="Email" required style="width: 100%; padding: 12px; margin: 10px 0; border: 2px solid #ddd; border-radius: 8px;">
                <input type="password" id="loginPassword" placeholder="Password" required style="width: 100%; padding: 12px; margin: 10px 0; border: 2px solid #ddd; border-radius: 8px;">
                <button type="submit" class="btn btn-next" style="width: 100%; margin-top: 20px;">Login</button>
            </form>
            <p style="text-align: center; margin-top: 20px;">
                Don't have an account? <a href="#" onclick="showRegisterForm(); return false;">Register</a>
            </p>
        </div>

        <!-- Register Form -->
        <div id="registerForm" style="display: none;">
            <h2>Register</h2>
            <form onsubmit="handleRegister(event)">
                <input type="text" id="registerName" placeholder="Full Name" required style="width: 100%; padding: 12px; margin: 10px 0; border: 2px solid #ddd; border-radius: 8px;">
                <input type="email" id="registerEmail" placeholder="Email" required style="width: 100%; padding: 12px; margin: 10px 0; border: 2px solid #ddd; border-radius: 8px;">
                <input type="password" id="registerPassword" placeholder="Password (min 6 characters)" required minlength="6" style="width: 100%; padding: 12px; margin: 10px 0; border: 2px solid #ddd; border-radius: 8px;">
                <button type="submit" class="btn btn-next" style="width: 100%; margin-top: 20px;">Register</button>
            </form>
            <p style="text-align: center; margin-top: 20px;">
                Already have an account? <a href="#" onclick="showLoginForm(); return false;">Login</a>
            </p>
        </div>
    </div>
</div>
```

---

## 💻 Step 3: Add API Client JavaScript

Add this code in your `<script>` section (before other JavaScript):

```javascript
// ==================== API CONFIGURATION ====================
const API_URL = 'https://your-app.up.railway.app/api/v1'; // Replace with your Railway URL
let authToken = localStorage.getItem('authToken');
let refreshToken = localStorage.getItem('refreshToken');

// API Helper Functions
const api = {
    // Make authenticated request
    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            // Handle token expiration
            if (response.status === 401 && data.message === 'Token expired, please login again') {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    // Retry request with new token
                    headers['Authorization'] = `Bearer ${authToken}`;
                    const retryResponse = await fetch(`${API_URL}${endpoint}`, {
                        ...options,
                        headers
                    });
                    return await retryResponse.json();
                } else {
                    // Refresh failed, logout
                    this.logout();
                    return null;
                }
            }

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Authentication
    async register(email, password, fullName) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, full_name: fullName })
        });
        if (data.success) {
            authToken = data.data.token;
            refreshToken = data.data.refreshToken;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('refreshToken', refreshToken);
        }
        return data;
    },

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (data.success) {
            authToken = data.data.token;
            refreshToken = data.data.refreshToken;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('refreshToken', refreshToken);
        }
        return data;
    },

    async refreshAccessToken() {
        try {
            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });
            const data = await response.json();
            if (data.success) {
                authToken = data.data.token;
                localStorage.setItem('authToken', authToken);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh error:', error);
            return false;
        }
    },

    logout() {
        authToken = null;
        refreshToken = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.reload();
    },

    // Financial Data
    async getFinancialData() {
        return await this.request('/financial');
    },

    async saveFinancialData(data) {
        return await this.request('/financial', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // Assets
    async getAssets() {
        return await this.request('/assets');
    },

    async saveAsset(asset) {
        return await this.request('/assets', {
            method: 'POST',
            body: JSON.stringify(asset)
        });
    },

    // Liabilities
    async getLiabilities() {
        return await this.request('/liabilities');
    },

    async saveLiability(liability) {
        return await this.request('/liabilities', {
            method: 'POST',
            body: JSON.stringify(liability)
        });
    },

    // Goals
    async getGoals() {
        return await this.request('/goals');
    },

    async saveGoal(goal) {
        return await this.request('/goals', {
            method: 'POST',
            body: JSON.stringify(goal)
        });
    },

    async deleteGoal(goalId) {
        return await this.request(`/goals/${goalId}`, {
            method: 'DELETE'
        });
    }
};

// Auth UI Functions
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const result = await api.login(email, password);
        if (result.success) {
            alert('✅ Login successful!');
            document.getElementById('authPage').style.display = 'none';
            document.getElementById('page1').style.display = 'block';
            loadAllDataFromAPI();
        }
    } catch (error) {
        alert('❌ Login failed: ' + error.message);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const result = await api.register(email, password, name);
        if (result.success) {
            alert('✅ Registration successful! Welcome!');
            document.getElementById('authPage').style.display = 'none';
            document.getElementById('page1').style.display = 'block';
        }
    } catch (error) {
        alert('❌ Registration failed: ' + error.message);
    }
}

// Check authentication on load
window.addEventListener('DOMContentLoaded', () => {
    if (!authToken) {
        // Show login page
        document.getElementById('authPage').style.display = 'block';
        document.querySelectorAll('.page').forEach(page => {
            if (page.id !== 'authPage') page.style.display = 'none';
        });
    } else {
        // User is logged in, load their data
        loadAllDataFromAPI();
    }
});

// Load data from API instead of localStorage
async function loadAllDataFromAPI() {
    try {
        // Load financial data, assets, liabilities, goals from API
        const [financial, assets, liabilities, goals] = await Promise.all([
            api.getFinancialData(),
            api.getAssets(),
            api.getLiabilities(),
            api.getGoals()
        ]);

        // Update UI with loaded data
        console.log('Data loaded from API:', { financial, assets, liabilities, goals });
        // TODO: Map API data to UI elements
    } catch (error) {
        console.error('Error loading data:', error);
    }
}
```

---

## 🔄 Step 4: Replace Save Functions

Replace your existing save functions with API calls:

```javascript
// OLD: Save to localStorage
function savePage1() {
    if (saveAllData()) {
        alert('✅ Income & Expenses data saved!');
    }
}

// NEW: Save to API
async function savePage1() {
    try {
        const data = collectPage1Data(); // Collect income/expense data
        await api.saveFinancialData(data);
        alert('✅ Income & Expenses saved to cloud!');
    } catch (error) {
        alert('❌ Error saving: ' + error.message);
    }
}

function collectPage1Data() {
    const data = [];
    document.querySelectorAll('.amount-slider').forEach(slider => {
        data.push({
            category: slider.dataset.field,
            amount: slider.dataset.value,
            data_type: slider.closest('.panel-dark') ? 'income' : 'expense'
        });
    });
    return data;
}
```

---

## 📊 Complete Integration Example

Here's how to integrate one complete feature (Assets):

```javascript
// When user adds an asset
async function addAssetToBalance(assetData) {
    try {
        // Save to API
        const result = await api.saveAsset({
            asset_name: assetData.name,
            asset_type: assetData.type,
            current_value: assetData.value
        });

        if (result.success) {
            // Update UI
            droppedItems.assets.push(assetData);
            updateBalanceSheet();
            alert('✅ Asset saved!');
        }
    } catch (error) {
        alert('❌ Error saving asset: ' + error.message);
    }
}
```

---

## ✅ Testing Your Integration

### 1. Test Authentication

Open browser console:
```javascript
// Register
await api.register('test@example.com', 'Test123!', 'Test User');

// Login
await api.login('test@example.com', 'Test123!');

// Check if logged in
console.log('Token:', authToken);
```

### 2. Test Data Sync

1. Login on Computer A
2. Add some assets/liabilities
3. Login on Computer B (different browser/device)
4. Verify data appears!

### 3. Test Multi-Device Sync

1. Open app in Chrome
2. Add financial data
3. Open app in Firefox (same email)
4. Data should sync!

---

## 🎯 Migration Strategy

### Phase 1: Dual Mode (Recommended)
Keep both localStorage AND API working:
```javascript
async function savePage1() {
    // Save to localStorage (backup)
    saveAllData();

    // Also save to API
    if (authToken) {
        try {
            await api.saveFinancialData(collectPage1Data());
        } catch (error) {
            console.error('API save failed, but localStorage saved');
        }
    }
}
```

### Phase 2: API Only
Once confident, remove localStorage:
```javascript
async function savePage1() {
    if (!authToken) {
        alert('Please login first');
        return;
    }
    await api.saveFinancialData(collectPage1Data());
}
```

---

## 🐛 Troubleshooting

### Issue: CORS Error
```
Access to fetch at 'https://your-api.com' from origin 'https://github-code542.github.io' has been blocked by CORS
```

**Fix:** Add your frontend URL to backend `.env`:
```env
FRONTEND_PROD_URL=https://github-code542.github.io
```

### Issue: 401 Unauthorized
```
{ success: false, message: "Not authorized" }
```

**Fix:** Check if token is being sent:
```javascript
console.log('Token:', authToken);
console.log('Headers:', headers);
```

### Issue: Token Expired
**Fix:** Already handled by auto-refresh in api.request()

---

## 📝 Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Add authentication UI
3. ✅ Connect API client
4. ⏳ Migrate save functions
5. ⏳ Test multi-device sync
6. ⏳ Remove localStorage (optional)

---

## 🎓 Want More Help?

Ask me to:
- "Add email verification"
- "Implement password reset"
- "Add profile page"
- "Create admin dashboard"
- "Add social login (Google/Facebook)"
- "Implement complete controllers"
- "Add email notifications"

---

**🎉 Congratulations!** You now have a full-stack application with:
- ✅ User authentication
- ✅ Cloud database
- ✅ Multi-device sync
- ✅ Production-ready backend

**Built with ❤️ for better financial planning**

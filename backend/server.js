const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const financialRoutes = require('./routes/financial');
const assetsRoutes = require('./routes/assets');
const liabilitiesRoutes = require('./routes/liabilities');
const goalsRoutes = require('./routes/goals');

// Initialize app
const app = express();

// Connect to database
connectDB();

// Trust proxy (for Railway, Render, Heroku)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        process.env.FRONTEND_PROD_URL,
        'http://localhost:3000',
        'http://localhost:8000',
        'https://github-code542.github.io'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again later.',
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';

app.use(`/api/${API_VERSION}/auth`, authLimiter, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/financial`, financialRoutes);
app.use(`/api/${API_VERSION}/assets`, assetsRoutes);
app.use(`/api/${API_VERSION}/liabilities`, liabilitiesRoutes);
app.use(`/api/${API_VERSION}/goals`, goalsRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'IntelliWealth API',
        version: API_VERSION,
        status: 'running',
        endpoints: {
            health: '/health',
            auth: `/api/${API_VERSION}/auth`,
            users: `/api/${API_VERSION}/users`,
            financial: `/api/${API_VERSION}/financial`,
            assets: `/api/${API_VERSION}/assets`,
            liabilities: `/api/${API_VERSION}/liabilities`,
            goals: `/api/${API_VERSION}/goals`
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║   IntelliWealth API Server Started   ║
╠═══════════════════════════════════════╣
║ Environment: ${process.env.NODE_ENV?.padEnd(24)} ║
║ Port: ${PORT.toString().padEnd(32)} ║
║ API Version: ${API_VERSION.padEnd(26)} ║
╚═══════════════════════════════════════╝
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

module.exports = app;

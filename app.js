const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();

const app = express();

// Connect to MongoDB
(async () => {
    try {
        await connectDB();
        console.log("✅ Database connected successfully");
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
})();

// Security Middleware
app.use(helmet());

// Improved CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_PROD_URL
        : process.env.FRONTEND_DEV_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
});
app.use(apiLimiter);

// Handle Preflight Requests
app.options('*', cors(corsOptions));

// Middleware for parsing JSON requests
app.use(express.json({ limit: '1mb' }));

// Define API routes
app.use('/api/auth/user', userRoutes);
app.use('/api/auth/admin', adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    process.exit(1);
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

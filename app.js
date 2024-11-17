const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Updated CORS Configuration
app.use(cors({
    origin: process.env.FRONTEND_URL.replace(/\/$/, ''),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Middleware for parsing JSON requests
app.use(express.json());

// Define API routes
app.use('/api/auth/user', userRoutes);
app.use('/api/auth/admin', adminRoutes);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

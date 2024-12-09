const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const corsMiddleware = require('./utils/corsConfig'); // Your CORS configuration
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { setIo } = require('./socket');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
setIo(io);

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

// Middleware setup
app.use(corsMiddleware); // Enable CORS
app.use(bodyParser.json()); // Parse JSON body
app.use(helmet()); // Secure headers

// Rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(apiLimiter); // Apply rate limiter

// Logging incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});

// Routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const torrentRoutes = require('./routes/torrentRoutes');

app.use('/auth/user', userRoutes);
app.use('/auth/admin', adminRoutes);
app.use('/api/torrents', torrentRoutes);

// Handle OPTIONS requests for preflight checks
app.options('*', corsMiddleware);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    process.exit(1);
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// app.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const corsMiddleware = require('./utils/corsConfig');

// Routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const torrentRoutes = require('./routes/torrentRoutes');


require('dotenv').config();


const app = express();
app.use(bodyParser.json());

(async () => {
    try {
        await connectDB();
        console.log("✅ Database connected successfully");
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
})();

app.use(helmet());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
});
app.use(apiLimiter);

app.use(corsMiddleware);


app.use(express.json({ limit: '1mb' }));

app.use('/api/auth/user', userRoutes);
app.use('/api/auth/admin', adminRoutes);
app.use('/api/torrents', torrentRoutes);


app.options('*', corsMiddleware);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    process.exit(1);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
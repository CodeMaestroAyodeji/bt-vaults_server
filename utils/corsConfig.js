const cors = require('cors');

// List the allowed origins
const allowedOrigins = [
  'https://bt-vaults-client.vercel.app', // Production Frontend URL
  'http://localhost:3000', // Local Development URL
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS not allowed for this origin: ${origin}`); // Log the disallowed origin
      callback(new Error('CORS not allowed for this origin.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // If you're using cookies or sessions
};

module.exports = cors(corsOptions);

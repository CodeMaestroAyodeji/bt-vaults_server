// config/db.js

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI || "your_default_mongo_uri";

    let retries = 5;
    while (retries) {
        try {
            await mongoose.connect(mongoURI);
            console.log("✅ Connected to MongoDB successfully");
            break;
        } catch (error) {
            console.error("❌ MongoDB connection error:", error.message);
            retries -= 1;
            console.log(`Retrying... (${5 - retries}/5)`);
            await new Promise(res => setTimeout(res, 5000));
        }
    }

    if (!retries) {
        console.error("❌ Could not connect to MongoDB. Exiting...");
        process.exit(1); 
    }
};

mongoose.set('strictQuery', true);

module.exports = connectDB;


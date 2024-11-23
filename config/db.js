// config/db.js

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI || "mongodb+srv://ajuwon2013:RTyyDPU99z1wER6s@cluster0.oqrg4.mongodb.net/bt_vaults_db?retryWrites=true&w=majority";

    if (!mongoURI) {
        console.error("❌ MongoDB URI is missing. Please check the .env file.");
        process.exit(1);
    }

    let retries = 5;
    while (retries) {
        try {
            await mongoose.connect(mongoURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 20000, 
            });
            console.log("✅ Connected to MongoDB successfully");
            break;
        } catch (error) {
            console.error("❌ MongoDB connection error:", error.message);
            console.error(error.stack); 
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

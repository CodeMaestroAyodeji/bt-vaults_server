const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    let retries = 5;
    while (retries) {
        try {
            await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 20000,
            });
            console.log("✅ Connected to MongoDB successfully");
            break;
        } catch (error) {
            console.error("❌ Error connecting to MongoDB:", error.message);
            retries -= 1;
            console.log(`Retrying... (${5 - retries}/5)`);
            await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds before retrying
        }
    }

    if (!retries) {
        console.error("❌ Could not connect to MongoDB. Exiting...");
        process.exit(1);
    }
};

mongoose.connection.on('error', (err) => {
    console.error("MongoDB connection error:", err.message);
});

mongoose.set('strictQuery', true);

module.exports = connectDB;

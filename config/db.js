// const mongoose = require('mongoose');
// require('dotenv').config();

// const connectDB = async () => {
//     let retries = 5;
//     while (retries) {
//         try {
//             await mongoose.connect(process.env.MONGO_URI, {
//                 useNewUrlParser: true,
//                 useUnifiedTopology: true,
//                 serverSelectionTimeoutMS: 20000,
//             });
//             console.log("✅ Connected to MongoDB successfully");
//             break;
//         } catch (error) {
//             console.error("❌ Error connecting to MongoDB:", error.message);
//             retries -= 1;
//             console.log(`Retrying... (${5 - retries}/5)`);
//             await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds before retrying
//         }
//     }

//     if (!retries) {
//         console.error("❌ Could not connect to MongoDB. Exiting...");
//         process.exit(1);
//     }
// };

// mongoose.connection.on('error', (err) => {
//     console.error("MongoDB connection error:", err.message);
// });

// mongoose.set('strictQuery', true);

// module.exports = connectDB;

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
        console.error("❌ MongoDB URI is missing. Please check the .env file.");
        process.exit(1); // Exit if no URI is provided
    }

    let retries = 5; // Retry connection up to 5 times
    while (retries) {
        try {
            await mongoose.connect(mongoURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 20000, // Timeout for server selection
            });
            console.log("✅ Connected to MongoDB successfully");
            break;
        } catch (error) {
            console.error("❌ MongoDB connection error:", error.message);
            console.error(error.stack); // Log full stack trace for debugging
            retries -= 1;
            console.log(`Retrying... (${5 - retries}/5)`);
            await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds before retrying
        }
    }

    if (!retries) {
        console.error("❌ Could not connect to MongoDB. Exiting...");
        process.exit(1); // Exit if all retries fail
    }
};

// Enable strict query mode to prevent query injection
mongoose.set('strictQuery', true);

module.exports = connectDB;

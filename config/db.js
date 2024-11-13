const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection and log a message
(async () => {
  try {
    // Attempt to get a connection from the pool
    const connection = await pool.getConnection();
    console.log("Connected to the bt-vault Database");
    
    // Release the connection back to the pool
    connection.release();
  } catch (error) {
    console.error("Error connecting to the bt-vault Database:", error);
  }
})();

module.exports = pool;
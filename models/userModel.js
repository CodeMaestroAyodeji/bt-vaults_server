// models/userModels.js

const db = require('../config/db');

const createUser = async (userData) => {
  const { name, email, password, verificationCode, isAdmin } = userData;
  const query = `
    INSERT INTO users (name, email, password, is_verified, is_admin, verification_code, created_at, updated_at)
    VALUES (?, ?, ?, false, ?, ?, NOW(), NOW())
  `;
  try {
    await db.execute(query, [name, email, password, isAdmin, verificationCode]);
  } catch (error) {
    console.error('Database error:', error.message);
    throw new Error('Database query failed.');
  }
};


const findUserByEmail = async (email) => {
  const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [email]);
  if (rows.length === 0) throw new Error('User not found.');
  
  console.log("User data fetched:", rows[0]); // Log user data to verify reset_token and reset_token_expiry
  return rows[0];
};



const verifyUser = async (email) => {
  await db.execute(`UPDATE users SET is_verified = true WHERE email = ?`, [email]);
};

const updateResetToken = async (email, resetToken, resetTokenExpiry) => {
  const query = `UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?`;
  const [result] = await db.execute(query, [resetToken, resetTokenExpiry, email]);
  console.log("Reset token update result:", result);
  return result;
};


const updatePassword = async (email, hashedPassword) => {
  const query = `
     UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?
  `;
  await db.execute(query, [hashedPassword, email]);
};



module.exports = {
  createUser,
  findUserByEmail,
  verifyUser,
  updateResetToken,
  updatePassword,
};

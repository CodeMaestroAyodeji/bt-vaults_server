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
    throw new Error('Failed to create user.');
  }
};


const findUserByEmail = async (email) => {
  const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [email]);  
  console.log("User data fetched:", rows[0]);
  return rows.length === 0 ? null : rows[0];
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


const findUserByToken = async (token) => {
  const [rows] = await db.query('SELECT * FROM users WHERE reset_token = ?', [token]);
  return rows.length > 0 ? rows[0] : null;
};

const findAdminByToken = async (token) => {
  const [rows] = await db.query('SELECT * FROM users WHERE reset_token = ? AND is_admin = 1', [token]);
  return rows.length > 0 ? rows[0] : null;
};

const updatePassword = async (email, hashedPassword) => {
  await db.query(
    'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?',
    [hashedPassword, email]
  );
};

const clearResetToken = async (email) => {
  await db.query('UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE email = ?', [email]);
};



module.exports = {
  createUser,
  findUserByEmail,
  verifyUser,
  updateResetToken,
  findUserByToken, 
  findAdminByToken, 
  updatePassword, 
  clearResetToken,
};

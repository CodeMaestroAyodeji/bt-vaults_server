const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  is_verified: { type: Boolean, default: false },
  is_admin: { type: Boolean, default: false },
  verification_code: { type: String },
  reset_token: { type: String },
  reset_token_expiry: { type: Date },
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Define reusable data operations
const createUser = async (userData) => {
  try {
    return await User.create(userData);
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
};

const findUserByEmail = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (error) {
    console.error('Error finding user by email:', error.message);
    throw error;
  }
};

const findUserByToken = async (token) => {
  try {
    return await User.findOne({ reset_token: token });
  } catch (error) {
    console.error('Error finding user by token:', error.message);
    throw error;
  }
};

const updateResetToken = async (email, token, expiry) => {
  try {
    return await User.findOneAndUpdate(
      { email },
      { reset_token: token, reset_token_expiry: expiry },
      { new: true }
    );
  } catch (error) {
    console.error('Error updating reset token:', error.message);
    throw error;
  }
};

const updatePassword = async (email, hashedPassword) => {
  try {
    return await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );
  } catch (error) {
    console.error('Error updating password:', error.message);
    throw error;
  }
};

const clearResetToken = async (email) => {
  try {
    return await User.findOneAndUpdate(
      { email },
      { reset_token: null, reset_token_expiry: null },
      { new: true }
    );
  } catch (error) {
    console.error('Error clearing reset token:', error.message);
    throw error;
  }
};

const verifyUser = async (email) => {
  try {
    return await User.findOneAndUpdate(
      { email },
      { is_verified: true, verification_code: null },
      { new: true }
    );
  } catch (error) {
    console.error('Error verifying user:', error.message);
    throw error;
  }
};

// Export all the functions
module.exports = {
  User, 
  createUser,
  findUserByEmail,
  findUserByToken,
  updateResetToken,
  updatePassword,
  clearResetToken,
  verifyUser,
};

// controllers/userController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const emailService = require('../utils/emailService');


const userSignup = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await userModel.createUser({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      isAdmin: false,
    });
    await emailService.sendVerificationEmail(email, verificationCode);
    res.status(201).json({ message: 'Signup successful. Please verify your email.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'User signup failed.', error: error.message });
  }
};


const userLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findUserByEmail(email);

  if (!user || user.is_admin) return res.status(403).json({ message: 'Invalid credentials.' });
  if (!user.is_verified) return res.status(400).json({ message: 'Email is not verified.' });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(401).json({ message: 'Invalid password.' });

  const token = jwt.sign({ userId: user.id, isAdmin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login successful.', token });
};

const verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await userModel.findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.is_verified) return res.status(400).json({ message: 'Email already verified.' });

    if (user.verification_code !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    await userModel.verifyUser(email);
    res.json({ message: 'Email verification successful.' });
  } catch (error) {
    console.error('Verification error:', error.message);
    res.status(500).json({ message: 'Email verification failed.' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const resetToken = Math.random().toString(36).substr(2);
    const resetTokenExpiry = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();  // Set expiry to 6 hours

    // Update reset token and expiry in the database
    await userModel.updateResetToken(email, resetToken, resetTokenExpiry);
    await emailService.sendResetPasswordEmail(email, resetToken);

    res.json({ message: 'Password reset email sent.' });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Password reset request failed.' });
  }
};


const resetPassword = async (req, res) => {
  console.log("Request body:", req.body); // Logs incoming request data
  const { email, token, newPassword } = req.body;

  // Check if all parameters are present
  if (!email || !token || !newPassword) {
    console.error("Missing parameters:", { email, token, newPassword });
    return res.status(400).json({ message: 'Missing required parameters.' });
  }

  try {
    const user = await userModel.findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Convert the reset token expiry to a Date object and check if it's expired
    const resetTokenExpiry = new Date(user.reset_token_expiry).getTime();
    const currentTime = Date.now();

    // If the reset token does not match or is expired, return error
    if (user.reset_token !== token || currentTime > resetTokenExpiry) {
      console.error('Invalid or expired reset token.');
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await userModel.updatePassword(email, hashedPassword);
    await userModel.updatePassword(email, hashedPassword);
    await emailService.sendPasswordResetSuccessEmail(email);  // Optional: Send admin-specific reset success email

    res.json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Password reset failed.' });
  }
};

module.exports = {
  userSignup,
  userLogin,
  verifyEmail,
  forgotPassword,
  resetPassword,
};

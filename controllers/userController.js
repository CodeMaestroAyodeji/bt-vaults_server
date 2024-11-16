// controllers/userController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const emailService = require('../utils/emailService');


const userSignup = async (req, res) => {
  const { name, email, password, isAdmin } = req.body;

   // Check if user already exists
   const existingUser = await userModel.findUserByEmail(email);
   if (existingUser) {
     return res.status(400).json({ message: 'Email already registered. Please log in.' });
   }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await userModel.createUser({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      isAdmin,
    });

    await emailService.sendVerificationEmail(email, verificationCode);
    res.status(201).json({ message: 'Signup successful. Please verify your email.' });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'User signup failed.', error: error.message });
  }
};


const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findUserByEmail(email);

    if (!user) return res.status(403).json({ message: 'User not found.' });
    if (!user.is_verified) return res.status(400).json({ message: 'Please verify your email before logging in.' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid password.' });

    const token = jwt.sign({ userId: user.id, isAdmin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
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
  const { token, newPassword } = req.body;

  try {
    // Find user by token
    const user = await userModel.findUserByToken(token);
    if (!user) {
      return res.status(404).json({ message: 'Invalid or expired token.' });
    }

    // Check if the token has expired
    const resetTokenExpiry = new Date(user.reset_token_expiry).getTime();
    if (Date.now() > resetTokenExpiry) {
      return res.status(400).json({ message: 'Token has expired.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await userModel.updatePassword(user.email, hashedPassword);
    await userModel.clearResetToken(user.email);

    // Notify the user
    await emailService.sendPasswordResetSuccessEmail(user.email);

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

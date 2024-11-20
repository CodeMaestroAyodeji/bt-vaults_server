const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  createUser,
  findUserByEmail,
  findUserByToken,
  clearResetToken,
  updatePassword,
  updateResetToken,
  verifyUser,
} = require('../models/userModel');
const {
  sendVerificationEmail,
  sendVerificationSuccessEmail,
  sendResetPasswordEmail,
  sendPasswordResetSuccessEmail,
  sendSignupConfirmationEmail,
} = require('../utils/adminEmailService');

// Admin Signup
const adminSignup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if admin account already exists
    const existingAdmin = await findUserByEmail(email);
    if (existingAdmin && existingAdmin.is_admin) {
      return res.status(409).json({ message: 'Admin account already exists with this email.' });
    }

    // Hash the password and generate a verification code
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create the admin user
    await createUser({
      name,
      email,
      password: hashedPassword,
      is_admin: true,
      verification_code: verificationCode,
    });

    // Send verification email
    await sendVerificationEmail(email);
    await sendVerificationEmail(email, verificationCode);
    res.status(201).json({ message: 'Admin registered successfully. Please check your email for verification.' });
  } catch (error) {
    res.status(500).json({ message: 'Admin signup failed', error: error.message });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user || !user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin account required.' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Include is_verified in the token payload
    const token = jwt.sign(
      { 
        userId: user._id, 
        isAdmin: true, 
        is_verified: user.is_verified 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // const token = jwt.sign({ userId: user._id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ message: 'Admin login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Verify Admin Email
const adminVerifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user || !user.is_admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: 'Email already verified.' });
    }

    if (user.verification_code !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    await verifyUser(email);
    await sendVerificationSuccessEmail(email);
    
    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Email verification failed', error: error.message });
  }
};

// Forgot Password
const adminForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user || !user.is_admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await updateResetToken(email, resetToken, expiry);
    await sendResetPasswordEmail(email, resetToken);
    res.json({ message: 'Password reset email sent. Please check your inbox.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to initiate password reset', error: error.message });
  }
};

// Admin Reset Password
const adminResetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserByToken(token);

    if (!user || user.reset_token !== token || user.reset_token_expiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updatePassword(user.email, hashedPassword);
    await clearResetToken(user.email);

    await sendPasswordResetSuccessEmail(user.email);
    res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

// Admin Logout
const adminLogout = (req, res) => {
  res.status(200).json({ message: 'Admin logout successful. Token is now invalidated on the client side.' });
};


module.exports = { 
  adminSignup, 
  adminLogin, 
  adminVerifyEmail, 
  adminForgotPassword, 
  adminResetPassword, 
  adminLogout, 
};

// controllers/adminController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const emailService = require('../utils/emailService');

const adminSignup = async (req, res) => {
  const { name, email, password, masterKey } = req.body;

  if (masterKey !== process.env.MASTER_KEY) {
    return res.status(403).json({ message: 'Unauthorized access.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await userModel.createUser({ name, email, password: hashedPassword, verificationCode, isAdmin: true });
    await emailService.sendVerificationEmail(email, verificationCode);
    res.status(201).json({ message: 'Admin signup successful. Verification email sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Admin signup failed.' });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findUserByEmail(email);

    if (!user || !user.is_admin) return res.status(403).json({ message: 'Access denied. Only admins can login here.' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign({ userId: user.id, isAdmin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      message: 'Admin login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


const adminVerifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;
  try {
     const user = await userModel.findUserByEmail(email);
     if (!user || !user.is_admin) return res.status(404).json({ message: 'Admin not found.' });
     if (user.is_verified) return res.status(400).json({ message: 'Email already verified for admin.' });

     if (user.verification_code !== verificationCode) {
        return res.status(400).json({ message: 'Invalid verification code for admin.' });
     }

     await userModel.verifyUser(email);
     await emailService.sendVerificationSuccessEmail(email); 
     res.json({ message: 'Admin email verification successful.' });
  } catch (error) {
     console.error('Admin verification error:', error.message);
     res.status(500).json({ message: 'Admin email verification failed.' });
  }
};

const adminForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
     const user = await userModel.findUserByEmail(email);
     if (!user || !user.is_admin) return res.status(404).json({ message: 'Admin not found.' });

     const resetToken = Math.random().toString(36).substr(2);
     const resetTokenExpiry = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();  // Set expiry to 6 hours

     await userModel.updateResetToken(email, resetToken, resetTokenExpiry);
     await emailService.sendResetPasswordEmail(email, resetToken);  // You could also create a custom admin email

     res.json({ message: 'Password reset email sent to admin.' });
  } catch (error) {
     console.error('Admin forgot password error:', error.message);
     res.status(500).json({ message: 'Admin password reset request failed.' });
  }
};

const adminResetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find admin using the token
    const admin = await userModel.findAdminByToken(token);
    if (!admin) {
      return res.status(404).json({ message: 'Invalid or expired token.' });
    }

    // Check if the token has expired
    const resetTokenExpiry = new Date(admin.reset_token_expiry).getTime();
    if (Date.now() > resetTokenExpiry) {
      return res.status(400).json({ message: 'Token has expired.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await userModel.updatePassword(admin.email, hashedPassword);
    await userModel.clearResetToken(admin.email);

    // Notify the admin
    await emailService.sendPasswordResetSuccessEmail(admin.email);

    res.json({ message: 'Admin password reset successful.' });
  } catch (error) {
    console.error('Admin reset password error:', error.message);
    res.status(500).json({ message: 'Admin password reset failed.' });
  }
};


module.exports = {
  adminSignup,
  adminLogin,
  adminVerifyEmail,
  adminForgotPassword,
  adminResetPassword,
};

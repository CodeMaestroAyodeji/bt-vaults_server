// utils/emailService.js

const nodemailer = require('nodemailer');
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function for sending emails
const sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: `"Bt-Vaults" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

// Email Templates

// Verification Email
const sendVerificationEmail = async (email, verificationCode) => {
  const htmlContent = `
    <h1>Welcome to Bt-Vaults</h1>
    <p>Thank you for signing up! Please use the code below to verify your email:</p>
    <h2>${verificationCode}</h2>
    <p>If you did not request this, please ignore this email.</p>
  `;
  await sendEmail(email, 'Email Verification - Bt-Vaults', htmlContent);
};

// Email Verified Success
const sendVerificationSuccessEmail = async (email) => {
  const htmlContent = `
    <h1>Email Verified Successfully</h1>
    <p>Your email has been verified. You can now log in to your account.</p>
    <a href="${FRONTEND_URL}/bt-vaults/login">Login Here</a>
  `;
  await sendEmail(email, 'Email Verified - Bt-Vaults', htmlContent);
};

// Password Reset Email
const sendResetPasswordEmail = async (email, resetToken) => {
  const resetUrl = `${FRONTEND_URL}/bt-vaults/reset-password?token=${resetToken}`;
  const htmlContent = `
    <h1>Password Reset Request</h1>
    <p>You requested to reset your password. Click the link below to proceed:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  await sendEmail(email, 'Password Reset - Bt-Vaults', htmlContent);
};

// const sendResetPasswordEmail = async (email, resetToken) => {
//   const subject = 'Password Reset Request';
//   const text = `To reset your password, use the following token: ${resetToken}`;
  // Add your email sending logic here
// };

// Password Reset Success Email
const sendPasswordResetSuccessEmail = async (email) => {
  const htmlContent = `
    <h1>Password Reset Successful</h1>
    <p>Your password has been successfully reset. You can now log in using your new password.</p>
    <a href="${FRONTEND_URL}/bt-vaults/login">Login Here</a>
  `;
  await sendEmail(email, 'Password Reset Successful - Bt-Vaults', htmlContent);
};



// Export the functions
module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendVerificationSuccessEmail,
  sendResetPasswordEmail,
  sendPasswordResetSuccessEmail,
};

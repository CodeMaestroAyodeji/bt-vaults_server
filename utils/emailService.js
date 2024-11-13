const nodemailer = require('nodemailer');
require('dotenv').config();

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
const sendVerificationEmail = async (email, verificationCode) => {
  const htmlContent = `
    <h1>Welcome to Bt-Vaults</h1>
    <p>Thank you for signing up! Please use the code below to verify your email:</p>
    <h2>${verificationCode}</h2>
    <p>If you did not request this, please ignore this email.</p>
  `;
  await sendEmail(email, 'Email Verification - Bt-Vaults', htmlContent);
};

const sendVerificationSuccessEmail = async (email) => {
  const htmlContent = `
    <h1>Email Verified Successfully</h1>
    <p>Your email has been verified. You can now log in to your account.</p>
    <a href="http://localhost:5000/login">Login Here</a>
  `;
  await sendEmail(email, 'Email Verified - Bt-Vaults', htmlContent);
};

const sendResetPasswordEmail = async (email, resetUrl) => {
  const htmlContent = `
    <h1>Password Reset Request</h1>
    <p>You requested to reset your password. Click the link below to proceed:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  await sendEmail(email, 'Password Reset - Bt-Vaults', htmlContent);
};

const sendPasswordResetSuccessEmail = async (email) => {
  const htmlContent = `
    <h1>Password Reset Successful</h1>
    <p>Your password has been successfully reset. You can now log in using your new password.</p>
    <a href="http://localhost:5000/login">Login Here</a>
  `;
  await sendEmail(email, 'Password Reset Successful - Bt-Vaults', htmlContent);
};

module.exports = {
    sendEmail,
  sendVerificationEmail,
  sendVerificationSuccessEmail,
  sendResetPasswordEmail,
  sendPasswordResetSuccessEmail,
};

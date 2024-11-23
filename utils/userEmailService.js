// utils/userEmailService.js

const nodemailer = require('nodemailer');
require('dotenv').config();

// Get the correct frontend URL based on the environment
const FRONTEND_URL = "https://bt-vaults-client.vercel.app/";
  // process.env.NODE_ENV === 'production'
  //   ? process.env.FRONTEND_PROD_URL
  //   : process.env.FRONTEND_DEV_URL;

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
    from: `"Bt-Vaults Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

// Email Templates

// Welcome Email
const sendWelcomeEmail = async (email) => {
  const htmlContent = `
    <h1>Welcome to Bt-Vaults!</h1>
    <p>We are excited to have you on board. Explore our platform and get started.</p>
    <a href="${FRONTEND_URL}/bt-vaults/user/login">Login to Your Account</a>
    <p>Need help? Contact our support team anytime.</p>
  `;
  await sendEmail(email, 'Welcome to Bt-Vaults', htmlContent);
};

// Email Verification
const sendVerificationEmail = async (email, verificationCode) => {
  const htmlContent = `
    <h1>Verify Your Email Address</h1>
    <p>Thank you for signing up! Please verify your email using the code below:</p>
    <h2 style="color: #FFC107;">${verificationCode}</h2>
    <p>You can also copy the above code and follow the below to activate your account:
    <a href="${FRONTEND_URL}/bt-vaults/user/verify-email">Verify Account</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  await sendEmail(email, 'Email Verification - Bt-Vaults', htmlContent);
};

// Email Verified Success
const sendVerificationSuccessEmail = async (email) => {
  const htmlContent = `
    <h1>Congratulations!</h1>
    <p>Your email has been successfully verified. You can now log in to your account:</p>
    <a href="${FRONTEND_URL}/bt-vaults/user/login">Login Here</a>
    <p>Thank you for verifying your email. Enjoy our services!</p>
  `;
  await sendEmail(email, 'Email Verified - Bt-Vaults', htmlContent);
};

// Password Reset Request
const sendResetPasswordEmail = async (email, resetToken) => {
  const resetUrl = `${FRONTEND_URL}/bt-vaults/user/reset-password?token=${resetToken}`;
  const htmlContent = `
    <h1>Password Reset Request</h1>
    <p>We received a request to reset your password. Click the link below to proceed:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you did not request a password reset, please ignore this email or contact support.</p>
  `;
  await sendEmail(email, 'Password Reset - Bt-Vaults', htmlContent);
};

// Password Reset Success
const sendPasswordResetSuccessEmail = async (email) => {
  const htmlContent = `
    <h1>Password Reset Successful</h1>
    <p>Your password has been successfully reset. You can now log in using your new password:</p>
    <a href="${FRONTEND_URL}/bt-vaults/user/login">Login Here</a>
    <p>If you did not reset your password, please contact our support immediately.</p>
  `;
  await sendEmail(email, 'Password Reset Successful - Bt-Vaults', htmlContent);
};

// Account Suspension Warning
const sendAccountSuspensionWarning = async (email) => {
  const htmlContent = `
    <h1>Account Suspension Notice</h1>
    <p>We have noticed unusual activity on your account. As a precaution, your account may be suspended temporarily.</p>
    <p>If you believe this is an error, please contact our support team.</p>
  `;
  await sendEmail(email, 'Account Suspension Warning - Bt-Vaults', htmlContent);
};

// Signup Confirmation Email
const sendSignupConfirmationEmail = async (email) => {
  const htmlContent = `
    <h1>Signup Successful</h1>
    <p>Your account has been created successfully. Please verify your email to activate your account.</p>
    <a href="${FRONTEND_URL}/bt-vaults/user/email-verification">Verify Email</a>
    <p>We are glad to have you with us!</p>
  `;
  await sendEmail(email, 'Signup Confirmation - Bt-Vaults', htmlContent);
};

// Export the functions
module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendVerificationSuccessEmail,
  sendResetPasswordEmail,
  sendPasswordResetSuccessEmail,
  sendAccountSuspensionWarning,
  sendSignupConfirmationEmail,
};

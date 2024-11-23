const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  createUser,
  findUserByEmail,
  verifyUser,
  findUserById,
  clearResetToken,
} = require("../../models/userModel");

const {
  sendVerificationEmail,
  sendVerificationSuccessEmail,
  sendResetPasswordEmail,
  sendPasswordResetSuccessEmail,
  sendWelcomeEmail,
} = require("../../utils/userEmailService");

// Centralized Error Handling Function
const handleError = (res, error, message = 'Something went wrong') => {
  console.error(error.message);
  return res.status(500).json({ message });
};

// User Signup
exports.userSignup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      is_admin: false,
      verification_code: verificationCode,
    });

    // Send verification email
    await sendWelcomeEmail(email);
    await sendVerificationEmail(email, verificationCode);

    return res.status(201).json({ message: "User registered successfully. Please verify your email." });
  } catch (error) {
    handleError(res, error, "Error during signup");
  }
};

// User Email Verification
exports.verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    // Ensure `User` is properly referenced
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verification_code !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.is_verified = true;
    user.verification_code = null;
    await user.save();

    // try {
    //   await sendVerificationSuccessEmail(email);
    // } catch (error) {
    //   console.error('Error sending verification success email:', error.message);
    // }

    await sendVerificationSuccessEmail(email);
    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    handleError(res, error, "Error verifying email");
  }
};

// User Login
exports.userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    
    if (!user || user.is_admin || !user.is_verified) {
      return res.status(400).json({ message: "Invalid email or unverified account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id, isAdmin: false }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    handleError(res, error, "Error during login");
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await findUserByEmail(email);

    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    user.reset_token = resetToken;
    user.reset_token_expiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    await sendResetPasswordEmail(email, resetToken);
    return res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    handleError(res, error, "Error during forgot password");
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.userId);

    if (!user || user.is_admin || user.reset_token !== token) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password and log it
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;

    // Clear reset token and save the user
    await clearResetToken(user.email);
    await user.save();

    await sendPasswordResetSuccessEmail(user.email);
    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    handleError(res, error, "Error during reset password");
  }
};

// Logout
exports.userLogout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    path: '/',
  });
  res.status(200).json({ message: 'Logout successful' });
};


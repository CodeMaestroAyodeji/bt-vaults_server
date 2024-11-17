// controllers/userController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  createUser,
  findUserByEmail,
  findUserByToken,
  clearResetToken,
} = require("../models/userModel");

const {
  sendVerificationEmail,
  sendVerificationSuccessEmail,
  sendResetPasswordEmail,
  sendPasswordResetSuccessEmail,
} = require("../utils/emailService");

// User Signup
exports.userSignup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      is_admin: false,
      verification_code: verificationCode,
    });

    await sendVerificationEmail(email, verificationCode);
    res
      .status(201)
      .json({
        message: "User registered successfully. Please verify your email.",
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during signup", error: error.message });
  }
};

// User Email Verification
exports.verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;
  try {
    // Find the user by email
    const user = await findUserByEmail(email);

    // Check if the user exists and the verification code matches
    if (!user || user.verification_code !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Update user's verification status
    user.is_verified = true;
    user.verification_code = null;
    await user.save();

    // Send the verification success email
    try {
      await sendVerificationSuccessEmail(email);
    } catch (error) {
      console.error("Error sending verification success email:", error.message);
    }

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying email", error: error.message });
  }
};

// User Login
exports.userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user || user.is_admin || !user.is_verified) {
      return res
        .status(400)
        .json({ message: "Invalid email or unverified account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await findUserByEmail(email);

    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    user.reset_token = resetToken;
    user.reset_token_expiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendResetPasswordEmail(email, resetToken);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during forgot password", error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserByToken(token);

    if (!user || user.is_admin)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    await clearResetToken(user.email);

    await sendPasswordResetSuccessEmail(user.email);
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during reset password", error: error.message });
  }
};

// controllers/adminController.js

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

const adminSignup = async (req, res) => {
  const { name, email, password, masterKey } = req.body;

  if (masterKey !== process.env.MASTER_KEY) {
    return res.status(403).json({ message: "Unauthorized access." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      is_admin: true,
      verification_code: verificationCode,
    });

    await sendVerificationEmail(email, verificationCode);
    res
      .status(201)
      .json({
        message: "Admin registered successfully. Please verify your email.",
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during Admin signup", error: error.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user || !user.is_admin || !user.is_verified) {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can login here." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials." });

    const token = jwt.sign(
      { userId: user._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ message: "Admin login successful", token });
  } catch (error) {
    console.error("Admin login error:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

const adminVerifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user || !user.is_admin)
      return res.status(404).json({ message: "Admin not found." });

    if (user.is_verified)
      return res
        .status(400)
        .json({ message: "Email already verified for admin." });

    if (user.verification_code !== verificationCode) {
      return res
        .status(400)
        .json({ message: "Invalid verification code for admin." });
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

    res.status(200).json({ message: "Admin email verification successful." });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Admin email verification failed.",
        error: error.message,
      });
  }
};

const adminForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await findUserByEmail(email);

    if (!user || !user.is_admin)
      return res.status(404).json({ message: "Admin not found" });

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    user.reset_token = resetToken;
    user.reset_token_expiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendResetPasswordEmail(email, resetToken);

    res.json({ message: "Password reset email sent to admin." });
  } catch (error) {
    console.error("Admin forgot password error:", error.message);
    res.status(500).json({ message: "Admin password reset request failed." });
  }
};

const adminResetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await findUserByToken(token);

    if (!admin || !admin.is_admin)
      return res.status(400).json({ message: "Invalid or expired token" });

    admin.password = await bcrypt.hash(newPassword, 10);
    await clearResetToken(admin.email);

    // Notify the admin
    await sendPasswordResetSuccessEmail(admin.email);

    res.json({ message: "Admin password reset successful." });
  } catch (error) {
    console.error("Admin reset password error:", error.message);
    res.status(500).json({ message: "Admin password reset failed." });
  }
};

module.exports = {
  adminSignup,
  adminLogin,
  adminVerifyEmail,
  adminForgotPassword,
  adminResetPassword,
};

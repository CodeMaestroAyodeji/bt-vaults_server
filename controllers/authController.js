// controllers/authController.js

// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const pool = require("../config/db");
// const crypto = require("crypto");
// const { sendVerificationEmail, sendPasswordResetSuccessEmail, sendVerificationSuccessEmail, sendResetPasswordEmail } = require("../utils/emailService");
// require("dotenv").config();

const userSignup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (user.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Insert user into database
    await pool.query(
      "INSERT INTO users (name, email, password, verificationCode) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, verificationCode]
    );

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    res
      .status(201)
      .json({
        message: "Signup successful! Please check your email for verification.",
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (user.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user[0].verified) {
      return res.status(400).json({ message: "Email is not verified" });
    }

    const token = jwt.sign(
      { id: user[0].id, isAdmin: user[0].isAdmin },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ message: "Login successful", token, isAdmin: user[0].isAdmin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (user.length === 0 || user[0].verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    await pool.query(
      "UPDATE users SET verified = true, verificationCode = NULL WHERE email = ?",
      [email]
    );

    // Send verification success email
    await sendVerificationSuccessEmail(email);

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
      if (user.length === 0) {
        return res.status(404).json({ message: "Email not found" });
      }
  
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
  
      await pool.query(
        "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
        [resetToken, resetTokenExpiry, email]
      );
  
      const resetUrl = `http://localhost:5000/api/auth/reset-password?token=${resetToken}`;
      await sendResetPasswordEmail(email, resetUrl);
  
      res.status(200).json({ message: "Password reset link sent to your email" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Query to find user with the given reset token and check if it's not expired
        const [rows] = await pool.query("SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()", [token]);

        // Check if the token is valid or expired
        if (!rows || rows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired token." });
        }

        const user = rows[0];

        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password and clear the reset token and expiry
        await pool.query("UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?", [hashedPassword, user.id]);

        // Send success email notification
        await sendPasswordResetSuccessEmail(user.email);

        // Respond with success message
        return res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

  
  module.exports = { userSignup, userLogin, verifyEmail, forgotPassword, resetPassword };
  

// routes/adminRoutes.js

const express = require('express');
const adminController = require('../controllers/authControllers/adminController');
const router = express.Router();

// Debugging Middleware
router.use((req, res, next) => {
    console.log(`[Admin Route] ${req.method} ${req.originalUrl}`);
    next();
  });

router.post('/signup', adminController.adminSignup);
router.post('/login', adminController.adminLogin);
router.post('/logout', adminController.adminLogout);
router.post('/verify-email', adminController.adminVerifyEmail); 
router.post('/forgot-password', adminController.adminForgotPassword);
router.post('/reset-password', adminController.adminResetPassword);


module.exports = router;

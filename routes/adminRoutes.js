// routes/adminRoutes.js

const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.post('/signup', adminController.adminSignup);
router.post('/login', adminController.adminLogin);
router.post('/verify-email', adminController.adminVerifyEmail); 
router.post('/forgot-password', adminController.adminForgotPassword);
router.post('/reset-password', adminController.adminResetPassword);


module.exports = router;

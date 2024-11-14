// routes/authRoutes.js

const express = require('express');
const { userSignup, userLogin, verifyEmail, forgotPassword, resetPassword } = require('../controllers/authController');
const { adminSignup, adminLogin } = require('../controllers/adminController');
const router = express.Router();

router.post('/admin/signup', adminSignup);
router.post('/admin/login', adminLogin);
router.post('/user/signup', userSignup);
router.post('/user/login', userLogin);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


module.exports = router;

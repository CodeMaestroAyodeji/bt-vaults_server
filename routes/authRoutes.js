const express = require('express');
const { userSignup, userLogin, verifyEmail, forgotPassword, resetPassword } = require('../controllers/userController');
const { adminSignup, adminLogin, adminVerifyEmail, adminForgotPassword, adminResetPassword } = require('../controllers/adminController');
const { authMiddleware, adminAuthMiddleware } = require('../middleware/authMiddleware');

const userRouter = express.Router();
userRouter.post('/signup', userSignup);
userRouter.post('/login', userLogin);
userRouter.post('/verify-email', verifyEmail);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);

const adminRouter = express.Router();
adminRouter.post('/signup', adminSignup);
adminRouter.post('/login', adminLogin);
adminRouter.post('/verify-email', adminVerifyEmail);
adminRouter.post('/forgot-password', adminForgotPassword);
adminRouter.post('/reset-password', adminResetPassword);

module.exports = { userRouter, adminRouter };

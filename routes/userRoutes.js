// /routes/userRoutes.js

const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Debugging Middleware
router.use((req, res, next) => {
    console.log(`[User Route] ${req.method} ${req.originalUrl}`);
    next();
  })


router.post('/signup', userController.userSignup);
router.post('/login', userController.userLogin);
router.post('/logout', userController.userLogout);
router.post('/verify-email', userController.verifyEmail);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);


module.exports = router;

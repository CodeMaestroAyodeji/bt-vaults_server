// /routes/userRoutes.js

const express = require('express');
const userController = require('../controllers/authControllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const { getUserStatistics } = require('../controllers/statistics/userStatistics');


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
router.get('/statistics', getUserStatistics);


module.exports = router;

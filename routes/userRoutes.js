// /routes/userRoutes.js

const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();


router.post('/signup', userController.userSignup);
router.post('/login', userController.userLogin);
router.post('/verify-email', userController.verifyEmail);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);


module.exports = router;

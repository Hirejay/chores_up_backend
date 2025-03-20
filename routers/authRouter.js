const express = require('express');
const router = express.Router();

// Middleware
const { isAuth, isAccepted, isAdmin, isClient, isWorker } = require('../middlewares/auth');

// Controllers
const { sendOTP, signUp, login, changePassword,logout} = require('../controllers/Auth');
const { resetPassword, resetPasswordToken } = require('../controllers/ResetPassword');

// Authentication Routes
router.post('/auth/send-otp', sendOTP);
router.post('/auth/register', signUp);
router.post('/auth/login', login);
router.put('/auth/change-password', isAuth, changePassword);
router.post('/auth/logout', isAuth, logout);

// Password Reset Routes
router.post('/auth/reset-password-token', resetPasswordToken);
router.put('/auth/reset-password', resetPassword);

module.exports = router;

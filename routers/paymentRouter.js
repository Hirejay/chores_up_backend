const express = require('express');
const router = express.Router();

// Middleware
const { isAuth, isAccepted, isAdmin, isClient, isWorker } = require('../middlewares/auth');

const { generateQRCODE } = require('../controllers/Payments');

// Generate QR Code for Payment
router.post('/payment/generateqrcode', isAuth, isWorker, isAccepted, generateQRCODE);

module.exports = router;

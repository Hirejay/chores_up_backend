const express = require('express');
const router = express.Router();

// Middleware
const { isAuth, isAccepted, isAdmin, isClient, isWorker } = require('../middlewares/auth');

// Controllers
const { decreaseEPFOFees, getAllEPFO, getMyEPFO, generatePaymentEmail } = require('../controllers/EPFOS');

// EPFO Routes
router.put('/epfo/decrease-fees', isAuth, isAdmin, decreaseEPFOFees);
router.get('/epfo/all', isAuth, isAdmin, getAllEPFO);
router.get('/epfo/my', isAuth, isWorker, getMyEPFO);
router.post('/epfo/generate-payment-mail', isAuth, isAdmin, generatePaymentEmail);

module.exports = router;

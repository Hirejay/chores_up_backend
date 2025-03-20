const express = require('express');
const router = express.Router();

// Middleware
const { isAuth, isAccepted, isAdmin, isClient, isWorker } = require('../middlewares/auth');

const { 
    getAcceptedProfiles, 
    getPendingProfiles, 
    makeProfileAccepted, 
    rejectProfile 
} = require('../controllers/Admins');

// Admin Routes
router.get('/admin/profiles-accepted', isAuth, isAdmin, getAcceptedProfiles);
router.get('/admin/profiles-pending', isAuth, isAdmin, getPendingProfiles);
router.put('/admin/profiles-accept', isAuth, isAdmin, makeProfileAccepted);
router.put('/admin/profiles-reject', isAuth, isAdmin, rejectProfile);

module.exports = router;

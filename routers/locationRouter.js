const express = require('express');
const router = express.Router();

// Middleware
const { isAuth, isAccepted, isAdmin, isClient, isWorker } = require('../middlewares/auth');

const {getRouteActive,getRouteRequested}=require('../controllers/Locations');

router.post('/location/get-route-active',isAuth,getRouteActive);
router.post('/location/get-route-requested',isAuth,isWorker,isAccepted,getRouteRequested);


module.exports = router;

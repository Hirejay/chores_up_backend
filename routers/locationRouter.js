const express = require('express');
const router = express.Router();

// Middleware
const { isAuth, isAccepted, isAdmin, isClient, isWorker } = require('../middlewares/auth');

const {getRouteActive,getRouteRequested}=require('../controllers/Locations');

router.get('/location/get-route-active',isAuth,getRouteActive);
router.get('/location/get-route-requested',isAuth,isWorker,isAccepted,getRouteRequested);


module.exports = router;

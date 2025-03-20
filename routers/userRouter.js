const express = require('express');
const router = express.Router();

// Middleware
const { isAuth, isAccepted, isAdmin, isClient, isWorker } = require('../middlewares/auth');

// Controllers
const {createProfile,getProfile}=require("../controllers/Users")

//User Routes


//Profile Routes
router.put('/user/createprofile',isAuth,isWorker,createProfile);
router.get('/user/getprofile',isAuth,isWorker,getProfile);


module.exports = router;
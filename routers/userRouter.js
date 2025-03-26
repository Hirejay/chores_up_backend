
const express = require('express');
const router = express.Router();
const {updateUser,getUser} = require("../controllers/Users");
const {isAccepted,isAdmin,isAuth,isClient,isWorker} = require('../middlewares/auth');


router.put('/user/updateuser',isAuth,updateUser);
router.get('/user/getuser',isAuth,getUser);



module.exports = router;
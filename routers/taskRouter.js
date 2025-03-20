const express = require('express');
const router = express.Router();

// Middleware
const { isAuth, isAccepted, isAdmin, isClient, isWorker } = require('../middlewares/auth');

// Controllers
const {
    createRequestedTask,
    acceptRequestedTask,
    updateWorkerLocation ,
    getRequestedTask,
    getRequestedTaskForClient ,
    cancelRequestedTask,
    completeActiveTask,
    getAllActiveTask
} = require('../controllers/ActiveTasks');

const { getAllTask } = require('../controllers/Tasks');

// Routes
router.post('/task/create', isAuth, isClient, createRequestedTask);
router.put('/task/accept', isAuth, isWorker, isAccepted, acceptRequestedTask);
router.put('/task/updatelocation',isAuth,isWorker,updateWorkerLocation);
router.get('/task/requestedforworker', isAuth, isWorker, isAccepted, getRequestedTask);
router.get('/task/requestedforclient',isAuth,isClient,getRequestedTaskForClient);
router.put('/task/cancel', isAuth, isClient, cancelRequestedTask);
router.put('/task/complete', isAuth, isWorker, isAccepted, completeActiveTask);
router.get('/task/active', isAuth, getAllActiveTask);
router.get('/task/all', isAuth, getAllTask);

module.exports = router;

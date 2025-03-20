const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios'); // For CommonJS modules

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for all requests

// Importing Configurations
const databaseConnection = require('./config/databaseConnection');
const cloudinaryConnection = require('./config/cloudinaryConnection');

// Importing Routers
const adminRouter = require('./routers/adminRouter');
const authRouter = require('./routers/authRouter');
const categoryRouter = require('./routers/categoryRouter'); // ✅ Fixed typo
const epfoRouter = require('./routers/epfoRouter');
const paymentRouter = require('./routers/paymentRouter');
const taskRouter = require('./routers/taskRouter');
const locationRouter=require('./routers/locationRouter');
const userRouter=require("./routers/userRouter");

// Database Connection
databaseConnection();
cloudinaryConnection();

// Routes
app.use('/api/v1', adminRouter);
app.use('/api/v1', authRouter);
app.use('/api/v1', categoryRouter); // ✅ Fixed typo
app.use('/api/v1', epfoRouter);
app.use('/api/v1', paymentRouter);
app.use('/api/v1', taskRouter);
app.use('/api/v1',locationRouter);
app.use('/api/v1',userRouter);


app.get('/', (req, res) => {
    res.send('Hello, This is the Chores Up App');
});

// Starting the Server
app.listen(PORT, () => {
    console.log(`Server Started At ${PORT}`);
});

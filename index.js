const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Importing Configurations
const databaseConnection = require('./config/databaseConnection');
const cloudinaryConnection = require('./config/cloudinaryConnection');

// Importing Routers
const adminRouter = require('./routers/adminRouter');
const authRouter = require('./routers/authRouter');
const categoryRouter = require('./routers/categoryRouter');
const epfoRouter = require('./routers/epfoRouter');
const paymentRouter = require('./routers/paymentRouter');
const taskRouter = require('./routers/taskRouter');
const locationRouter = require('./routers/locationRouter');
const userRouter = require("./routers/userRouter");

// Database Connection
databaseConnection();
cloudinaryConnection();

// Routes
app.use('/api/v1', adminRouter);
app.use('/api/v1', authRouter);
app.use('/api/v1', categoryRouter);
app.use('/api/v1', epfoRouter);
app.use('/api/v1', paymentRouter);
app.use('/api/v1', taskRouter);
app.use('/api/v1', locationRouter);
app.use('/api/v1', userRouter);

app.get('/', (req, res) => {
    res.send('Hello, This is the Chores Up App');
});
app.get('/test', (req, res) => {
    res.send('Test route working');
});

// Export for Vercel
module.exports = app;
// app.listen(4000, () => {
//     console.log("Server is running on port 4000");
// });

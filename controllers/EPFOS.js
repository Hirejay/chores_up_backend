const EPFO=require('../models/EPFO');
const { epfoPayment } = require('../template/EPFOPaymentTemplate');
const QRCode=require('qrcode');
const User=require('../models/User')
const mailSender=require("../utils/mailSender")

exports.decreaseEPFOFees = async (req,res) => {
    try {
        const {workerId,amount}=req.body;
        const updatedEPFO = await EPFO.findOneAndUpdate(
            { worker: workerId }, // Find EPFO by worker ID
            { $inc: { fees: -amount } }, // Decrease fees by the given amount
            { new: true } // Return updated document
        );

        // Ensure fees don't go below zero
        if (updatedEPFO.fees < 0) {
            updatedEPFO.fees = 0;
            await updatedEPFO.save();

        }
        res.status(200).json({
            success:true,
            message:"Descresing EPFO fees of Worker",
            updatedEPFO
        })
        
    } catch (error) {
        console.error("Error:While Descreasing EPFO fees of Worker");
        return res.status(500).json({
            success:true,
            message:error.message
        })
    }
};

exports.getAllEPFO = async (req, res) => {
    try {
        // Fetch all EPFO records with worker details (name & email)
        const allEPFOs = await EPFO.find().populate({
            path: 'worker', // Populate the 'worker' field
            populate: {
              path: 'additionalDetails', // Populate the 'additionalDetails' field inside 'worker'
              populate:{
                path: 'categorys'
              }
            },
          });

        // Filter records based on fees
        const zeroFees = allEPFOs.filter(record => record.fees === 0);
        const nonZeroFees = allEPFOs.filter(record => record.fees !== 0);

        // Calculate total fees for zeroFees and nonZeroFees
        const totalZeroFees = zeroFees.reduce((sum, record) => sum + record.fees, 0);
        const totalNonZeroFees = nonZeroFees.reduce((sum, record) => sum + record.fees, 0);
        
        res.status(200).json({
            success: true,
            message: "Fetched all EPFO records successfully",
            zeroFees,     // EPFO records with fees equal to 0
            nonZeroFees,  // EPFO records with fees not equal to 0
            totalZeroFees,    // Total fees for records with zero fees
            totalNonZeroFees  // Total fees for records with non-zero fees
        });

    } catch (error) {
        console.error("Error fetching EPFO records:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};


exports.getMyEPFO = async (req, res) => {
    try {
        const userId = req.user.id; // Get the logged-in user's ID

        const myEPFO = await EPFO.findOne({ worker: userId }).populate('worker'); // Fetch EPFO for user

        if (!myEPFO) {
            return res.status(404).json({
                success: false,
                message: "No EPFO record found for this user"
            });
        }

        res.status(200).json({
            success: true,
            message: "Fetched EPFO details successfully",
            data: myEPFO
        });

    } catch (error) {
        console.error("Error fetching EPFO details:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

exports.generatePaymentEmail = async (req, res) => {
    try {
        const { workerId, amount } = req.body;

        // Validate input
        if (!workerId || !amount) {
            return res.status(400).json({ success: false, message: "Worker ID and amount are required" });
        }

        // Find the worker
        const worker = await User.findById(workerId);
        if (!worker) {
            return res.status(404).json({ success: false, message: "Worker Not Found" });
        }

        // Generate unique transaction ID
        const transactionId = "TXN" + Date.now();

        // Generate UPI Payment URL
        const upiUrl = `upi://pay?pa=${process.env.DEFAULT_UPI_ID}&am=${amount}&cu=INR&tr=${transactionId}&tn=${encodeURIComponent(worker._id)}`;

        // Generate QR Code Image
        const qrCodeData = await QRCode.toDataURL(upiUrl);

        // Prepare email content
        const htmlContent = epfoPayment({
            name: worker.firstName,
            id: worker._id,
            amount,
            qrCodeData,
            upiUrl
        });

        // Send email
        await mailSender(worker.email, 'EPFO Payment Details', htmlContent);

        // Success response
        res.status(200).json({
            success: true,
            message: "Payment email sent successfully!",
            upiUrl,
            transactionId
        });

    } catch (error) {
        console.error("Error generating payment email:", error);
        res.status(500).json({ success: false, message: "Failed to generate payment email", error: error.message });
    }
};
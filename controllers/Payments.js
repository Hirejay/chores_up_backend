const QRCode=require('qrcode');
const User=require('../models/User');
const Profile=require('../models/Profile')

exports.generateQRCODE=async(req,res)=>{
    try {

        const workerId=req.user.id;
        const worker=await User.findById(workerId);
        const profile=await Profile.findById(worker.additionalDetails);
        const upiId=profile.upiid;
        const {amountpay,taskId}=req.body;

        if (!amountpay || isNaN(amountpay) || amountpay <= 0 || !taskId) {
            return res.status(400).json({ success: false, message: "Invalid amount or client ID" });
        }
         // Replace with actual UPI ID
        const amount = amountpay  // Get amount from query, default 100
        const transactionId = "TXN" + Date.now(); // Unique transaction ID

        // Generate UPI Payment URL
        const upiUrl = `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tr=${transactionId}&tn=${encodeURIComponent(taskId)}`;

       
        // Generate QR Code
        const qrCodeData = await QRCode.toDataURL(upiUrl);

        res.status(200).json({
            success: true,
            message: "QR Code generated successfully",
            upiUrl,
            qrCodeData,
            amount: amountpay
        });

    } catch (error) {
        console.error("Error generating QR Code:", error);
        res.status(500).json({ success: false, message: "Failed to generate QR Code" });
    }
        
}
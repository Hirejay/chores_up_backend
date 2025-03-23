require('dotenv').config();
exports.epfoPayment = ({ name, id, amount, qrCodeData, upiUrl }) => {
    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>EPFO Fee Payment Notification</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; text-align: center; padding: 20px; margin: 0;">
                <div style="max-width: 550px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #007bff; color: white; padding: 15px; font-size: 20px; border-radius: 10px 10px 0 0;">
                        EPFO Fee Payment Notice
                    </div>
                    <div style="text-align: left; padding: 20px; font-size: 16px; color: #333;">
                        <p>Dear <b>${name}</b>,</p>
                        <p>We hope you are doing well. Your <b>EPFO fee</b> has been updated.</p>
                        
                        <p><b>Worker ID:</b> ${id}</p>
                        <p><b>Updated Fee Amount:</b> ₹${amount}</p>
                        <p>Please complete your payment using the secure link or scan the QR code below:</p>
                        
                        <img src="${qrCodeData}" alt="UPI QR Code" style="width: 200px; height: 200px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;"/>
                        
                        <br>
                        <a href="${upiUrl}" target="_blank" 
                            style="display: inline-block; padding: 12px 20px; font-size: 16px; font-weight: bold; background-color: #28a745; color: white; border-radius: 5px; text-decoration: none; transition: 0.3s; margin-top: 10px;">
                            Pay Now
                        </a>
                        
                        <p style="margin-top: 20px; font-size: 14px; color: #777;">If the button doesn’t work, copy and paste this link into your UPI app:</p>
                        <p style="margin-top: 5px; font-size: 14px; color: #007bff;"><b><a href="${upiUrl}" style="color: #007bff; text-decoration: none;">${upiUrl}</a></b></p>

                        <p style="margin-top: 20px; font-size: 14px; color: #777;">Thank you for your prompt payment.</p>
                        <p>Need help? Contact us at <a href="mailto:help.choresup@gmail.com">help.choresup@gmail.com</a></p>
                        <p>&copy; 2025 Chores Up</p>
                    </div>
                </div>
            </body>
            </html>
            `;
};
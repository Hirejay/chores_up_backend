exports.verification = ({ name, otp }) => {
    return `<!DOCTYPE html>
    <html>
    <head>
        <title>Email Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 500px; background: white; padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1); margin: auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p style="font-size: 16px; color: #333;">Hello, <strong>${name}</strong>!</p>
            <p style="font-size: 16px; color: #333;">Thank you for signing up. Please use the OTP below to verify your email:</p>
            <div style="font-size: 20px; font-weight: bold; background-color: #f8f9fa; padding: 10px; display: inline-block; border-radius: 5px; margin-top: 10px;">${otp}</div>
            <p style="font-size: 16px; color: #333;">If you didn’t request this, you can safely ignore this email.</p>
            <p>Need help? Contact us at <a href="mailto:help.choresup@gmail.com">help.choresup@gmail.com</a></p>
            <p>&copy; 2025 Chores Up</p>
        </div>
    </body>
    </html>`;
};
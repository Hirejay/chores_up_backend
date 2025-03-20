exports.resetPasswordTemp=({name,RESET_LINK})=>{
    return `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset Request</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; text-align: center;">

                <div style="max-width: 600px; margin: 40px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p style="font-size: 16px; color: #555;">Hi <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; color: #555;">You recently requested to reset your password for your ChoresUp account. Click the button below to reset it:</p>
                    
                    <a href="{RESET_LINK}" style="display: inline-block; padding: 12px 20px; margin: 20px 0; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
                        Reset Your Password
                    </a>

                    <p style="font-size: 16px; color: #555;">If the button above doesn’t work, copy and paste the following link into your browser:</p>
                    <p style="font-size: 14px; color: #007BFF; word-wrap: break-word;">${RESET_LINK}</p>

                    <p style="font-size: 16px; color: #555;">If you didn't request this, you can safely ignore this email. Your password will not be changed.</p>
                    <p style="font-size: 16px; color: #555;">This reset link will expire in 1 hour.</p>

                    <div style="font-size: 14px; color: #777; margin-top: 20px;">
                        <p>Need help? Contact us at <a href="mailto:help.choresup@gmail.com">help.choresup@gmail.com</a></p>
                        <p>&copy; 2025 Chores Up</p>
                    </div>
                </div>

            </body>
            </html>
            `;
}
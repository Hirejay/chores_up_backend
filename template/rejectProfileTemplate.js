exports.rejectProfile=({name})=>{
    return `<!DOCTYPE html>
            <html>
            <head>
                <title>Chores Up - Profile Rejected</title>
            </head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #d9534f;">Worker Profile Rejected</h2>
                <p>Dear <b>${name}</b>,</p>
                <p>Unfortunately, your worker profile at <b>Chores Up</b> has been rejected.</p>
                <p>If you believe this was a mistake or want to update your profile, please reapply.</p>
                <p>Need help? Contact us at <a href="mailto:help.choresup@gmail.com">help.choresup@gmail.com</a></p>
                <p>&copy; 2025 Chores Up</p>
            </body>
            </html>
            `;
}
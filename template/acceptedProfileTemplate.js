exports.acceptProfile = ({ name }) => {
    return `<!DOCTYPE html>
            <html>
            <head>
                <title>Chores Up - Profile Accepted</title>
            </head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #28a745;">🎉 Congratulations, ${name}!</h2>
                <p>Dear <b>${name}</b>,</p>
                <p>We are pleased to inform you that your worker profile at <b>Chores Up</b> has been successfully approved! 🎉</p>
                <p>You can now start offering your services and connect with potential clients.</p>
                <p>Login to your account and get started</p>
                <p>If you have any questions, feel free to reach out to us at <a href="mailto:help.choresup@gmail.com">help.choresup@gmail.com</a></p>
                <p>Welcome to the Chores Up community!</p>
                <p>&copy; 2025 Chores Up</p>
            </body>
            </html>
            `;
};

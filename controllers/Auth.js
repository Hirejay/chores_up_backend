const User=require('../models/User');
const OTP=require('../models/Otp');
const otpGenerator=require('otp-generator');
const validator=require('validator');
const ProfileModel=require('../models/Profile')
const jwt=require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const EPFO=require('../models/EPFO');
const Profile = require('../models/Profile');
//sendotp
exports.sendOTP = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNo, accountType, password, confirmPassword } = req.body;

        // 1. Validate Required Fields
        if (!firstName || !lastName || !email || !phoneNo || !password || !confirmPassword || !accountType) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all the required details."
            });
        }
        

        // 2. Validate Email Format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format."
            });
        }

        // 3. Check Password Match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match."
            });
        }

        // 4. Check if User Already Exists
        const existingUser = await User.findOne({ $or: [{ email }, { phoneNo }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "A user with this email or phone number already exists."
            });
        }

        // 5. Generate Unique OTP
        let otp;
        let isOtpUnique = false;

        while (!isOtpUnique) {
            otp = otpGenerator.generate(6, {
                specialChars: false,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false
            });

            // Ensure OTP is unique
            const existingOTP = await OTP.findOne({ otp });
            if (!existingOTP) {
                isOtpUnique = true;
            }
        }

        // 6. Store OTP in Database
        const otpPayload = { email, otp };
        await OTP.create(otpPayload);

        console.log(`OTP for ${email}: ${otp}`);

        return res.status(200).json({
            success: true,
            message: "OTP has been sent successfully."
        });

    } catch (error) {
        console.error("Error while sending OTP:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while sending OTP. Please try again later."
        });
    }
};
exports.signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNo, accountType, password, confirmPassword, otp } = req.body;

        

        // 1. Validate Required Fields
        if (!firstName || !lastName || !email || !phoneNo || !password || !confirmPassword || !otp || !accountType) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        // 2. Validate Email Format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format."
            });
        }

        // 3. Check Password Match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match."
            });
        }

        // 4. Check if User Already Exists
        const existingUser = await User.findOne({ $or: [{ email }, { phoneNo }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "A user with this email or phone number already exists."
            });
        }

        // 5. Fetch the Most Recent OTP for the Email
        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });

        if (!recentOtp) {
            return res.status(400).json({
                success: false,
                message: "No OTP found. Please request a new OTP."
            });
        }

        

        // 6. Check OTP Expiry (Assuming OTP expires in 5 minutes)
        const otpExpiryTime = 5 * 60 * 1000; // 5 minutes in milliseconds
        if (new Date() - recentOtp.createdAt > otpExpiryTime) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });
        }

        // 7. Validate the OTP
        if (otp !== recentOtp.otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP."
            });
        }

        // 8. Delete OTP After Use (Enhances Security)
        await OTP.deleteOne({ _id: recentOtp._id });

        // 9. Hash the Password
        const hashedPassword = await bcrypt.hash(password, 10);
      

        // 10. Create User
        const user = await User.create({
            firstName,
            lastName,
            email,
            phoneNo,
            accountType,
            password: hashedPassword
        });
       
        // 11. If the User is a Worker, Create EPFO and Profile
        if (accountType === "worker") {
            const epfo = await EPFO.create({ worker: user._id });
            const profileDetails = await ProfileModel.create({ worker: user._id });

            user.additionalDetails = profileDetails._id;
            await user.save();

            
        }

        // 12. Send Success Response
        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            user
        });

    } catch (error) {
        console.error("Error during user signup:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later."
        });
    }
};

//login

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        const userPayload = { email: user.email, id: user._id, accountType: user.accountType };
        const token = jwt.sign(userPayload, process.env.JWT_SECRET_KEY, { expiresIn: "3d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        });

        return res.status(200).json({ success: true, message: "User logged in successfully.", user, token });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};



// Logout
exports.logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None"
        });

        return res.status(200).json({
            success: true,
            message: "User logged out successfully."
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later."
        });
    }
};



//change password

exports.changePassword = async (req, res) => {
    try {
        const { email, currPassword, newPassword } = req.body;

        // 1. Validate Input Fields
        if (!email || !currPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        // 2. Validate Email Format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format."
            });
        }

        // 3. Check Password Strength (Minimum 8 chars)
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters long."
            });
        }

        // 4. Find User by Email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // 5. Compare Current Password
        const isMatch = await bcrypt.compare(currPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect current password."
            });
        }

        // 6. Hash New Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 7. Update Password Securely
        await User.updateOne({ email }, { password: hashedPassword });

        // 8. Send Success Response
        return res.status(200).json({
            success: true,
            message: "Password changed successfully."
        });

    } catch (error) {
        console.error("Error while changing password:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later."
        });
    }
};


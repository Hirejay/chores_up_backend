const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
require('dotenv').config();

// Authentication Middleware
exports.isAuth = async (req, res, next) => {
    try {
        const token =
            req.cookies.token ||
            req.body.token ||
            (req.headers['authorization'] && req.headers['authorization'].replace("Bearer ", ""));

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Token Not Found',
            });
        }

        try {
            const userPayload = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.user = userPayload;
            next();
        } catch (error) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or Expired Token',
            });
        }
    } catch (error) {
        console.error("Error: Token Verification Failed", error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

// Client Role Middleware
exports.isClient = (req, res, next) => {
    try {
        if (req.user.accountType !== 'client') {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: Clients Only',
            });
        }
        next();
    } catch (error) {
        console.error("Error: Client Verification Failed", error);
        next(error);
    }
};

// Worker Role Middleware
exports.isWorker = (req, res, next) => {
    try {
        if (req.user.accountType !== 'worker') {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: Workers Only',
            });
        }
        next();
    } catch (error) {
        console.error("Error: Worker Verification Failed", error);
        next(error);
    }
};

// Worker Acceptance Middleware
exports.isAccepted = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userDetail = await User.findById(userId);
        if (!userDetail) {
            return res.status(404).json({
                success: false,
                message: 'User Not Found',
            });
        }

        const profile = await Profile.findById(userDetail.additionalDetails);
        if (!profile || profile.profileStatus !== 'accepted') {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: Only Accepted Workers Allowed',
            });
        }

        req.profile = profile;
        next();
    } catch (error) {
        console.error("Error: Worker Acceptance Verification Failed", error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

// Admin Role Middleware
exports.isAdmin = (req, res, next) => {
    try {
        if (req.user.accountType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: Admins Only',
            });
        }
        next();
    } catch (error) {
        console.error("Error: Admin Verification Failed", error);
        next(error);
    }
};

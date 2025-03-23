const EPFO = require('../models/EPFO');
const Profile = require('../models/Profile')
const User=require('../models/User');
const mailSender = require('../utils/mailSender');
const {rejectProfile}=require('../template/rejectProfileTemplate')
const {acceptProfile}=require('../template/acceptedProfileTemplate')

exports.getPendingProfiles = async (req, res) => {
    try {
        const pendingProfiles = await Profile.find({ profileStatus: "pending" }).populate("worker categorys");

        return res.status(200).json({
            success: true,
            count: pendingProfiles.length,
            pendingProfiles,
        });

    } catch (error) {
        console.error("Error while fetching pending profiles:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve pending profiles",
            error: error.message
        });
    }
};


exports.getAcceptedProfiles = async (req, res) => {
    try {
        const acceptedProfiles = await Profile.find({ profileStatus: "accepted" }).populate("worker categorys");

        return res.status(200).json({
            success: true,
            count: acceptedProfiles.length,
            acceptedProfiles,
        });

    } catch (error) {
        console.error("Error while fetching accepted profiles:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve accepted profiles",
            error: error.message
        });
    }
};



exports.makeProfileAccepted = async (req, res) => {
    try {
        const userId = req.user.id; // ✅ Fixed `req` typo (was `re`)
        const { profileId } = req.body;

        // ✅ Find and update the profile status
        const profile = await Profile.findByIdAndUpdate(
            profileId,
            { profileStatus: "accepted" },
            { new: true } // ✅ Return updated profile
        ).populate("worker");

        if (!profile) {
            return res.status(400).json({
                success: false,
                message: "Profile Not Found For Acceptance"
            });
        }

        // ✅ Check if worker exists to avoid errors
        if (!profile.worker || !profile.worker.email) {
            return res.status(400).json({
                success: false,
                message: "Worker details not found for sending email"
            });
        }

        // ✅ Generate email content
        const emailContent = acceptProfile({ name: profile.worker.firstName });

        // ✅ Send email (Added `await` and proper variable name)
        await mailSender(profile.worker.email, "🎉 Chores Up - Worker Profile Accepted", emailContent);

        return res.status(200).json({
            success: true,
            message: "Profile marked as Accepted successfully",
            profile
        });

    } catch (error) {
        console.error("Error: While Accepting Profile", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};



exports.rejectProfile = async (req, res) => {
    try {
        const userId = req.user.id; // ✅ Ensured correct `req.user.id`
        const { profileId } = req.body;

        // ✅ Find and delete the profile first
        const profile = await Profile.findByIdAndDelete(profileId).populate("worker");

        if (!profile || !profile.worker) {
            return res.status(400).json({
                success: false,
                message: "Profile or Worker Not Found",
            });
        }

        // ✅ Find and delete the worker based on `profile.worker._id`
        const worker = await User.findByIdAndDelete(profile.worker._id);

        if (!worker) {
            return res.status(400).json({
                success: false,
                message: "Worker Not Found",
            });
        }

        // ✅ Find and delete EPFO record linked to the worker
        const epfo = await EPFO.findOneAndDelete({ worker: worker._id });

        // ✅ Generate email content for rejection
        const emailContent = rejectProfile({ name: worker.firstName });

        // ✅ Send rejection email (Fixed variable name)
        await mailSender(worker.email, "🚫 Chores Up - Worker Profile Rejected", emailContent);

        return res.status(200).json({
            success: true,
            message: "Worker Profile Removed Successfully",
            profile,
            worker,
            epfo,
        });

    } catch (error) {
        console.error("Error: While Rejecting Profile", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};



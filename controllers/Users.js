const Profile = require("../models/Profile");



//profile
exports.createProfile = async (req, res) => {
    try {
        const workerId=req.user.id;
        const { upiid, gender, dateOfBirth, about, experience, categorys } = req.body;

        // Validate required fields
        if (!upiid || !gender || !dateOfBirth || !about || !experience || !categorys || !workerId) {
            return res.status(400).json({
                success: false,
                message: "Please fill all details",
            });
        }

        // Update or create the profile
        const profile = await Profile.findOneAndUpdate(
            { worker:workerId }, 
            { upiid, gender, dateOfBirth, about, experience, categorys }, 
            { new: true } // Returns updated document and creates new if not exists
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully, wait for approval from admin",
            profile, // Optionally send updated profile data
        });

    } catch (error) {
        console.error("Error updating profile:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please try again later",
        });
    }
};


exports.getProfile = async (req, res) => {
    try {
        const workerId  = req.user.id; // Ensure the request body contains `worker`
        
        if (!workerId) {
            return res.status(400).json({
                success: false,
                message: "Worker ID is required",
            });
        }

        const profile = await Profile.findOne({ worker:workerId });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile details fetched successfully",
            profile,
        });

    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message, // Send detailed error in development
        });
    }
};
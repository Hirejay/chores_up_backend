const User = require('../models/User');
const cloudinary=require('cloudinary').v2
const fs = require('fs').promises;
const path = require('path');

function isSupportedType(filetype, supportedTypes) {
    return supportedTypes.includes(filetype);
}

async function cloudinaryUpload(file, folder, quality) {
    const options = {
        folder,
        resource_type: "auto"
    };

    if (quality) {
        options.quality = quality;
    }

    return await cloudinary.uploader.upload(file.tempFilePath, options);
}

exports.updateUser = async (req, res) => {
    try {
        const { firstName, lastName, phoneNo, removeImage } = req.body;
        
        if (!firstName || !lastName || !phoneNo) {
            return res.status(400).json({ 
                success: false, 
                message: 'First name, last name, and phone number are required' 
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not foun'
            });
        }

        // Update basic fields
        user.firstName = firstName;
        user.lastName = lastName;
        user.phoneNo = phoneNo;

        // Handle image removal
        if (removeImage === 'true') {
            if (user.image && !user.image.includes('ui-avatars.com')) {
                try {
                    const publicId = user.image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`CHORESUP/${publicId}`);
                } catch (err) {
                    console.error('Error deleting image from Cloudinary:', err);
                }
            }
            user.image = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`;
        }

        // Handle new image upload
        if (req.files?.imageFile) {
            try {
                const image = req.files.imageFile;
                const supportedTypes = ['jpg', 'jpeg', 'png'];
                const filetype = image.name.split('.').pop().toLowerCase();

                if (!isSupportedType(filetype, supportedTypes)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Image Type Not Supported',
                        message: 'Only JPG, JPEG, and PNG images are allowed'
                    });
                }

                // Delete old image if exists
                if (user.image && !user.image.includes('ui-avatars.com')) {
                    const oldPublicId = user.image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`CHORESUP/${oldPublicId}`);
                }

                // Upload new image
                const cloudinaryImage = await cloudinaryUpload(image, "CHORESUP");
                user.image = cloudinaryImage.secure_url;

                // Clean up temp file
                await fs.unlink(image.tempFilePath);
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload image'
                });
            }
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNo: user.phoneNo,
                accountType: user.accountType,
                image: user.image || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update profile'
        });
    }
};

exports.getUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('firstName lastName email accountType phoneNo image');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }

        // Ensure image URL is set
        if (!user.image) {
            user.image = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`;
        }

        return res.status(200).json({
            success: true,
            message: "User Detail Fetch Successfully",
            data: user
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
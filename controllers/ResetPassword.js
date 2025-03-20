const User=require('../models/User');
require('dotenv').config();
const mailSender=require('../utils/mailSender')
const bcrypt=require('bcrypt');
const {resetPasswordTemp}=require('../template/resetPasswordTemplate')
//resetpasswordtoken
exports.resetPasswordToken=async (req,res)=>{
    try {
        const {email} = req.body;

        if(!email){
            return res.status(400).json({
                success:false,
                message:"All Field Requires"
            })
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not registered with this email"
            });
        }

        // Generate secure token
        const token = crypto.randomUUID();
        console.log(token);
        // Set token expiry time (1 hour)
        const resetPassTokenExpire = Date.now() + 60 * 60 * 1000;

        
        
        
        const updatedUser=await User.findOneAndUpdate({email},{resetPassToken:token,resetPassTokenExpire},{new:true});
        
        const url=`${process.env.UPDATE_PASSWORD_URL}${token}`;

    
        const htmlContent=resetPasswordTemp({name:user.firstName,RESET_LINK:url});
        // Send email
        const mailInfo = await mailSender(email, "Reset Password Link - Chores Up", htmlContent);

        if (!mailInfo ) {
            return res.status(400).json({
                success: false,
                message: "Failed to send password reset link"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Reset password link sent successfully"
        });



    }
    catch (error) {
        console.error("Error while generating reset password token:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}
//resetpassword
exports.resetPassword=async (req,res)=>{
    try{

        const {token, password, confirmPassword}=req.body;

        if(!token || !password || !confirmPassword){
            return res.status(400).json({
                success:false,
                massage:"All Field Required"
            })
        }

        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password And ConfirmPassword Must Be Same"

            })
        }

        const user=await User.findOne({resetPassToken:token});

        if(!user){

            return res.status(400).json({
                success:false,
                message:"Invalid or Expire Token"
            })

        }

        if(user.resetPassTokenExpire<Date.now()){
            return res.status(400).json({
                success:false,
                message:"Reset Password Link Is Expires"
            })
        }


        const hashPassword=await bcrypt.hash(password,10);



        const updatedUser=await User.findOneAndUpdate({resetPassToken:token},{password:hashPassword},{new:true})

        res.status(200).json({
            success:true,
            message:"Password Reset Successfully",
            user:updatedUser
        })


    }
    catch(error){
        console.error("Error while resetting password:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}
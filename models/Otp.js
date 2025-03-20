const mongoose=require('mongoose');
const mailSender=require('../utils/mailSender')
const {verification}=require("../template/verificationTemplate");
const otpSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
        required:true,
        expires:5*60
    }
})

async function sendVerificationEmail(email, otp) {
    try {
        let body = verification({ name: email, otp });

        const mailResponse = await mailSender(email, "Verification Email - By Chores Up", body);
        console.log('Mail Sent Successfully:', mailResponse);

    } catch (error) {
        console.error('Error while sending mail:', error);
        throw error;  // Propagate the error to be handled by the caller
    }
}

otpSchema.pre('save', async function (next) {
    try {
        await sendVerificationEmail(this.email, this.otp);
        next();  // Continue with saving the document

    } catch (error) {
        console.error('Error in pre-save hook:', error.message);
        next(error);  // Pass the error to Mongoose
    }
});

 

const Otp=mongoose.model('Otp',otpSchema);
module.exports=Otp;    
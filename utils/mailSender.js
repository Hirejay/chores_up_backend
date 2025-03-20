const nodemailer=require('nodemailer');
require('dotenv').config();
const mailSender=async (email,title,body)=>{
    try{

        const tranporter=nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            }
        });

        const info=await tranporter.sendMail({
            from:"ChoresUp | Home Services",
            to:`${email}`,
            subject:title,
            html:body
        })
        console.log(info);
        return info;

    }
    catch(error){
        console.log(error.message);
    }

}

module.exports=mailSender;
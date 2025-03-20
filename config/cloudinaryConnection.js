const cloudinary = require('cloudinary').v2
require('dotenv').config();


const cloudinaryConnection=()=>{
    try{

        cloudinary.config({
            cloud_name:process.env.CLOUD_NAME,
            api_key:process.env.API_KEY,
            api_secret:process.env.API_SECRET
        })
        console.log('Cloudinary Connection Successfully')

    }catch(err){
        console.log(err);
        console.log('Error To Connect Cloudinary');
    }
}

module.exports=cloudinaryConnection;
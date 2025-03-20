const cloudinary=require('cloudinary');

exports.mediaCloudinaryUploader=async(file,folder,height=null,quality=null)=>{
    try{
        const options={folder};
        if(height){
            options.height=height;
        }
        if(quality){
            options.quality=quality;
        }
        options.resource_type="auto"
        return await cloudinary.uploader.upload(file.tempFilePath,options)
    }catch(error){
        console.log("Error : while Image Upload On Cloudinary")
        
    }
}

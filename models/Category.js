const mongoose=require('mongoose');

const categorySchema=new mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    }


    
})

const Category=mongoose.model('Category',categorySchema);
module.exports=Category;
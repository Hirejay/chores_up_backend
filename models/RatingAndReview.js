const mongoose=require('mongoose');

const ratingAndReviewSchema=new mongoose.Schema({
    task:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Task',
        required:true,
    },
    client:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    worker:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    rate:{
        type:Number,
        required:true,
    },
    review:{
        type:String,
        required:true
    }

})

const RatingAndReview=mongoose.model('RatingAndReview',ratingAndReviewSchema);
module.exports=RatingAndReview;
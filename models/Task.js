const mongoose=require('mongoose');

const taskSchema=new mongoose.Schema({
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true,
    },
    instruction:{
        type:String,
    },
    client:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    clientLocation: { 
        type: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
            address: { type: String, required: true }
        },
        required: true
    },
    worker:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User', 
    },
    workerLocation: {
        type: {
            latitude: { type: Number },
            longitude: { type: Number },
            
        },
        
    },
    status:{
        type:String,
        enum:['completed','canceled'],
        required:true,
        
    },
    ratingAndReview:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'RatingAndReview',
        default:null
    }
    ,
    requestedAt:{
        type:Date,
        required:true,    
    },
    completedAt:{
        type:Date,
        default:Date.now,
        required:true, 

    }

})

const Task=mongoose.model('Task',taskSchema);
module.exports=Task;
const mongoose=require('mongoose');
const Task=require('../models/Task')
const activeTaskSchema=new mongoose.Schema({
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
        default:null
    },
    workerLocation: {
        type: {
            latitude: { type: Number },
            longitude: { type: Number },
           
        },
        default: null
    }    
    ,
    status:{
        type:String,
        enum:['Requested','Active'],
        required:true,
        default:"Requested"
    },
    createdAt:{
        type:Date,
        default:Date.now,
        required:true,    
    }

})



const ActiveTask=mongoose.model('ActiveTask',activeTaskSchema);
module.exports=ActiveTask;
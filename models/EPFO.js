const mongoose=require('mongoose');

const epfoSchema=new mongoose.Schema({
    worker:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true

    },
    fees:{
        type:Number,
        required:true,
        default:0
    }
})
const EPFO=mongoose.model('EPFO',epfoSchema);
module.exports=EPFO;
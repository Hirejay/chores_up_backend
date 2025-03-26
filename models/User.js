const mongoose=require('mongoose');
require('dotenv').config();

const UserSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true
    },
    lastName:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    phoneNo:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    accountType:{
        type:String,
        required:true,
        enum:['worker','client','admin'],
        
    },
    password:{
        type:String,
        required:true,
    },
    image:{
        type:String, 
        default: function() {
            return `https://ui-avatars.com/api/?name=${this.firstName}+${this.lastName}&background=random`;
        }
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Profile',
        default:null
    },
    historyTask:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Task'
        
    }],
    currentTask:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Task'
    },
    resetPassToken:{
        type:String
    },
    resetPassTokenExpire:{
        Type:Date
    }

})
const User=mongoose.model('User',UserSchema);
module.exports=User;
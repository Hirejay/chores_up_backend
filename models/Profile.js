const mongoose=require('mongoose');

const profileSchema=new mongoose.Schema({
    upiid:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        enum:['Male','Female','Other',null],
        default:null,
    },
    dateOfBirth:{
        type:Date,
        default:null,
    },
    about:{
        type:String,
        trim:true,
        default:null,
    },
    experience:{
        type:Number,
        default:0,
    },
    categorys:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        defalut:[],
    }],
    profileStatus:{
        type:String,
        enum:['Pending','Accepted','Rejected'],
        default:'Pending',
    },
    ratingAndReviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'RatingAndReview',
        default:[]
    }],
    worker:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }

})

const Profile=mongoose.model('Profile',profileSchema);
module.exports=Profile;
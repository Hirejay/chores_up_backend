const mongoose=require('mongoose');
require('dotenv').config();

const databaseConnection=()=>{
    mongoose.connect(process.env.DB_URL,
        {
            useNewUrlParser:true,
            useUnifiedTopology:true,
        }
    )
    .then(
        ()=>{
            console.log("Successfully Connected To Database")
        }
    )
    .catch(
        (error)=>{
            console.log("Error: To Connect Database")
        }
    )
}

module.exports=databaseConnection;
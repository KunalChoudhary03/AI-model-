const mongoose = require('mongoose');

async function connectDb() {
    try{
       await mongoose.connect(process.env.MONGODB_URL)
console.log('Connected To Db');

    }catch(err){
 console.log('Error in Db connection',err);
    }
}
module.exports = connectDb;
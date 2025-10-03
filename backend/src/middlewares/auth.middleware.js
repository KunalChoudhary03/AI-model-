const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

async function authUser(req,res,next){
const {token} = req.cookies;
console.log('Auth middleware - Cookies received:', req.cookies);
console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');

if(!token){
   return res.status(401).json({
        message: "No authentication token found. Please login again.",
        error: "MISSING_TOKEN"
    })
}
try{
 const decoded = jwt.verify(token,process.env.JWT_SECRET);
 const user = await userModel.findById(decoded.id)
 if (!user) {
   return res.status(401).json({
     message: "User not found. Please login again.",
     error: "USER_NOT_FOUND"
   })
 }
 req.user = user;
 next();
}
catch(err){
    console.log('Auth middleware error:', err.message);
    res.status(401).json({
        message: "Invalid or expired token. Please login again.",
        error: "INVALID_TOKEN"
    })
}
}

module.exports = {
    authUser
}
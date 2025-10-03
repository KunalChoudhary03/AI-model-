const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs')
const jwt =require("jsonwebtoken");

async function registerUser(req,res) {
    const { fullName:{firstName,lastName},email,password} = req.body;
    const isUserAlreadyExists = await userModel.findOne({email})
    if(isUserAlreadyExists){
      return res.status(400).json({message: "user already exists"});
    }
    const hashPassword = await bcrypt.hash(password,10);
    const user = await userModel.create({
        fullName:{
            firstName,lastName
        },
        email,
        password: hashPassword
    })
    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

    res.cookie('token',token)
    res.status(201).json({
        message: "User registered sucessfully",
        user:{
            email:user.email,
            _id: user._id,
            fullName: user.fullName
        }
    })
}

async function loginUser(req,res) {
    const {email,password} = req.body;
   
    const user = await userModel.findOne({email})
    if(!user){
        return res.status(400).json({message: "Invalid email or pasword"})
    }
    const isPasswordValid = await bcrypt.compare(password,user.password)
    if(!isPasswordValid){
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }
    const token = jwt.sign({id:user._id},process.env.JWT_SECRET);

    res.cookie("token",token);
    res.status(200).json({
        message:"User Logged in successfully",
        user:{
           email:user.email,
           _id: user._id,
           fullName: user.fullName
         }
    })
}

async function getProfile(req,res) {
    const user = req.user;
    res.status(200).json({
        user:{
           email:user.email,
           _id: user._id,
           fullName: user.fullName
         }
    })
}

async function logoutUser(req,res) {
    res.clearCookie('token');
    res.status(200).json({
        message: "Logged out successfully"
    })
}

async function deleteAccount(req, res) {
    try {
        const userId = req.user._id;

        // Delete user's chats and messages
        const Chat = require('../models/chat.model');
        const Message = require('../models/message.model');
        const { deleteUserFromPinecone } = require('../services/vector.service');
        
        // Find all user's chats
        const userChats = await Chat.find({ user: userId });
        const chatIds = userChats.map(chat => chat._id);
        
        // Delete all messages from user's chats
        await Message.deleteMany({ chat: { $in: chatIds } });
        
        // Delete all user's chats
        await Chat.deleteMany({ user: userId });
        
        // Delete user data from Pinecone database
        await deleteUserFromPinecone(userId);
        
        // Delete the user
        const User = require('../models/user.model');
        await User.findByIdAndDelete(userId);
        
        // Clear the authentication cookie
        res.clearCookie('token');
        
        res.status(200).json({
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            message: "Error deleting account",
            error: error.message
        });
    }
}

module.exports = {registerUser, loginUser, getProfile, logoutUser, deleteAccount}
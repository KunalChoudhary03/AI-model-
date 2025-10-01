const chatModel = require('../models/chat.model');

const MAX_HISTORY_MESSAGES = 50; // Only keep last 50 messages in backend memory

async function createChat(req,res){
    const {title} = req.body;
    const user = req.user;

 const chat = await chatModel.create({
    user: user._id,
    title
});


   res.status(201).json({
    message:"chat created Successfully",
    chat:{
        _id: chat._id,
        title: chat.title,
        lastActivity: chat.lastActivity,
        user : chat.user
    }
   })
}

function trimConversationHistory(messages) {
  if (messages.length > MAX_HISTORY_MESSAGES) {
    // Optionally, summarize or archive older messages here
    return messages.slice(-MAX_HISTORY_MESSAGES);
  }
  return messages;
}

module.exports = {createChat};
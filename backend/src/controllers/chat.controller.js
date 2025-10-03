const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');
const { deleteUserData } = require('../services/vector.service');

const MAX_HISTORY_MESSAGES = 50; // Only keep last 50 messages in backend memory

async function createChat(req,res){
    try {
        const {title} = req.body;
        const user = req.user;

        const chat = await chatModel.create({
            user: user._id,
            title
        });

        res.status(201).json({
            success: true,
            message:"Chat created successfully",
            chat:{
                _id: chat._id,
                title: chat.title,
                lastActivity: chat.lastActivity,
                user : chat.user
            }
        });
    } catch (error) {
        console.error('Create chat error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to create chat"
        });
    }
}

async function getUserChats(req, res) {
    try {
        const user = req.user;
        const chats = await chatModel.find({ user: user._id })
            .sort({ lastActivity: -1 })
            .limit(50);

        // Get messages for each chat
        const chatsWithMessages = await Promise.all(
            chats.map(async (chat) => {
                const messages = await messageModel.find({ chat: chat._id })
                    .sort({ createdAt: 1 })
                    .limit(100);
                
                return {
                    id: chat._id,
                    title: chat.title,
                    lastActivity: chat.lastActivity,
                    messages: messages.map(msg => ({
                        id: msg._id,
                        text: msg.content,
                        sender: msg.sender
                    }))
                };
            })
        );

        res.json({
            success: true,
            chats: chatsWithMessages
        });
    } catch (error) {
        console.error('Get user chats error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch chats"
        });
    }
}

async function deleteChat(req, res) {
    try {
        const { chatId } = req.params;
        const user = req.user;

        // Check if chat belongs to user
        const chat = await chatModel.findOne({ _id: chatId, user: user._id });
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        // Delete all messages in the chat
        await messageModel.deleteMany({ chat: chatId });

        // Delete from vector database
        try {
            await deleteUserData(user._id.toString(), chatId);
        } catch (vectorError) {
            console.error('Vector deletion error:', vectorError);
            // Continue with chat deletion even if vector deletion fails
        }

        // Delete the chat
        await chatModel.findByIdAndDelete(chatId);

        res.json({
            success: true,
            message: "Chat deleted successfully"
        });
    } catch (error) {
        console.error('Delete chat error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to delete chat"
        });
    }
}

function trimConversationHistory(messages) {
  if (messages.length > MAX_HISTORY_MESSAGES) {
    // Optionally, summarize or archive older messages here
    return messages.slice(-MAX_HISTORY_MESSAGES);
  }
  return messages;
}

module.exports = {
    createChat,
    getUserChats,
    deleteChat
};
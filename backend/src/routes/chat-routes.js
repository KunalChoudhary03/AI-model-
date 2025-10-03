const express = require("express");
const authMiddleware = require('../middlewares/auth.middleware')
const chatController = require('../controllers/chat.controller')

const router = express.Router();

router.post('/', authMiddleware.authUser, chatController.createChat)
router.get('/', authMiddleware.authUser, chatController.getUserChats)
router.delete('/:chatId', authMiddleware.authUser, chatController.deleteChat)

module.exports = router
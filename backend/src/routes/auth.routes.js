const express = require("express");
const authControllers = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const router = express.Router();

router.post("/register",authControllers.registerUser)
router.post('/login',authControllers.loginUser)
router.get('/profile',authMiddleware.authUser,authControllers.getProfile)
router.post('/logout',authControllers.logoutUser)
router.delete('/delete-account',authMiddleware.authUser,authControllers.deleteAccount)

module.exports = router;
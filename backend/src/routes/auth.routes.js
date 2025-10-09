const express = require("express");
const authControllers = require('../controllers/auth.controller')
const { authUser } = require('../middlewares/auth.middleware')
const router = express.Router();

router.post("/register",authControllers.registerUser)
router.post('/login',authControllers.loginUser)
router.get('/profile', authUser, authControllers.getProfile)

module.exports = router;
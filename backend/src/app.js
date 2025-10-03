const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// Routes
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat-routes');
const app = express();


// using middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://jeeravan.vercel.app",
        "https://jeeravan-git-main-kunalchoudhary03s-projects.vercel.app",
        "https://jeeravan-kunalchoudhary03s-projects.vercel.app"
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// using Routes
app.use('/api/auth',authRoutes);
app.use('/api/chat',chatRoutes);


module.exports = app;
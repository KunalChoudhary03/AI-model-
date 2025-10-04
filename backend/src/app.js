const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// Routes
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat-routes');
const app = express();


// using middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials:true
}));
app.use(express.json());
app.use(cookieParser());

// using Routes
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});
app.use('/api/auth',authRoutes);
app.use('/api/chat',chatRoutes);


module.exports = app;
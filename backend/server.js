require('dotenv').config({ path: __dirname + '/.env' });
const app = require('./src/app');
const connectDb = require('./src/db/db');
const initSocketServer = require('./src/sockets/socket.server');
const { testAIService } = require('./src/services/ai.service');
const httpServer = require('http').createServer(app);

connectDb();
initSocketServer(httpServer);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    
    // Test AI service on startup
    console.log('Testing AI service...');
    const workingModel = await testAIService();
    if (workingModel) {
        console.log(`✅ AI service working with model: ${workingModel}`);
    } else {
        console.log('❌ AI service test failed - check API key and models');
    }
});
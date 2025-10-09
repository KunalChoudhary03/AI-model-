# Backend Deployment Configuration

## For Railway/Render/Heroku Deployment

### Environment Variables Required:
```
MONGODB_URL=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PORT=3000
```

### Deployment Commands:
```bash
npm install
npm start
```

### Port Configuration:
The server will run on the PORT environment variable or default to 3000.

### Database:
- Uses MongoDB Atlas
- Ensure IP whitelist includes: 0.0.0.0/0 for cloud deployment
- Or specific deployment platform IPs

### API Endpoints:
- `/api/auth/register` - User registration
- `/api/auth/login` - User login  
- `/api/chat` - Chat management
- `/api/chat/messages/:chatId` - Get chat messages

### Socket.io:
- Real-time chat functionality
- Configured for CORS with frontend origin
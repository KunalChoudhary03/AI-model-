# Jeeravan AI Chat Application

A modern AI-powered chat application built with React, Node.js, and MongoDB.

## Features
- Real-time chat with AI (Jeeravan personality)
- User authentication (register/login)
- Chat session management
- Mobile-responsive design
- Vector database integration with Pinecone

## Tech Stack
- **Frontend**: React, Vite, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB Atlas
- **AI**: Google Generative AI (Gemini)
- **Vector DB**: Pinecone

## Deployment

### Vercel (Frontend)
This project is configured for Vercel deployment with:
- `vercel.json` configuration
- Node.js 18.17.0 (specified in `.nvmrc`)
- Optimized build scripts for Unix environments

### Environment Variables
Make sure to set these environment variables in your deployment:

**Backend (.env)**:
```
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

## Local Development

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Build Issues
If you encounter permission errors during deployment, the project includes:
- Alternative build script (`npm run build:vercel`)
- Fallback build script (`build.sh`)
- Explicit permission handling in build process

## Security
- All sensitive information is in `.env` files (not committed)
- API keys are protected by `.gitignore`
- MongoDB Atlas with IP whitelisting
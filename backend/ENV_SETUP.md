# Instructions for setting up environment variables

1. Copy .env.example to .env:
   cp .env.example .env

2. Edit the .env file with your actual credentials:
   - MONGODB_URL: Your MongoDB connection string
   - JWT_SECRET: A random 64-character string for JWT signing
   - GEMINI_API_KEY: Your Google Gemini API key
   - PINECONE_API_KEY: Your Pinecone vector database API key

3. NEVER commit the .env file to git!
   (It's already in .gitignore)

4. For production deployment, set these as environment variables
   in your hosting platform (Vercel, Railway, Heroku, etc.)
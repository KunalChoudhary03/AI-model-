const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173", // frontend URL
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.token;

      if (!token) {
        // Attach a flag for unauthenticated user
        socket.isGuest = true;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);

      if (!user) {
        socket.isGuest = true;
        return next();
      }

      socket.user = user; // attach user to socket
      socket.isGuest = false;
      next();
    } catch (error) {
      console.error("Socket auth error:", error.message);
      socket.isGuest = true;
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user ? socket.user._id : "guest");

    // Handle user message -> AI response
    socket.on("ai-message", async (messagePayload) => {
      // If not authenticated or no valid chat, send predefined message
      if (socket.isGuest || !messagePayload.chat) {
        socket.emit("ai-response", {
          content: "👋 Namaste! Please login and create a new chat to use JEERAVAN AI.",
          chat: messagePayload.chat || null
        });
        return;
      }
      try {
        // ...existing code...
        // Save user message & generate vector
        const [message, vectors] = await Promise.all([
          messageModel.create({
            chat: messagePayload.chat,
            user: socket.user._id,
            content: messagePayload.content,
            role: "user"
          }),
          aiService.generateVector(messagePayload.content)
        ]);

        await createMemory({
          messageId: message._id,
          vector: vectors,
          metadata: {
            chat: messagePayload.chat,
            user: socket.user._id,
            text: messagePayload.content
          }
        });

        // Get relevant memory & recent chat history
        const [memory, chatHistoryRaw] = await Promise.all([
          queryMemory({
            queryVector: vectors,
            limit: 3,
            metadata: { user: socket.user._id }
          }),
          messageModel.find({ chat: messagePayload.chat }).sort({ createdAt: -1 }).limit(20).lean()
        ]);

        const chatHistory = chatHistoryRaw.reverse();

        const stm = chatHistory.map(item => ({
          role: item.role,
          parts: [{ text: item.content }]
        }));

        const ltm = [
          {
            role: "user",
            parts: [{
              text: `Relevant previous messages:\n${memory.map(item => item.metadata.text).join("\n")}`
            }]
          }
        ];

        // Generate AI response with error handling
        let response = "JEERAVAN AI service is currently unavailable. Please try again later.";
        try {
          response = await aiService.generateResponse([...ltm, ...stm]);
        } catch (aiErr) {
          console.error("JEERAVAN AI service error:", aiErr.message);
        }

        // Emit AI response to user
        socket.emit("ai-response", {
          content: response,
          chat: messagePayload.chat
        });

        // Save AI response & vector only if service worked
        if (response !== "JEERAVAN AI service is currently unavailable. Please try again later.") {
          const responseVector = await aiService.generateVector(response);
          const responseMessage = await messageModel.create({
            chat: messagePayload.chat,
            user: socket.user._id,
            content: response,
            role: "model"
          });

          await createMemory({
            messageId: responseMessage._id,
            vector: responseVector,
            metadata: {
              chat: messagePayload.chat,
              user: socket.user._id,
              text: response
            }
          });
        }

      } catch (err) {
        console.error("Socket JEERAVAN AI handler failed:", err);
        socket.emit("ai-response", {
          content: "Something went wrong. Please try again later.",
          chat: messagePayload.chat
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user?._id);
    });
  });
}

module.exports = initSocketServer;
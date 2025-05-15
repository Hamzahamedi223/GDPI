const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const routes = require("./routes");
const chatRoutes = require("./routes/chat");
const path = require("path");
const { createServer } = require("http");
const { Server } = require("socket.io");
const Chat = require("./models/Chat");
require("dotenv").config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", routes);
app.use("/api/chat", chatRoutes);

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", async (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    
    // Send chat history
    const chat = await Chat.findOne({ roomId });
    if (chat) {
      socket.emit("chat_history", chat.messages);
    }
  });

  socket.on("send_message", async (data) => {
    const { roomId, sender, content } = data;
    
    // Save message to database
    const message = { sender, content, timestamp: new Date() };
    await Chat.findOneAndUpdate(
      { roomId },
      { $push: { messages: message } },
      { upsert: true }
    );

    // Broadcast message to room
    io.to(roomId).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/Gestion_du_parc_informatique")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Environment variables loaded:", {
    MONGO_URI: process.env.MONGO_URI ? "Set" : "Not set",
    PORT: process.env.PORT ? "Set" : "Not set",
    JWT_SECRET: process.env.JWT_SECRET ? "Set" : "Not set",
    EMAIL_USER: process.env.EMAIL_USER ? "Set" : "Not set",
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "Set" : "Not set",
    FRONTEND_URL: process.env.FRONTEND_URL ? "Set" : "Not set"
  });
});

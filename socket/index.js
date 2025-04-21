// const { Server } = require("socket.io");
import { Server } from "socket.io";
import dotenv from "dotenv"
// const dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT || 3000;

const io = new Server({
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? "https://real-chat-1-eng7.onrender.com/"
        : "http://localhost:5173",
  },
});

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("new connection", socket.id);

  socket.on("addNewUser", (userId) => {
    !onlineUsers.some((user) => user.userId === userId) &&
      onlineUsers.push({ userId, socketId: socket.id });

    console.log("onlineUsers", onlineUsers);
    io.emit("getOnlineUsers", onlineUsers);
  });

  socket.on("sendMessage", (message) => {
    const user = onlineUsers.find((u) => u.userId === message.recipientId);
    if (user) {
      io.to(user.socketId).emit("getMessage", message);
      io.to(user.socketId).emit("getNotification", {
        senderId: message.senderId,
        isRead: false,
        date: new Date(),
      });
    }
  });

  socket.on("typing", ({ chatId, userId, recipientId }) => {
    socket.to(recipientId).emit("userTyping", userId);
  });

  socket.on("stopTyping", ({ chatId, userId, recipientId }) => {
    socket.to(recipientId).emit("userStoppedTyping", userId);
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
});

io.listen(port, () => {
  console.log(`✅ Socket.IO server running on port ${port}`);
});


require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/database");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start Server
const server = app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(` API URL: http://localhost:${PORT}`);
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// JWT auth for sockets
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("No auth token"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  console.log(" Socket connected:", socket.id);

  // Join team room
  socket.on("join-team", (teamId) => {
    if (!teamId) return;
    socket.join(`team:${teamId}`);
  });

  // Leave team room
  socket.on("leave-team", (teamId) => {
    if (!teamId) return;
    socket.leave(`team:${teamId}`);
  });

  // Send message broadcast (fallback if emitted from client)
  socket.on("send-message", ({ teamId, message }) => {
    if (!teamId || !message) return;
    io.to(`team:${teamId}`).emit("new-message", {
      content: message,
      senderId: socket.data.userId,
      teamId,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    console.log(" Socket disconnected:", socket.id);
  });
});

// expose io to routes/controllers
app.set("io", io);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(` Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(` Uncaught Exception: ${err.message}`);
  process.exit(1);
});

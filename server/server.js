const dns = require("dns");

// Force Google DNS to resolve MongoDB SRV strings
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

// ===============================
// Socket.IO
// ===============================
const http = require("http");
const { Server } = require("socket.io");

// ===============================
// Load Environment Variables
// ===============================
dotenv.config();

// ===============================
// Connect MongoDB
// ===============================
connectDB();

// ===============================
// Create Express App
// ===============================
const app = express();

// ===============================
// Create HTTP Server
// ===============================
const server = http.createServer(app);

// ===============================
// Socket.IO
// ===============================
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Make io available everywhere
app.set("io", io);

// ===============================
// Middleware
// ===============================
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// ===============================
// Routes
// ===============================
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const swapRoutes = require("./routes/swapRoutes");
const chatRoutes = require("./routes/chatRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/chat", chatRoutes);

// ===============================
// Health Check
// ===============================
app.get("/", (req, res) => {

    res.send("SkillHub Server Running");

});

// ===============================
// Socket Events
// ===============================
io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);

    socket.on("joinRoom", (swapId) => {

        socket.join(swapId);

        console.log("Joined Room:", swapId);

    });

    socket.on("leaveRoom", (swapId) => {

        socket.leave(swapId);

        console.log("Left Room:", swapId);

    });

    socket.on("disconnect", () => {

        console.log("User Disconnected:", socket.id);

    });

});
// ===============================
// Global Error Handler
// ===============================
app.use((err, req, res, next) => {

    console.error(err.stack);

    res.status(err.status || 500).json({

        message: err.message || "Internal Server Error"

    });

});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

    console.log(`🚀 Server running on port ${PORT}`);

});
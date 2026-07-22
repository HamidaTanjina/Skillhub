const dns = require("dns");

// Force Google DNS to resolve MongoDB SRV strings on restricted networks
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

// Load Environment Variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes Imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const swapRoutes = require("./routes/swapRoutes");

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/swaps", swapRoutes);

// Root Health Check Route
app.get("/", (req, res) => {
    res.send("SkillHub Server Running");
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
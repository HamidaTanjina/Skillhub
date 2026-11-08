
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
        return res.status(401).json({
            message: "No token, authorization denied"
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "fallback_secret"
        );

        const userId = decoded.id || decoded._id || decoded.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Invalid token payload"
            });
        }

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "User no longer exists"
            });
        }

        if (user.isBanned) {
            return res.status(403).json({
                message: "Your account has been suspended"
            });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === "JsonWebTokenError" ||
            err.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        console.error("Authentication error:", err);

        return res.status(500).json({
            message: "Authentication failed"
        });
    }
};

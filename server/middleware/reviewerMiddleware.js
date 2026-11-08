
const User = require("../models/User");

module.exports = async (req, res, next) => {
    try {
        // Confirm the logged-in account still exists and has permission.
        const user = await User.findById(req.user.id).select("role");

        if (!user) {
            return res.status(401).json({
                message: "User account not found."
            });
        }

        if (!["reviewer", "admin"].includes(user.role)) {
            return res.status(403).json({
                message: "Access denied. Reviewer permission is required."
            });
        }

        req.reviewer = user;
        next();
    } catch (error) {
        console.error("Reviewer Authorization Error:", error);

        return res.status(500).json({
            message: "Could not verify reviewer permissions."
        });
    }
};

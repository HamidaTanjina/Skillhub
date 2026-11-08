
const User = require("../models/User");
const SwapRequest = require("../models/swapRequest");

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error("Admin get users error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve users."
        });
    }
};

// PATCH /api/admin/users/:userId/ban
exports.banUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (String(req.user._id || req.user.id) === userId) {
            return res.status(400).json({
                success: false,
                message: "You cannot ban your own account."
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { isBanned: true } },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "User banned successfully.",
            user
        });
    } catch (error) {
        console.error("Admin ban user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to ban user."
        });
    }
};

// PATCH /api/admin/users/:userId/unban
exports.unbanUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { $set: { isBanned: false } },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "User unbanned successfully.",
            user
        });
    } catch (error) {
        console.error("Admin unban user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to unban user."
        });
    }
};

// GET /api/admin/swaps
exports.getAllSwaps = async (req, res) => {
    try {
        const swaps = await SwapRequest.find()
            .populate("sender", "name email")
            .populate("receiver", "name email")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: swaps.length,
            swaps
        });
    } catch (error) {
        console.error("Admin get swaps error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve swaps."
        });
    }
};

// PATCH /api/admin/swaps/:swapId/status
exports.updateSwapStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Accepted",
            "Pending Confirmation",
            "Completed",
            "Rejected"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid swap status.",
                allowedStatuses
            });
        }

        const swap = await SwapRequest.findByIdAndUpdate(
            req.params.swapId,
            { $set: { status } },
            { new: true, runValidators: true }
        )
            .populate("sender", "name email")
            .populate("receiver", "name email");

        if (!swap) {
            return res.status(404).json({
                success: false,
                message: "Swap request not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Swap status updated successfully.",
            swap
        });
    } catch (error) {
        console.error("Admin update swap error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update swap status."
        });
    }
};

// GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
    try {
        const [
            totalUsers,
            bannedUsers,
            totalSwaps,
            pendingSwaps,
            acceptedSwaps,
            completedSwaps,
            rejectedSwaps,
            pendingVerifications
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isBanned: true }),
            SwapRequest.countDocuments(),
            SwapRequest.countDocuments({ status: "Pending" }),
            SwapRequest.countDocuments({ status: "Accepted" }),
            SwapRequest.countDocuments({ status: "Completed" }),
            SwapRequest.countDocuments({ status: "Rejected" }),
            User.countDocuments({
                "skillVerifications.status": "pending"
            })
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                bannedUsers,
                totalSwaps,
                pendingSwaps,
                acceptedSwaps,
                completedSwaps,
                rejectedSwaps,
                pendingVerifications
            }
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve admin statistics."
        });
    }
};

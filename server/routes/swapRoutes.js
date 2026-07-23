const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
    sendRequest,
    getMyRequests,
    acceptRequest,
    rejectRequest,
    completeSwap,
    getRequestStatus,
    getSentRequests
} = require("../controllers/swapController");

// ===============================
// Send Swap Request
// ===============================
router.post("/send", protect, sendRequest);

// ===============================
// Get My Requests
// ===============================
router.get("/my", protect, getMyRequests);
router.get("/my-requests", protect, getMyRequests);

// ===============================
// Check Request Status
// ===============================
router.get("/status/:receiverId", protect, getRequestStatus);

// ===============================
// Get My Sent Requests
// ===============================
router.get("/sent", protect, getSentRequests);

// ===============================
// Accept Request
// ===============================
router.put("/:id/accept", protect, acceptRequest);
router.put("/accept/:id", protect, acceptRequest);

// ===============================
// Reject Request
// ===============================
router.put("/:id/reject", protect, rejectRequest);
router.put("/reject/:id", protect, rejectRequest);

// ===============================
// Complete Swap
// ===============================
router.put("/:id/complete", protect, completeSwap);
router.put("/complete/:id", protect, completeSwap);

module.exports = router;
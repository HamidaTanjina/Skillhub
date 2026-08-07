const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
    sendRequest,
    getMyRequests,
    acceptRequest,
    rejectRequest,
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

module.exports = router;

const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    sendRequest,
    getMyRequests,
    acceptRequest,
    rejectRequest,
    getSentRequests,
    createSession,
    getMySessions,
    cancelSession
} = require("../controllers/swapController");

const {
    getSwapProgress,
    addLearningGoal,
    updateLearningGoal,
    addSessionLog,
    updateSessionLog
} = require("../controllers/swapProgressController");

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

// ===============================
// Swap Session Scheduling
// ===============================
router.post("/:id/sessions", protect, createSession);
router.get("/sessions/my", protect, getMySessions);
router.patch("/sessions/:sessionId/cancel", protect, cancelSession);

// ===============================
// Swap Learning Progress
// ===============================
router.get("/:id/progress", protect, getSwapProgress);

router.post(
    "/:id/progress/goals",
    protect,
    addLearningGoal
);

router.patch(
    "/:id/progress/goals/:goalId",
    protect,
    updateLearningGoal
);

router.post(
    "/:id/progress/session-logs",
    protect,
    addSessionLog
);

router.patch(
    "/:id/progress/session-logs/:logId",
    protect,
    updateSessionLog
);

module.exports = router;

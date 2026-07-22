const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
    sendRequest,
    getMyRequests,
    acceptRequest,
    rejectRequest,
    completeSwap
} = require("../controllers/swapController");

router.post("/send", protect, sendRequest);

// Fixed: Supports both /my and /my-requests endpoints for backwards compatibility
router.get("/my", protect, getMyRequests);
router.get("/my-requests", protect, getMyRequests);

// Fixed: Supports both /:id/accept and /accept/:id URL formats
router.put("/:id/accept", protect, acceptRequest);
router.put("/accept/:id", protect, acceptRequest);

router.put("/:id/reject", protect, rejectRequest);
router.put("/reject/:id", protect, rejectRequest);

router.put("/:id/complete", protect, completeSwap);
router.put("/complete/:id", protect, completeSwap);

module.exports = router;
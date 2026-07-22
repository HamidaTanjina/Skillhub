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

// ===========================
// Send Request
// ===========================

router.post(

    "/send",

    protect,

    sendRequest

);

// ===========================
// Get My Requests
// ===========================

router.get(

    "/my",

    protect,

    getMyRequests

);

// ===========================
// Accept Request
// ===========================

router.put(

    "/:id/accept",

    protect,

    acceptRequest

);

// ===========================
// Reject Request
// ===========================

router.put(

    "/:id/reject",

    protect,

    rejectRequest

);

// ===========================
// Complete Swap
// ===========================

router.put(

    "/:id/complete",

    protect,

    completeSwap

);

module.exports = router;

const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const reviewController = require("../controllers/reviewController");

// ======================================
// Submit Review
// ======================================

router.post(
    "/",
    auth,
    reviewController.submitReview
);

// ======================================
// Get Reviews of a User
// ======================================

router.get(
    "/user/:userId",
    reviewController.getUserReviews
);

// ======================================
// Get Reviews of a Swap
// ======================================

router.get(
    "/swap/:swapId",
    reviewController.getSwapReviews
);

module.exports = router;
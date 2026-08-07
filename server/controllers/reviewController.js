const mongoose = require("mongoose");
const Review = require("../models/Review");
const Swap = require("../models/swapRequest");

// ======================================
// Submit Review
// ======================================

exports.submitReview = async (req, res) => {

    try {

        const {
            swapId,
            rating,
            comment,
            recommend
        } = req.body;

        const userId = req.user.id;

        // --------------------------------------
        // Validate required fields
        // --------------------------------------

        if (!swapId || !rating || !comment) {

            return res.status(400).json({
                message: "Swap ID, rating and comment are required."
            });

        }

        // --------------------------------------
        // Validate ObjectId
        // --------------------------------------

        if (!mongoose.Types.ObjectId.isValid(swapId)) {

            return res.status(400).json({
                message: "Invalid swap ID."
            });

        }

        // --------------------------------------
        // Find swap
        // --------------------------------------

        const swap = await Swap.findById(swapId);

        if (!swap) {

            return res.status(404).json({
                message: "Swap not found."
            });

        }

        // --------------------------------------
        // Review not allowed after completion
        // --------------------------------------

        if (swap.status === "Completed") {

            return res.status(400).json({
                message: "This swap has already been completed."
            });

        }

        // --------------------------------------
        // Review allowed only for these statuses
        // --------------------------------------

        if (
            swap.status !== "Accepted" &&
            swap.status !== "Pending Confirmation"
        ) {

            return res.status(400).json({
                message: "This swap cannot be reviewed."
            });

        }

        // --------------------------------------
        // User must belong to swap
        // --------------------------------------

        if (
            swap.sender.toString() !== userId.toString() &&
            swap.receiver.toString() !== userId.toString()
        ) {

            return res.status(403).json({
                message: "Unauthorized."
            });

        }

        // --------------------------------------
        // Validate rating
        // --------------------------------------

        if (Number(rating) < 1 || Number(rating) > 5) {

            return res.status(400).json({
                message: "Rating must be between 1 and 5."
            });

        }

        // --------------------------------------
        // Prevent duplicate review
        // --------------------------------------

        const existingReview = await Review.findOne({
            swap: swapId,
            reviewer: userId
        });

        if (existingReview) {

            return res.status(400).json({
                message: "You have already submitted a review."
            });

        }

        // --------------------------------------
        // Determine review target
        // --------------------------------------

        const reviewFor =
            swap.sender.toString() === userId.toString()
                ? swap.receiver
                : swap.sender;

        // --------------------------------------
        // Create review
        // --------------------------------------

        const review = await Review.create({

            swap: swapId,

            reviewer: userId,

            reviewFor,

            rating: Number(rating),

            comment: comment.trim(),

            recommend: Boolean(recommend)

        });

        // --------------------------------------
        // Update completion information
        // --------------------------------------

        if (swap.sender.toString() === userId.toString()) {

            swap.senderCompleted = true;

            swap.senderRating = Number(rating);

            swap.senderReview = comment.trim();

        } else {

            swap.receiverCompleted = true;

            swap.receiverRating = Number(rating);

            swap.receiverReview = comment.trim();

        }

        // --------------------------------------
        // Check whether both users completed review
        // --------------------------------------

        if (
            swap.senderCompleted &&
            swap.receiverCompleted
        ) {

            swap.status = "Completed";

        } else {

            swap.status = "Pending Confirmation";

        }

        // --------------------------------------
        // Save swap
        // --------------------------------------

        await swap.save();

        // --------------------------------------
        // Response
        // --------------------------------------

        return res.status(201).json({

            message:
                swap.status === "Completed"
                    ? "Swap completed successfully."
                    : "Review submitted successfully. Waiting for your partner's review.",

            status: swap.status,

            review

        });

    }

    catch (error) {

        console.error("SUBMIT REVIEW ERROR:", error);

        return res.status(500).json({

            message: "Unable to submit review.",

            error: error.message

        });

    }

};


// ======================================
// Get Reviews of a User
// ======================================

exports.getUserReviews = async (req, res) => {

    try {

        const userId = req.params.userId;

        // --------------------------------------
        // Validate User ID
        // --------------------------------------

        if (!mongoose.Types.ObjectId.isValid(userId)) {

            return res.status(400).json({

                message: "Invalid user ID."

            });

        }

        // --------------------------------------
        // Find reviews
        // --------------------------------------

        const reviews = await Review.find({

            reviewFor: userId

        })

        .populate("reviewer", "name")

        .sort({
            createdAt: -1
        });

        return res.json(reviews);

    }

    catch (error) {

        console.error("GET USER REVIEWS ERROR:", error);

        return res.status(500).json({

            message: "Unable to get user reviews."

        });

    }

};


// ======================================
// Get Reviews of One Swap
// ======================================

exports.getSwapReviews = async (req, res) => {

    try {

        const swapId = req.params.swapId;

        // --------------------------------------
        // Validate Swap ID
        // --------------------------------------

        if (!mongoose.Types.ObjectId.isValid(swapId)) {

            return res.status(400).json({

                message: "Invalid swap ID."

            });

        }

        // --------------------------------------
        // Find reviews
        // --------------------------------------

        const reviews = await Review.find({

            swap: swapId

        })

        .populate("reviewer", "name")

        .populate("reviewFor", "name")

        .sort({
            createdAt: -1
        });

        return res.json(reviews);

    }

    catch (error) {

        console.error("GET SWAP REVIEWS ERROR:", error);

        return res.status(500).json({

            message: "Unable to get swap reviews."

        });

    }

};
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

        // Check swap exists
        const swap = await Swap.findById(swapId);

        if (!swap) {

            return res.status(404).json({
                message: "Swap not found."
            });

        }

        // Swap must be completed
        if (swap.status !== "Completed") {

            return res.status(400).json({
                message: "You can review only after the swap is completed."
            });

        }

        // User must belong to swap
        if (
            swap.sender.toString() !== userId &&
            swap.receiver.toString() !== userId
        ) {

            return res.status(403).json({
                message: "Unauthorized."
            });

        }

        // Prevent duplicate review
        const existingReview = await Review.findOne({

            swap: swapId,
            reviewer: userId

        });

        if (existingReview) {

            return res.status(400).json({
                message: "You have already submitted a review."
            });

        }

        // Find partner
        const reviewFor =

            swap.sender.toString() === userId
                ? swap.receiver
                : swap.sender;

        // Save review
        const review = await Review.create({

            swap: swapId,
            reviewer: userId,
            reviewFor,
            rating,
            comment,
            recommend

        });

        res.status(201).json({

            message: "Review submitted successfully.",
            review

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Server Error"

        });

    }

};

// ======================================
// Get Reviews of a User
// ======================================

exports.getUserReviews = async (req, res) => {

    try {

        const reviews = await Review.find({

            reviewFor: req.params.userId

        })

        .populate("reviewer", "name")

        .sort({

            createdAt: -1

        });

        res.json(reviews);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Server Error"

        });

    }

};

// ======================================
// Get Reviews of One Swap
// ======================================

exports.getSwapReviews = async (req, res) => {

    try {

        const reviews = await Review.find({

            swap: req.params.swapId

        })

        .populate("reviewer", "name")
        .populate("reviewFor", "name");

        res.json(reviews);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Server Error"

        });

    }

};
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

        const swap = await Swap.findById(swapId);

        if (!swap) {
            return res.status(404).json({
                message: "Swap not found."
            });
        }

      // Review allowed only before completion
if (swap.status === "Completed") {
    return res.status(400).json({
        message: "This swap has already been completed."
    });
}

if (
    swap.status !== "Accepted" &&
    swap.status !== "Pending Confirmation"
) {
    return res.status(400).json({
        message: "This swap cannot be reviewed."
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

        // Determine partner
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

        // ======================================
        // Sender submitted review
        // ======================================

        if (swap.sender.toString() === userId) {

            swap.senderCompleted = true;
            swap.senderRating = rating;
            swap.senderReview = comment;

        }

        // ======================================
        // Receiver submitted review
        // ======================================

        else {

            swap.receiverCompleted = true;
            swap.receiverRating = rating;
            swap.receiverReview = comment;

        }

        // ======================================
        // Update Status
        // ======================================

     // Both users reviewed
if (swap.senderCompleted && swap.receiverCompleted) {

    swap.status = "Completed";

    await swap.save();

    return res.status(201).json({

        message: "Swap completed successfully.",

        status: "Completed",

        review

    });

}

// First review submitted
swap.status = "Pending Confirmation";

await swap.save();

return res.status(201).json({

    message: "Review submitted successfully. Waiting for your partner's review.",

    status: "Pending Confirmation",

    review

});

    }

    catch (error) {
    console.error(error);

    res.status(500).json({
        message: error.message,
        stack: error.stack
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
        message: error.message,
        stack: error.stack
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
        message: error.message,
        stack: error.stack
    });
}

};
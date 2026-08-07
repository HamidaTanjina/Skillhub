const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
{
    swap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SwapRequest",
        required: true
    },

    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    reviewFor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },

    recommend: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
}
);

// One review per user per swap
reviewSchema.index(
    { swap: 1, reviewer: 1 },
    { unique: true }
);

module.exports = mongoose.model("Review", reviewSchema);
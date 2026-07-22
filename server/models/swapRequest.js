const mongoose = require("mongoose");

const SwapRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    teachSkill: {
        type: String,
        required: true
    },
    learnSkill: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected", "Completed"],
        default: "Pending"
    },
    senderCompleted: {
        type: Boolean,
        default: false
    },
    receiverCompleted: {
        type: Boolean,
        default: false
    },
    senderReview: {
        type: String,
        default: ""
    },
    receiverReview: {
        type: String,
        default: ""
    },
    senderRating: {
        type: Number,
        default: 0
    },
    receiverRating: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("SwapRequest", SwapRequestSchema);
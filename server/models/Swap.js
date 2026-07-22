const mongoose = require("mongoose");

const SwapSchema = new mongoose.Schema({

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

    senderTeachSkill: {

        type: String,

        required: true

    },

    senderLearnSkill: {

        type: String,

        required: true

    },

    status: {

        type: String,

        enum: [

            "Pending",

            "Accepted",

            "Completed",

            "Rejected"

        ],

        default: "Pending"

    },

    // =========================
    // Completion Status
    // =========================

    senderCompleted: {

        type: Boolean,

        default: false

    },

    receiverCompleted: {

        type: Boolean,

        default: false

    },

    // =========================
    // Reviews
    // =========================

    senderReview: {

        type: String,

        default: ""

    },

    receiverReview: {

        type: String,

        default: ""

    },

    // =========================
    // Ratings
    // =========================

    senderRating: {

        type: Number,

        default: 0

    },

    receiverRating: {

        type: Number,

        default: 0

    }

},{

    timestamps:true

});

module.exports = mongoose.model("Swap", SwapSchema);


const mongoose = require("mongoose");

const swapSessionSchema = new mongoose.Schema(
    {
        swapRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SwapRequest",
            required: true,
            index: true
        },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        description: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        },

        startTime: {
            type: Date,
            required: true
        },

        endTime: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["Scheduled", "Cancelled", "Completed"],
            default: "Scheduled",
            index: true
        },

        cancellationReason: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        reminderSentAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Reject sessions where the end time is not after the start time.
swapSessionSchema.pre("validate", function () {
    if (
        this.startTime &&
        this.endTime &&
        this.endTime <= this.startTime
    ) {
        this.invalidate(
            "endTime",
            "Session end time must be after start time."
        );
    }
});

module.exports = mongoose.model("SwapSession", swapSessionSchema);

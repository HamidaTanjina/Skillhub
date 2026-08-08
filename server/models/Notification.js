const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: [
                "swap_request",
                "swap_accepted",
                "swap_rejected",
                "new_message"
            ],
            required: true
        },

        message: {
            type: String,
            required: true
        },

        swapId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SwapRequest",
            default: null
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model("Notification", NotificationSchema);
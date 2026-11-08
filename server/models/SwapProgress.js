
const mongoose = require("mongoose");

const LearningGoalSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        description: {
            type: String,
            default: "",
            maxlength: 1000
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

const SessionLogSchema = new mongoose.Schema(
    {
        session: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SwapSession",
            default: null
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        notes: {
            type: String,
            default: "",
            maxlength: 2000
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        completedAt: {
            type: Date,
            default: null
        },
        sessionDate: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

const SwapProgressSchema = new mongoose.Schema(
    {
        swapRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SwapRequest",
            required: true,
            unique: true,
            index: true
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],
        goals: {
            type: [LearningGoalSchema],
            default: []
        },
        sessionLogs: {
            type: [SessionLogSchema],
            default: []
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "SwapProgress",
    SwapProgressSchema
);

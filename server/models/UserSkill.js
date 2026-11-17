const mongoose = require("mongoose");

const UserSkillSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    skillName: {
        type: String,
        required: true,
        trim: true
    },
    skillKey: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    skillType: {
        type: String,
        enum: ["teach", "learn"],
        default: "teach",
        required: true
    },
    verificationStatus: {
        type: String,
        enum: ["unverified", "pending", "verified", "rejected"],
        default: "unverified"
    },
    verificationMethod: {
        type: String,
        enum: ["certificate", "repository", "quiz"],
        default: null
    },
    evidenceUrl: {
        type: String,
        default: ""
    },
    quizScore: {
        type: Number,
        default: null
    },
    quizTotal: {
        type: Number,
        default: null
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    submittedAt: {
        type: Date,
        default: null
    },
    reviewerNote: {
        type: String,
        default: "",
        trim: true
    }
}, {
    timestamps: true
});

UserSkillSchema.index(
    { user: 1, skillKey: 1, skillType: 1 },
    { unique: true }
);

module.exports = mongoose.model("UserSkill", UserSkillSchema);

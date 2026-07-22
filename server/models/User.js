const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        default: "SkillHub Learner"
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: [true, "Password is required"]
    },

    teachSkills: {
        type: [String],
        default: []
    },

    learnSkills: {
        type: [String],
        default: []
    },

    category: {
        type: String,
        enum: ["Technology", "Design", "Business", "Language", "Cooking"],
        default: "Technology"
    },

    learnCategory: {
        type: String,
        enum: ["Technology", "Design", "Business", "Language", "Cooking"],
        default: "Technology"
    },

    profilePicture: {
        type: String,
        default: ""
    },

    bio: {
        type: String,
        default: ""
    },

    location: {
        type: String,
        default: ""
    },

    isOnline: {
        type: Boolean,
        default: false
    },

    rating: {
        type: Number,
        default: 0
    },

    totalReviews: {
        type: Number,
        default: 0
    },

    completedSwaps: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("User", UserSchema);
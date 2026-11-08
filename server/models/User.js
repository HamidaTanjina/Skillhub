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
    role: {
    type: String,
    enum: ["user", "reviewer", "admin"],
    default: "user"
},
isBanned: {
    type: Boolean,
    default: false
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

    // Optional matching signals. Existing users remain valid with defaults.
    skillLevels: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    yearsExperience: {
        type: Number,
        min: 0,
        default: null
    },
    availability: {
        type: [String],
        default: []
    },
    matchingPreferences: {
        type: [String],
        default: []
    },
    skillVerifications: {
        type: [{
            skillName: {
                type: String,
                required: true,
                trim: true
            },

            evidenceType: {
                type: String,
                enum: ["certificate", "repository"],
                required: true
            },

            evidenceUrl: {
                type: String,
                required: true,
                trim: true
            },

            status: {
                type: String,
                enum: ["pending", "verified", "rejected"],
                default: "pending"
            },

            submittedAt: {
                type: Date,
                default: Date.now
            },

            verifiedAt: {
                type: Date,
                default: null
            },

            verifiedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null
            },

            reviewerNote: {
                type: String,
                default: "",
                trim: true
            }
        }],
        default: []
    },
    completedSwaps: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("User", UserSchema);
const express = require("express");
const router = express.Router();

const {
    getProfile,
    updateProfile,
    saveSkills
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

// Get user profile
router.get("/profile", protect, getProfile);

// Update name, bio, location
router.put("/profile", protect, updateProfile);

// Update teach & learn skills
router.put("/skills", protect, saveSkills);

module.exports = router;
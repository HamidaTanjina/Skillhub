const express = require("express");
const router = express.Router();

const {
    getProfile,
    updateProfile,
    saveSkills,
    getAllUsers
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

// =========================
// Profile
// =========================

// Get user profile
router.get("/profile", protect, getProfile);

// Update name, bio, location
router.put("/profile", protect, updateProfile);

// Update teach & learn skills
router.put("/skills", protect, saveSkills);

// =========================
// Browse Skills
// =========================

// Get all users
router.get("/all", protect, getAllUsers);

module.exports = router;
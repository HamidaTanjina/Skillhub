const express = require("express");
const router = express.Router();

const {
    getProfile,
    updateProfile,
    saveSkills,
    getAllUsers
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/skills", protect, saveSkills);
router.get("/all", protect, getAllUsers);

module.exports = router;
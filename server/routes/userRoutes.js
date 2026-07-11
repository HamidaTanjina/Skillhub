const express = require("express");
const router = express.Router();

const { getProfile, saveSkills } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

router.get("/profile", protect, getProfile);

router.put("/skills", protect, saveSkills);

module.exports = router;
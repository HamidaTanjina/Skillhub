const express = require("express");
const router = express.Router();

const {
    getProfile,
    updateProfile,
    saveSkills,
    getAllUsers,
    getRecommendations,
    submitSkillVerification,
    getMySkillVerifications,
    reviewSkillVerification
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const reviewerOnly = require("../middleware/reviewerMiddleware");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/skills", protect, saveSkills);
router.get("/all", protect, getAllUsers);
router.get("/recommendations", protect, getRecommendations);
router.post(
    "/skills/verification",
    protect,
    submitSkillVerification
);

router.get(
    "/skills/verification",
    protect,
    getMySkillVerifications
);
router.patch(
    "/skills/verification/:userId/:verificationId",
    protect,
    reviewerOnly,
    reviewSkillVerification
);
module.exports = router;
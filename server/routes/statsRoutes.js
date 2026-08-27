const express = require("express");
const router = express.Router();

const User = require("../models/User");
const SwapRequest = require("../models/swapRequest");

router.get("/", async (req, res) => {
    try {
        // Total registered users
        const students = await User.countDocuments();

        // Collect unique skills from teachSkills + learnSkills
        const users = await User.find(
            {},
            {
                teachSkills: 1,
                learnSkills: 1
            }
        ).lean();

        const uniqueSkills = new Set();

        users.forEach((user) => {
            if (Array.isArray(user.teachSkills)) {
                user.teachSkills.forEach((skill) => {
                    if (typeof skill === "string" && skill.trim()) {
                        uniqueSkills.add(skill.trim().toLowerCase());
                    }
                });
            }

            if (Array.isArray(user.learnSkills)) {
                user.learnSkills.forEach((skill) => {
                    if (typeof skill === "string" && skill.trim()) {
                        uniqueSkills.add(skill.trim().toLowerCase());
                    }
                });
            }
        });

        const skills = uniqueSkills.size;

        // Successfully completed skill exchanges
        const matches = await SwapRequest.countDocuments({
            status: "Completed"
        });

        res.status(200).json({
            success: true,
            stats: {
                students,
                skills,
                matches
            }
        });

    } catch (error) {
        console.error("Stats Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load platform statistics."
        });
    }
});

module.exports = router;
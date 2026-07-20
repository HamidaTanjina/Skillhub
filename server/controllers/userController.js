const User = require("../models/User");

// =========================
// Get Profile
// =========================

exports.getProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user.id).select("-password");

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.json(user);

    }

    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// =========================
// Update Profile
// =========================

exports.updateProfile = async (req, res) => {

    try {

        const {

            name,
            bio,
            location

        } = req.body;

        const updateData = {};

        if (name !== undefined) {

            updateData.name = name;

        }

        if (bio !== undefined) {

            updateData.bio = bio;

        }

        if (location !== undefined) {

            updateData.location = location;

        }

        const user = await User.findByIdAndUpdate(

            req.user.id,

            updateData,

            {
                new: true
            }

        ).select("-password");

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.json(user);

    }

    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// =========================
// Save Skills
// =========================

exports.saveSkills = async (req, res) => {

    try {

        const {

            teachSkills,
            learnSkills,
            category

        } = req.body;

        const updateData = {};

        if (teachSkills !== undefined) {

            updateData.teachSkills = teachSkills;

        }

        if (learnSkills !== undefined) {

            updateData.learnSkills = learnSkills;

        }

        if (category !== undefined) {

            updateData.category = category;

        }

        const user = await User.findByIdAndUpdate(

            req.user.id,

            updateData,

            {
                new: true
            }

        ).select("-password");

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.json(user);

    }

    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// =========================
// Get All Users
// =========================

exports.getAllUsers = async (req, res) => {

    try {

        const users = await User.find({}, "-password");

        res.json(users);

    }

    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
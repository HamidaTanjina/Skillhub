const User = require("../models/User");

// =========================
// Get Profile
// =========================

exports.getProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user.id).select("-password");

        res.json(user);

    } catch (err) {

        res.status(500).json({
            message: err.message
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
            location,
            teachSkills,
            learnSkills

        } = req.body;

        const user = await User.findByIdAndUpdate(

            req.user.id,

            {

                name,
                bio,
                location,
                teachSkills,
                learnSkills

            },

            {

                new: true

            }

        ).select("-password");

        res.json(user);

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};
const User = require("../models/User");

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, location } = req.body;
        const updateData = {};

        if (name !== undefined && name.trim() !== "") {
            updateData.name = name.trim();
        }

        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.saveSkills = async (req, res) => {
    try {
        const { teachSkills, learnSkills, category, learnCategory } = req.body;
        const updateData = {};

        if (teachSkills !== undefined) updateData.teachSkills = Array.isArray(teachSkills) ? teachSkills : [];
        if (learnSkills !== undefined) updateData.learnSkills = Array.isArray(learnSkills) ? learnSkills : [];
        if (category !== undefined) updateData.category = category;
        if (learnCategory !== undefined) updateData.learnCategory = learnCategory;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const currentUserId = req.user ? req.user.id : null;
        const query = currentUserId ? { _id: { $ne: currentUserId } } : {};

        const users = await User.find(query, "-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
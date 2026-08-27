const User = require("../models/User");
const Review = require("../models/Review");
exports.getProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user.id)
            .select("-password")
            .lean();

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        // ==========================================
        // GET USER RATING + REVIEW COUNT
        // ==========================================

        const reviewStats = await Review.aggregate([
            {
                $match: {
                    reviewFor: user._id
                }
            },

            {
                $group: {
                    _id: "$reviewFor",

                    averageRating: {
                        $avg: "$rating"
                    },

                    totalReviews: {
                        $sum: 1
                    }
                }
            }
        ]);


        const stats = reviewStats[0] || {
            averageRating: 0,
            totalReviews: 0
        };


        // ==========================================
        // RETURN USER + RATING INFORMATION
        // ==========================================

        res.json({

            ...user,

            rating: Number(
                stats.averageRating.toFixed(1)
            ),

            totalReviews:
                stats.totalReviews

        });


    } catch (error) {

        console.error(
            "Get Profile Error:",
            error
        );

        res.status(500).json({
            message: error.message
        });

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

        const query = currentUserId
            ? { _id: { $ne: currentUserId } }
            : {};

        const users = await User.find(query, "-password").lean();

        // Get rating information for all users
        const userIds = users.map(user => user._id);

        const reviewStats = await Review.aggregate([
            {
                $match: {
                    reviewFor: { $in: userIds }
                }
            },
            {
                $group: {
                    _id: "$reviewFor",

                    averageRating: {
                        $avg: "$rating"
                    },

                    totalReviews: {
                        $sum: 1
                    }
                }
            }
        ]);

        // Convert stats into easy lookup object
        const statsMap = {};

        reviewStats.forEach(stat => {

            statsMap[stat._id.toString()] = {
                rating: Number(stat.averageRating.toFixed(1)),
                totalReviews: stat.totalReviews
            };

        });

        // Add rating information to every user
        const usersWithRatings = users.map(user => {

            const stats =
                statsMap[user._id.toString()] || {
                    rating: 0,
                    totalReviews: 0
                };

            return {
                ...user,

                rating: stats.rating,

                totalReviews: stats.totalReviews
            };

        });

        res.json(usersWithRatings);

    } catch (error) {

        console.error("Get All Users Error:", error);

        res.status(500).json({
            message: error.message
        });

    }
};
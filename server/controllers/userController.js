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
        const {
            name,
            bio,
            location,
            skillLevels,
            yearsExperience,
            availability,
            matchingPreferences
        } = req.body;

        const updateData = {};

        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({
                    message: "Name cannot be empty."
                });
            }
            updateData.name = name.trim();
        }

        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;

        // Validate skill levels: skill name -> level from 1 to 5
        if (skillLevels !== undefined) {
            if (
                !skillLevels ||
                typeof skillLevels !== "object" ||
                Array.isArray(skillLevels)
            ) {
                return res.status(400).json({
                    message: "skillLevels must be an object."
                });
            }

            const cleanedLevels = {};

            for (const [skill, level] of Object.entries(skillLevels)) {
                const value = Number(level);

                if (
                    !skill.trim() ||
                    !Number.isInteger(value) ||
                    value < 1 ||
                    value > 3
                ) {
                    return res.status(400).json({
                        message: "Each skill level must be an integer from 1 to 3."
                    });
                }

                cleanedLevels[skill.trim().toLowerCase()] = value;
            }

            updateData.skillLevels = cleanedLevels;
        }

        // Validate years of experience
        if (yearsExperience !== undefined) {
            const years = Number(yearsExperience);

            if (!Number.isFinite(years) || years < 0 || years > 80) {
                return res.status(400).json({
                    message: "Years of experience must be between 0 and 80."
                });
            }

            updateData.yearsExperience = years;
        }

        // Validate availability and matching preferences
        for (const field of ["availability", "matchingPreferences"]) {
            if (req.body[field] !== undefined) {
                const value = req.body[field];

                if (
                    !Array.isArray(value) ||
                    !value.every(
                        item => typeof item === "string" && item.trim()
                    )
                ) {
                    return res.status(400).json({
                        message: `${field} must be an array of non-empty strings.`
                    });
                }

                updateData[field] = [
                    ...new Set(value.map(item => item.trim().toLowerCase()))
                ];
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);
    } catch (error) {
        console.error("Update Profile Error:", error);

        res.status(500).json({
            message: error.message
        });
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

// Weighted partner recommendations. Scores are calculated on the server so
// the browser cannot alter ranking logic. Missing optional signals are neutral.

exports.getRecommendations = async (req, res) => {
    try {
        console.log("TEST: NEW CODE IS RUNNING");
        const currentUser = await User.findById(req.user.id)
            .select("-password")
            .lean();

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

       const candidates = await User.aggregate([
    {
        $match: {
            _id: { $ne: currentUser._id },
            isBanned: { $ne: true },
            role: "user"
        }
    },
    {
        $project: {
            password: 0
        }
    }
]);

        const ids = candidates.map(user => user._id);

        const stats = await Review.aggregate([
            { $match: { reviewFor: { $in: ids } } },
            {
                $group: {
                    _id: "$reviewFor",
                    rating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                    clarity: { $avg: "$categoryRatings.clarity" },
                    expertise: { $avg: "$categoryRatings.expertise" },
                    punctuality: { $avg: "$categoryRatings.punctuality" }
                }
            }
        ]);

        const statsMap = new Map(
            stats.map(stat => [String(stat._id), stat])
        );

        const norm = value =>
            String(value ?? "").trim().toLowerCase();

        const skills = list =>
            new Set(
                (Array.isArray(list) ? list : [])
                    .map(norm)
                    .filter(Boolean)
            );

        const overlap = (a, b) =>
            [...a].filter(value => b.has(value));

        const jaccard = (a, b) => {
            const union = new Set([...a, ...b]);
            return union.size
                ? overlap(a, b).length / union.size
                : 0;
        };

        // Normalize skill-level keys, e.g. HTML and html.
        const normalizeLevels = levels =>
            Object.fromEntries(
                Object.entries(
                    levels && typeof levels === "object" ? levels : {}
                ).map(([key, value]) => [norm(key), value])
            );

        const myTeach = skills(currentUser.teachSkills);
        const myLearn = skills(currentUser.learnSkills);
        const myAvailability = skills(currentUser.availability);
        const myPreferences = skills(currentUser.matchingPreferences);
        const myLevels = normalizeLevels(currentUser.skillLevels);

        const results = candidates.map(user => {
            const teach = skills(user.teachSkills);
            const learn = skills(user.learnSkills);

            const teachMatch = overlap(myLearn, teach);
            const learnMatch = overlap(myTeach, learn);

            const mutualScore =
                (jaccard(myLearn, teach) + jaccard(myTeach, learn)) / 2;

            const userLevels = normalizeLevels(user.skillLevels);

            const matchedLevels = [...new Set([
                ...teachMatch,
                ...learnMatch
            ])].map(skill => {
                const mine = Number(myLevels[skill]);
                const theirs = Number(userLevels[skill]);

                if (
                    myLevels[skill] == null ||
                    userLevels[skill] == null ||
                    !Number.isFinite(mine) ||
                    !Number.isFinite(theirs)
                ) {
                    return null;
                }

               return 1 - Math.min(Math.abs(mine - theirs) / 2, 1);
            }).filter(value => value !== null);

            const levelScore = matchedLevels.length
                ? matchedLevels.reduce((sum, value) => sum + value, 0)
                    / matchedLevels.length
                : 0.5;

            // Missing experience is neutral, not zero.
            // Compare experience compatibility between both users.
const myExperience = Number(currentUser.yearsExperience);
const theirExperience = Number(user.yearsExperience);

const hasMyExperience =
    currentUser.yearsExperience != null &&
    Number.isFinite(myExperience);

const hasTheirExperience =
    user.yearsExperience != null &&
    Number.isFinite(theirExperience);

const experienceScore =
    hasMyExperience && hasTheirExperience
        ? 1 - Math.min(
            Math.abs(myExperience - theirExperience) / 10,
            1
        )
        : 0.5;
          
            // No reviews means neutral. An actual rating of zero stays zero.
           // Normalize ratings to a 0–1 scale.
          const stat = statsMap.get(String(user._id)) || {};

const overallRatingScore = stat.rating == null
    ? null
    : Math.min(Math.max(Number(stat.rating) / 5, 0), 1);

const categoryValues = [
    stat.clarity,
    stat.expertise,
    stat.punctuality
]
    .filter(value =>
        value != null && Number.isFinite(Number(value))
    )
    .map(value =>
        Math.min(Math.max(Number(value) / 5, 0), 1)
    );

const categoryRatingScore = categoryValues.length
    ? categoryValues.reduce((sum, value) => sum + value, 0)
        / categoryValues.length
    : null;

// Combine overall and category ratings when both are available.
let ratingScore;

if (
    overallRatingScore !== null &&
    categoryRatingScore !== null
) {
    ratingScore =
        0.4 * overallRatingScore +
        0.6 * categoryRatingScore;
} else if (overallRatingScore !== null) {
    ratingScore = overallRatingScore;
} else if (categoryRatingScore !== null) {
    ratingScore = categoryRatingScore;
} else {
    // No rating data: remain neutral.
    ratingScore = 0.5;
}

            const availability = skills(user.availability);
            const availabilityScore =
                myAvailability.size && availability.size
                    ? jaccard(myAvailability, availability)
                    : 0.5;

            const preferences = skills(user.matchingPreferences);
            const preferenceScore =
                myPreferences.size && preferences.size
                    ? jaccard(myPreferences, preferences)
                    : 0.5;

          const scoreBreakdown = {
    mutualSkills: Number((50 * mutualScore).toFixed(2)),
    skillLevel: Number((15 * levelScore).toFixed(2)),
    experience: Number((10 * experienceScore).toFixed(2)),
    rating: Number((10 * ratingScore).toFixed(2)),
    availability: Number((7.5 * availabilityScore).toFixed(2)),
    preferences: Number((7.5 * preferenceScore).toFixed(2))
};

const score = Object.values(scoreBreakdown)
    .reduce((sum, value) => sum + value, 0);

           return {
    user: {
        ...user,
        rating: stat.rating == null
            ? 0
            : Number(stat.rating.toFixed(1)),
        totalReviews: stat.totalReviews || 0,
        categoryRatings: {
            clarity: stat.clarity == null
                ? null : Number(stat.clarity.toFixed(1)),
            expertise: stat.expertise == null
                ? null : Number(stat.expertise.toFixed(1)),
            punctuality: stat.punctuality == null
                ? null : Number(stat.punctuality.toFixed(1))
        }
    },

    score: Number(score.toFixed(1)),

    scoreBreakdown,

    teachMatch,
    learnMatch
};
        })
        // Keep only candidates who can exchange skills in both directions.
        .filter(item =>
            item.teachMatch.length > 0 &&
            item.learnMatch.length > 0
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

        return res.json(results);
    } catch (error) {
        console.error("Get Recommendations Error:", error);
        return res.status(500).json({
            message: "Unable to generate recommendations."
        });
    }
};

/* =========================================
   SKILL VERIFICATION
========================================= */

// Submit evidence for a skill
exports.submitSkillVerification = async (req, res) => {
    try {
        const { skillName, evidenceType, evidenceUrl } = req.body;

        if (!skillName || !skillName.trim()) {
            return res.status(400).json({
                message: "Skill name is required."
            });
        }

        if (!["certificate", "repository"].includes(evidenceType)) {
            return res.status(400).json({
                message: "Evidence type must be certificate or repository."
            });
        }

        if (!evidenceUrl || !/^https?:\/\/\S+$/i.test(evidenceUrl.trim())) {
            return res.status(400).json({
                message: "Please provide a valid HTTP or HTTPS evidence URL."
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const normalizedSkill = skillName.trim();

        const teachesSkill = (user.teachSkills || []).some(
            skill => skill.toLowerCase() === normalizedSkill.toLowerCase()
        );

        if (!teachesSkill) {
            return res.status(400).json({
                message: "You can submit verification only for a skill in your teaching skills."
            });
        }

        const alreadyPending = user.skillVerifications.some(
            item =>
                item.skillName.toLowerCase() === normalizedSkill.toLowerCase() &&
                item.status === "pending"
        );

        if (alreadyPending) {
            return res.status(409).json({
                message: "This skill already has a pending verification."
            });
        }

        user.skillVerifications.push({
            skillName: normalizedSkill,
            evidenceType,
            evidenceUrl: evidenceUrl.trim(),
            status: "pending"
        });

        await user.save();

        const submitted = user.skillVerifications[
            user.skillVerifications.length - 1
        ];

        return res.status(201).json({
            message: "Skill evidence submitted for review.",
            verification: submitted
        });

    } catch (error) {
        console.error("Submit Skill Verification Error:", error);
        return res.status(500).json({
            message: "Could not submit skill evidence."
        });
    }
};


// View your own skill verification submissions
exports.getMySkillVerifications = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("skillVerifications");

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        return res.json({
            verifications: user.skillVerifications || []
        });

    } catch (error) {
        console.error("Get Skill Verifications Error:", error);
        return res.status(500).json({
            message: "Could not retrieve skill verification submissions."
        });
    }
};

/* =========================================
   REVIEW SKILL VERIFICATION
========================================= */

exports.reviewSkillVerification = async (req, res) => {
    try {
        const { userId, verificationId } = req.params;
        const { status, reviewerNote = "" } = req.body;

        if (!["verified", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be verified or rejected."
            });
        }

        if (
            typeof reviewerNote !== "string" ||
            reviewerNote.length > 500
        ) {
            return res.status(400).json({
                message: "Reviewer note must be text with at most 500 characters."
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User account not found."
            });
        }

        const verification = user.skillVerifications.id(verificationId);

        if (!verification) {
            return res.status(404).json({
                message: "Skill verification submission not found."
            });
        }

        if (verification.status !== "pending") {
            return res.status(409).json({
                message: "This submission has already been reviewed."
            });
        }

        verification.status = status;
        verification.reviewerNote = reviewerNote.trim();
        verification.verifiedAt =
            status === "verified" ? new Date() : null;
        verification.verifiedBy = req.reviewer._id;

        await user.save();

        return res.json({
            message: `Skill evidence ${status} successfully.`,
            verification
        });

    } catch (error) {
        console.error("Review Skill Verification Error:", error);

        return res.status(500).json({
            message: "Could not review skill evidence."
        });
    }
};


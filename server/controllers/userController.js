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
        const currentUser = await User.findById(req.user.id)
            .select("-password")
            .lean();

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Normalize the current user's values.
        const norm = value =>
            String(value ?? "").trim().toLowerCase();

        const normalizeList = list =>
            [...new Set(
                (Array.isArray(list) ? list : [])
                    .map(norm)
                    .filter(Boolean)
            )];

        const normalizeLevels = levels =>
            Object.fromEntries(
                Object.entries(
                    levels && typeof levels === "object" ? levels : {}
                ).map(([key, value]) => [norm(key), value])
            );

        const myTeach = normalizeList(currentUser.teachSkills);
        const myLearn = normalizeList(currentUser.learnSkills);
        const myAvailability = normalizeList(currentUser.availability);
        const myPreferences = normalizeList(currentUser.matchingPreferences);
        const myLevels = normalizeLevels(currentUser.skillLevels);

        const myExperience = currentUser.yearsExperience;

        // Calculate Jaccard similarity inside MongoDB.
        const jaccardExpr = (left, right) => ({
            $let: {
                vars: {
                    intersection: {
                        $size: { $setIntersection: [left, right] }
                    },
                    union: {
                        $size: { $setUnion: [left, right] }
                    }
                },
                in: {
                    $cond: [
                        { $gt: ["$$union", 0] },
                        { $divide: ["$$intersection", "$$union"] },
                        0
                    ]
                }
            }
        });

        const pipeline = [
            // 1. Find eligible users.
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
            },

            // 2. Normalize candidate skill arrays.
            {
                $set: {
                    _teachSkills: {
                        $setUnion: [{
                            $map: {
                                input: { $ifNull: ["$teachSkills", []] },
                                as: "s",
                                in: {
                                    $toLower: {
                                        $trim: {
                                            input: { $toString: "$$s" }
                                        }
                                    }
                                }
                            }
                        }, []]
                    },
                    _learnSkills: {
                        $setUnion: [{
                            $map: {
                                input: { $ifNull: ["$learnSkills", []] },
                                as: "s",
                                in: {
                                    $toLower: {
                                        $trim: {
                                            input: { $toString: "$$s" }
                                        }
                                    }
                                }
                            }
                        }, []]
                    },
                    _availability: {
                        $setUnion: [{
                            $map: {
                                input: { $ifNull: ["$availability", []] },
                                as: "s",
                                in: {
                                    $toLower: {
                                        $trim: { input: "$$s" }
                                    }
                                }
                            }
                        }, []]
                    },
                    _preferences: {
                        $setUnion: [{
                            $map: {
                                input: {
                                    $ifNull: ["$matchingPreferences", []]
                                },
                                as: "s",
                                in: {
                                    $toLower: {
                                        $trim: { input: "$$s" }
                                    }
                                }
                            }
                        }, []]
                    }
                }
            },

            // 3. Find mutual skill matches.
            {
                $set: {
                    _teachMatch: {
                        $setIntersection: [
                            { $literal: myLearn },
                            "$_teachSkills"
                        ]
                    },
                    _learnMatch: {
                        $setIntersection: [
                            { $literal: myTeach },
                            "$_learnSkills"
                        ]
                    }
                }
            },

            // Only keep users who can exchange skills both ways.
            {
                $match: {
                    "_teachMatch.0": { $exists: true },
                    "_learnMatch.0": { $exists: true }
                }
            },

            // 4. Calculate mutual skill similarity.
            {
                $set: {
                    _mutualScore: {
                        $avg: [
                            jaccardExpr(
                                { $literal: myLearn },
                                "$_teachSkills"
                            ),
                            jaccardExpr(
                                { $literal: myTeach },
                                "$_learnSkills"
                            )
                        ]
                    },
                    _matchedSkills: {
                        $setUnion: ["$_teachMatch", "$_learnMatch"]
                    }
                }
            },

            // 5. Compare skill levels.
            {
                $set: {
                    _levelScores: {
                        $map: {
                            input: "$_matchedSkills",
                            as: "skill",
                            in: {
                                $let: {
                                    vars: {
                                        mine: {
                                            $convert: {
                                                input: {
                                                    $arrayElemAt: [{
                                                        $map: {
                                                            input: {
                                                                $filter: {
                                                                    input: {
                                                                        $objectToArray: {
                                                                            $literal: myLevels
                                                                        }
                                                                    },
                                                                    as: "entry",
                                                                    cond: {
                                                                        $eq: [
                                                                            "$$entry.k",
                                                                            "$$skill"
                                                                        ]
                                                                    }
                                                                }
                                                            },
                                                            as: "entry",
                                                            in: "$$entry.v"
                                                        }
                                                    }, 0]
                                                },
                                                to: "double",
                                                onError: null,
                                                onNull: null
                                            }
                                        },
                                        theirs: {
                                            $convert: {
                                                input: {
                                                    $arrayElemAt: [{
                                                        $map: {
                                                            input: {
                                                                $filter: {
                                                                    input: {
                                                                        $objectToArray: {
                                                                            $ifNull: [
                                                                                "$skillLevels",
                                                                                {}
                                                                            ]
                                                                        }
                                                                    },
                                                                    as: "entry",
                                                                    cond: {
                                                                        $eq: [
                                                                            { $toLower: "$$entry.k" },
                                                                            "$$skill"
                                                                        ]
                                                                    }
                                                                }
                                                            },
                                                            as: "entry",
                                                            in: "$$entry.v"
                                                        }
                                                    }, 0]
                                                },
                                                to: "double",
                                                onError: null,
                                                onNull: null
                                            }
                                        }
                                    },
                                    in: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $ne: ["$$mine", null] },
                                                    { $ne: ["$$theirs", null] }
                                                ]
                                            },
                                            {
                                                $subtract: [
                                                    1,
                                                    {
                                                        $min: [
                                                            {
                                                                $divide: [
                                                                    {
                                                                        $abs: {
                                                                            $subtract: [
                                                                                "$$mine",
                                                                                "$$theirs"
                                                                            ]
                                                                        }
                                                                    },
                                                                    2
                                                                ]
                                                            },
                                                            1
                                                        ]
                                                    }
                                                ]
                                            },
                                            null
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $set: {
                    _validLevelScores: {
                        $filter: {
                            input: "$_levelScores",
                            as: "value",
                            cond: { $ne: ["$$value", null] }
                        }
                    }
                }
            },
            {
                $set: {
                    _levelScore: {
                        $cond: [
                            { $gt: [{ $size: "$_validLevelScores" }, 0] },
                            { $avg: "$_validLevelScores" },
                            0.5
                        ]
                    }
                }
            },

            // 6. Compare years of experience.
            {
                $set: {
                    _experienceScore: {
                        $cond: [
                            {
                                $and: [
                                    { $ne: [{ $literal: myExperience ?? null }, null] },
                                    { $ne: [{ $ifNull: ["$yearsExperience", null] }, null] }
                                ]
                            },
                            {
                                $subtract: [
                                    1,
                                    {
                                        $min: [
                                            {
                                                $divide: [
                                                    {
                                                        $abs: {
                                                            $subtract: [
                                                                { $literal: myExperience ?? 0 },
                                                                "$yearsExperience"
                                                            ]
                                                        }
                                                    },
                                                    10
                                                ]
                                            },
                                            1
                                        ]
                                    }
                                ]
                            },
                            0.5
                        ]
                    }
                }
            },

            // 7. Aggregate overall and category ratings.
            {
                $lookup: {
                    from: Review.collection.name,
                    let: { candidateId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$reviewFor", "$$candidateId"]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                rating: { $avg: "$rating" },
                                totalReviews: { $sum: 1 },
                                clarity: { $avg: "$categoryRatings.clarity" },
                                expertise: { $avg: "$categoryRatings.expertise" },
                                punctuality: { $avg: "$categoryRatings.punctuality" }
                            }
                        }
                    ],
                    as: "_reviewStats"
                }
            },
            {
                $set: {
                    _reviewStats: {
                        $ifNull: [
                            { $arrayElemAt: ["$_reviewStats", 0] },
                            {
                                rating: null,
                                totalReviews: 0,
                                clarity: null,
                                expertise: null,
                                punctuality: null
                            }
                        ]
                    }
                }
            },
            {
                $set: {
                    _categoryValues: {
                        $filter: {
                            input: [
                                "$_reviewStats.clarity",
                                "$_reviewStats.expertise",
                                "$_reviewStats.punctuality"
                            ],
                            as: "value",
                            cond: { $ne: ["$$value", null] }
                        }
                    }
                }
            },
            {
                $set: {
                    _overallRatingScore: {
                        $cond: [
                            { $ne: ["$_reviewStats.rating", null] },
                            { $divide: ["$_reviewStats.rating", 5] },
                            null
                        ]
                    },
                   _categoryRatingScore: {
    $cond: [
        { $gt: [{ $size: "$_categoryValues" }, 0] },
        {
            $divide: [
                { $avg: "$_categoryValues" },
                3
            ]
        },
        null
    ]
}
                }
            },
            {
                $set: {
                    _ratingScore: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [
                                            { $ne: ["$_overallRatingScore", null] },
                                            { $ne: ["$_categoryRatingScore", null] }
                                        ]
                                    },
                                    then: {
                                        $add: [
                                            { $multiply: [0.4, "$_overallRatingScore"] },
                                            { $multiply: [0.6, "$_categoryRatingScore"] }
                                        ]
                                    }
                                },
                                {
                                    case: { $ne: ["$_overallRatingScore", null] },
                                    then: "$_overallRatingScore"
                                },
                                {
                                    case: { $ne: ["$_categoryRatingScore", null] },
                                    then: "$_categoryRatingScore"
                                }
                            ],
                            default: 0.5
                        }
                    }
                }
            },

            // 8. Availability and preference similarity.
            {
                $set: {
                    _availabilityScore: {
                        $cond: [
                            {
                                $and: [
                                    { $gt: [{ $size: { $literal: myAvailability } }, 0] },
                                    { $gt: [{ $size: "$_availability" }, 0] }
                                ]
                            },
                            jaccardExpr(
                                { $literal: myAvailability },
                                "$_availability"
                            ),
                            0.5
                        ]
                    },
                    _preferenceScore: {
                        $cond: [
                            {
                                $and: [
                                    { $gt: [{ $size: { $literal: myPreferences } }, 0] },
                                    { $gt: [{ $size: "$_preferences" }, 0] }
                                ]
                            },
                            jaccardExpr(
                                { $literal: myPreferences },
                                "$_preferences"
                            ),
                            0.5
                        ]
                    }
                }
            },

            // 9. Calculate weighted scores inside MongoDB.
            {
                $set: {
                    scoreBreakdown: {
                        mutualSkills: {
                            $round: [{ $multiply: [50, "$_mutualScore"] }, 2]
                        },
                        skillLevel: {
                            $round: [{ $multiply: [15, "$_levelScore"] }, 2]
                        },
                        experience: {
                            $round: [{ $multiply: [10, "$_experienceScore"] }, 2]
                        },
                        rating: {
                            $round: [{ $multiply: [10, "$_ratingScore"] }, 2]
                        },
                        availability: {
                            $round: [{ $multiply: [7.5, "$_availabilityScore"] }, 2]
                        },
                        preferences: {
                            $round: [{ $multiply: [7.5, "$_preferenceScore"] }, 2]
                        }
                    }
                }
            },
            {
                $set: {
                    score: {
                        $round: [
                            {
                                $add: [
                                    "$scoreBreakdown.mutualSkills",
                                    "$scoreBreakdown.skillLevel",
                                    "$scoreBreakdown.experience",
                                    "$scoreBreakdown.rating",
                                    "$scoreBreakdown.availability",
                                    "$scoreBreakdown.preferences"
                                ]
                            },
                            1
                        ]
                    },
                    teachMatch: "$_teachMatch",
                    learnMatch: "$_learnMatch",
                    rating: {
                        $round: [{ $ifNull: ["$_reviewStats.rating", 0] }, 1]
                    },
                    totalReviews: "$_reviewStats.totalReviews",
                    categoryRatings: {
                        clarity: {
                            $round: ["$_reviewStats.clarity", 1]
                        },
                        expertise: {
                            $round: ["$_reviewStats.expertise", 1]
                        },
                        punctuality: {
                            $round: ["$_reviewStats.punctuality", 1]
                        }
                    }
                }
            },

            // 10. Remove internal calculation fields.
            {
                $unset: [
                    "_teachSkills",
                    "_learnSkills",
                    "_availability",
                    "_preferences",
                    "_teachMatch",
                    "_learnMatch",
                    "_matchedSkills",
                    "_levelScores",
                    "_validLevelScores",
                    "_levelScore",
                    "_mutualScore",
                    "_experienceScore",
                    "_reviewStats",
                    "_categoryValues",
                    "_overallRatingScore",
                    "_categoryRatingScore",
                    "_ratingScore",
                    "_availabilityScore",
                    "_preferenceScore"
                ]
            },

            // 11. Return the same response structure as before.
            {
                $set: {
                    user: "$$ROOT"
                }
            },
            {
                $unset: [
                    "user.score",
                    "user.scoreBreakdown",
                    "user.teachMatch",
                    "user.learnMatch"
                ]
            },
            {
                $project: {
                    _id: 0,
                    user: 1,
                    score: 1,
                    scoreBreakdown: 1,
                    teachMatch: 1,
                    learnMatch: 1
                }
            },

            // 12. Return the top three recommendations.
            {
                $sort: { score: -1 }
            },
            {
                $limit: 3
            }
        ];

        const results = await User.aggregate(pipeline);

        return res.json(results);

    } catch (error) {
        console.error("Get Recommendations Error:", error);
        return res.status(500).json({
            message: "Unable to generate recommendations.",
            error: error.message
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



const User = require("../models/User");
const UserSkill = require("../models/UserSkill");
const skillQuizzes = require("../data/skillQuizzes");

const PASS_PERCENTAGE = 70;

// Get quiz questions without exposing correct answers.
exports.getSkillQuiz = async (req, res) => {
    try {
        const skillName = req.params.skillName.trim();
        const skillKey = skillName.toLowerCase();

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const teachesSkill = (user.teachSkills || []).some(
            skill => skill.trim().toLowerCase() === skillKey
        );

        if (!teachesSkill) {
            return res.status(400).json({
                message: "You can take a quiz only for a skill in your teaching skills."
            });
        }

        const questions = skillQuizzes[skillKey];

        if (!questions || questions.length === 0) {
            return res.status(404).json({
                message: "No quiz is available for this skill yet."
            });
        }

        const safeQuestions = questions.map((question, index) => ({
            questionId: index,
            question: question.question,
            options: question.options
        }));

        return res.json({
            skillName,
            totalQuestions: safeQuestions.length,
            passPercentage: PASS_PERCENTAGE,
            questions: safeQuestions
        });

    } catch (error) {
        console.error("Get Skill Quiz Error:", error);

        return res.status(500).json({
            message: "Could not load the skill quiz."
        });
    }
};


// Submit answers and calculate score on the server.
exports.submitSkillQuiz = async (req, res) => {
    try {
        const skillName = req.params.skillName.trim();
        const skillKey = skillName.toLowerCase();
        const { answers } = req.body;

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                message: "Answers must be provided as an array."
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const teachesSkill = (user.teachSkills || []).some(
            skill => skill.trim().toLowerCase() === skillKey
        );

        if (!teachesSkill) {
            return res.status(400).json({
                message: "You can take a quiz only for a skill in your teaching skills."
            });
        }

        const questions = skillQuizzes[skillKey];

        if (!questions || questions.length === 0) {
            return res.status(404).json({
                message: "No quiz is available for this skill yet."
            });
        }

        if (answers.length !== questions.length) {
            return res.status(400).json({
                message: `Please answer all ${questions.length} questions.`
            });
        }

        const validAnswers = answers.every(
    (answer, index) =>
        Number.isInteger(answer) &&
        answer >= 0 &&
        answer < questions[index].options.length
);

        if (!validAnswers) {
            return res.status(400).json({
                message: "Invalid answer format."
            });
        }

        const correctCount = answers.reduce(
            (score, answer, index) =>
                score + (answer === questions[index].answer ? 1 : 0),
            0
        );

        const totalQuestions = questions.length;
        const percentage = Math.round(
            (correctCount / totalQuestions) * 100
        );

        const passed = percentage >= PASS_PERCENTAGE;
        const normalizedSkill =
            user.teachSkills.find(
                skill => skill.trim().toLowerCase() === skillKey
            );

        const verificationStatus = passed
            ? "verified"
            : "unverified";

        const resultNote = passed
            ? "Skill verified through the skill assessment quiz."
            : "Quiz score below the required passing percentage. You may try again.";

        // Update the UserSkill collection.
        await UserSkill.findOneAndUpdate(
            {
                user: user._id,
                skillKey,
                skillType: "teach"
            },
            {
                $set: {
                    skillName: normalizedSkill,
                    verificationStatus,
                    verificationMethod: "quiz",
                    evidenceUrl: "",
                    quizScore: correctCount,
                    quizTotal: totalQuestions,
                    submittedAt: new Date(),
                    verifiedAt: passed ? new Date() : null,
                    verifiedBy: null,
                    reviewerNote: resultNote
                },
                $setOnInsert: {
                    user: user._id,
                    skillKey,
                    skillType: "teach"
                }
            },
            {
                upsert: true,
                new: true,
                runValidators: true
            }
        );

        // Update the embedded User verification record.
        const existingVerification = user.skillVerifications.find(
            item =>
                item.skillName.toLowerCase() === skillKey &&
                item.evidenceType === "quiz"
        );

        if (existingVerification) {
            existingVerification.status = verificationStatus;
            existingVerification.evidenceUrl = "";
            existingVerification.submittedAt = new Date();
            existingVerification.verifiedAt = passed
                ? new Date()
                : null;
            existingVerification.verifiedBy = null;
            existingVerification.reviewerNote = resultNote;
        } else {
            user.skillVerifications.push({
                skillName: normalizedSkill,
                evidenceType: "quiz",
                evidenceUrl: "",
                status: verificationStatus,
                submittedAt: new Date(),
                verifiedAt: passed ? new Date() : null,
                verifiedBy: null,
                reviewerNote: resultNote
            });
        }

        await user.save();

        return res.json({
            message: passed
                ? "Congratulations! Your skill has been verified."
                : "You did not reach the passing score. You can try again.",
            result: {
                skillName: normalizedSkill,
                correctAnswers: correctCount,
                totalQuestions,
                percentage,
                passPercentage: PASS_PERCENTAGE,
                passed,
                status: verificationStatus
            }
        });

    } catch (error) {
        console.error("Submit Skill Quiz Error:", error);

        return res.status(500).json({
            message: "Could not submit the skill quiz."
        });
    }
};

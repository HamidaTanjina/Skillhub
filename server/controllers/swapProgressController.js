
const mongoose = require("mongoose");

const SwapRequest = require("../models/swapRequest");
const SwapSession = require("../models/SwapSession");
const SwapProgress = require("../models/SwapProgress");

// ======================================
// Shared Helpers
// ======================================

const getUserId = (req) => req.user.id.toString();

const isParticipant = (swap, userId) => {
    return (
        swap.sender.toString() === userId ||
        swap.receiver.toString() === userId
    );
};

const getProgressPercentage = (goals = []) => {
    if (goals.length === 0) {
        return 0;
    }

    const completedGoals = goals.filter(
        goal => goal.completed
    ).length;

    return Math.round(
        (completedGoals / goals.length) * 100
    );
};

const getAcceptedSwap = async (swapId, userId) => {
    if (!mongoose.Types.ObjectId.isValid(swapId)) {
        return {
            error: "Invalid swap ID.",
            status: 400
        };
    }

    const swap = await SwapRequest.findById(swapId);

    if (!swap) {
        return {
            error: "Swap request not found.",
            status: 404
        };
    }

    if (!isParticipant(swap, userId)) {
        return {
            error: "You are not a participant in this swap.",
            status: 403
        };
    }

    if (swap.status !== "Accepted") {
        return {
            error: "Progress tracking is available only for accepted swaps.",
            status: 400
        };
    }

    return { swap };
};

const getOrCreateProgress = async (swap) => {
    let progress = await SwapProgress.findOne({
        swapRequest: swap._id
    });

    if (!progress) {
        try {
            progress = await SwapProgress.create({
                swapRequest: swap._id,
                participants: [
                    swap.sender,
                    swap.receiver
                ],
                goals: [],
                sessionLogs: []
            });
        } catch (error) {
            // Handle two participants creating progress
            // at almost the same time.
            if (error.code !== 11000) {
                throw error;
            }

            progress = await SwapProgress.findOne({
                swapRequest: swap._id
            });
        }
    }

    return progress;
};

const formatProgress = (progress) => {
    const data = progress.toObject();

    data.progressPercentage = getProgressPercentage(
        progress.goals
    );

    data.completedGoals = progress.goals.filter(
        goal => goal.completed
    ).length;

    data.totalGoals = progress.goals.length;

    data.completedSessionLogs = progress.sessionLogs.filter(
        log => log.completed
    ).length;

    data.totalSessionLogs = progress.sessionLogs.length;

    return data;
};

// ======================================
// Get Swap Progress
// GET /api/swaps/:id/progress
// ======================================
exports.getSwapProgress = async (req, res) => {
    try {
        const result = await getAcceptedSwap(
            req.params.id,
            getUserId(req)
        );

        if (result.error) {
            return res.status(result.status).json({
                message: result.error
            });
        }

        const progress = await getOrCreateProgress(
            result.swap
        );

        return res.json(formatProgress(progress));
    } catch (error) {
        console.error("Get Swap Progress Error:", error);

        return res.status(500).json({
            message: "Could not retrieve swap progress."
        });
    }
};

// ======================================
// Add Learning Goal
// POST /api/swaps/:id/progress/goals
// ======================================
exports.addLearningGoal = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (
            typeof title !== "string" ||
            !title.trim()
        ) {
            return res.status(400).json({
                message: "A learning goal title is required."
            });
        }

        if (title.trim().length > 200) {
            return res.status(400).json({
                message: "Goal title cannot exceed 200 characters."
            });
        }

        if (
            description !== undefined &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                message: "Goal description must be text."
            });
        }

        if (
            typeof description === "string" &&
            description.length > 1000
        ) {
            return res.status(400).json({
                message: "Goal description cannot exceed 1000 characters."
            });
        }

        const result = await getAcceptedSwap(
            req.params.id,
            getUserId(req)
        );

        if (result.error) {
            return res.status(result.status).json({
                message: result.error
            });
        }

        const progress = await getOrCreateProgress(
            result.swap
        );

        progress.goals.push({
            title: title.trim(),
            description: description?.trim() || "",
            completed: false,
            completedAt: null
        });

        await progress.save();

        return res.status(201).json({
            message: "Learning goal added successfully.",
            ...formatProgress(progress)
        });
    } catch (error) {
        console.error("Add Learning Goal Error:", error);

        return res.status(500).json({
            message: "Could not add learning goal."
        });
    }
};

// ======================================
// Update Learning Goal
// PATCH /api/swaps/:id/progress/goals/:goalId
// ======================================
exports.updateLearningGoal = async (req, res) => {
    try {
        const { title, description, completed } = req.body;

        if (
            title === undefined &&
            description === undefined &&
            completed === undefined
        ) {
            return res.status(400).json({
                message: "Provide a title, description, or completed value."
            });
        }

        if (
            title !== undefined &&
            (
                typeof title !== "string" ||
                !title.trim() ||
                title.trim().length > 200
            )
        ) {
            return res.status(400).json({
                message: "Goal title must contain 1–200 characters."
            });
        }

        if (
            description !== undefined &&
            (
                typeof description !== "string" ||
                description.length > 1000
            )
        ) {
            return res.status(400).json({
                message: "Goal description must be text up to 1000 characters."
            });
        }

        if (
            completed !== undefined &&
            typeof completed !== "boolean"
        ) {
            return res.status(400).json({
                message: "Completed must be true or false."
            });
        }

        const result = await getAcceptedSwap(
            req.params.id,
            getUserId(req)
        );

        if (result.error) {
            return res.status(result.status).json({
                message: result.error
            });
        }

        const progress = await getOrCreateProgress(
            result.swap
        );

        const goal = progress.goals.id(req.params.goalId);

        if (!goal) {
            return res.status(404).json({
                message: "Learning goal not found."
            });
        }

        if (title !== undefined) {
            goal.title = title.trim();
        }

        if (description !== undefined) {
            goal.description = description.trim();
        }

        if (completed !== undefined) {
            goal.completed = completed;
            goal.completedAt = completed
                ? new Date()
                : null;
        }

        await progress.save();

        return res.json({
            message: "Learning goal updated successfully.",
            ...formatProgress(progress)
        });
    } catch (error) {
        console.error("Update Learning Goal Error:", error);

        return res.status(500).json({
            message: "Could not update learning goal."
        });
    }
};

// ======================================
// Add Session Log
// POST /api/swaps/:id/progress/session-logs
// ======================================
exports.addSessionLog = async (req, res) => {
    try {
        const {
            session,
            title,
            notes,
            completed,
            sessionDate
        } = req.body;

        if (
            typeof title !== "string" ||
            !title.trim()
        ) {
            return res.status(400).json({
                message: "A session log title is required."
            });
        }

        if (title.trim().length > 200) {
            return res.status(400).json({
                message: "Session log title cannot exceed 200 characters."
            });
        }

        if (
            notes !== undefined &&
            (
                typeof notes !== "string" ||
                notes.length > 2000
            )
        ) {
            return res.status(400).json({
                message: "Session notes must be text up to 2000 characters."
            });
        }

        if (
            completed !== undefined &&
            typeof completed !== "boolean"
        ) {
            return res.status(400).json({
                message: "Completed must be true or false."
            });
        }

        let parsedSessionDate;

        if (sessionDate !== undefined) {
            parsedSessionDate = new Date(sessionDate);

            if (Number.isNaN(parsedSessionDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid session date."
                });
            }
        }

        const result = await getAcceptedSwap(
            req.params.id,
            getUserId(req)
        );

        if (result.error) {
            return res.status(result.status).json({
                message: result.error
            });
        }

        let linkedSession = null;

        if (session !== undefined && session !== null && session !== "") {
            if (!mongoose.Types.ObjectId.isValid(session)) {
                return res.status(400).json({
                    message: "Invalid scheduled session ID."
                });
            }

            linkedSession = await SwapSession.findOne({
                _id: session,
                swapRequest: result.swap._id,
                participants: req.user.id
            });

            if (!linkedSession) {
                return res.status(404).json({
                    message: "Scheduled session not found for this swap."
                });
            }
        }

        const progress = await getOrCreateProgress(
            result.swap
        );

        const isCompleted = completed === true;

        progress.sessionLogs.push({
            session: linkedSession?._id || null,
            title: title.trim(),
            notes: notes?.trim() || "",
            completed: isCompleted,
            completedBy: isCompleted ? req.user.id : null,
            completedAt: isCompleted ? new Date() : null,
            sessionDate: parsedSessionDate || linkedSession?.startTime || new Date()
        });

        await progress.save();

        return res.status(201).json({
            message: "Session log added successfully.",
            ...formatProgress(progress)
        });
    } catch (error) {
        console.error("Add Session Log Error:", error);

        return res.status(500).json({
            message: "Could not add session log."
        });
    }
};

// ======================================
// Update Session Log
// PATCH /api/swaps/:id/progress/session-logs/:logId
// ======================================
exports.updateSessionLog = async (req, res) => {
    try {
        const { title, notes, completed } = req.body;

        if (
            title === undefined &&
            notes === undefined &&
            completed === undefined
        ) {
            return res.status(400).json({
                message: "Provide a title, notes, or completed value."
            });
        }

        if (
            title !== undefined &&
            (
                typeof title !== "string" ||
                !title.trim() ||
                title.trim().length > 200
            )
        ) {
            return res.status(400).json({
                message: "Session log title must contain 1–200 characters."
            });
        }

        if (
            notes !== undefined &&
            (
                typeof notes !== "string" ||
                notes.length > 2000
            )
        ) {
            return res.status(400).json({
                message: "Session notes must be text up to 2000 characters."
            });
        }

        if (
            completed !== undefined &&
            typeof completed !== "boolean"
        ) {
            return res.status(400).json({
                message: "Completed must be true or false."
            });
        }

        const result = await getAcceptedSwap(
            req.params.id,
            getUserId(req)
        );

        if (result.error) {
            return res.status(result.status).json({
                message: result.error
            });
        }

        const progress = await getOrCreateProgress(
            result.swap
        );

        const log = progress.sessionLogs.id(req.params.logId);

        if (!log) {
            return res.status(404).json({
                message: "Session log not found."
            });
        }

        if (title !== undefined) {
            log.title = title.trim();
        }

        if (notes !== undefined) {
            log.notes = notes.trim();
        }

        if (completed !== undefined) {
            log.completed = completed;
            log.completedBy = completed
                ? req.user.id
                : null;
            log.completedAt = completed
                ? new Date()
                : null;
        }

        await progress.save();

        return res.json({
            message: "Session log updated successfully.",
            ...formatProgress(progress)
        });
    } catch (error) {
        console.error("Update Session Log Error:", error);

        return res.status(500).json({
            message: "Could not update session log."
        });
    }
};

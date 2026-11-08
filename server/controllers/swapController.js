const SwapRequest = require("../models/swapRequest");
const Notification = require("../models/Notification");
const SwapSession = require("../models/SwapSession");
// ======================================
// Send Swap Request
// ======================================

exports.sendRequest = async (req, res) => {

    try {

        const receiver =
            req.body.receiver ||
            req.body.receiverId;

        const teachSkill =
            req.body.teachSkill ||
            req.body.senderTeachSkill ||
            req.body.offeredSkill;

        const learnSkill =
            req.body.learnSkill ||
            req.body.senderLearnSkill ||
            req.body.requestedSkill;

        if (!receiver || !teachSkill || !learnSkill) {

            return res.status(400).json({
                message: "Missing required fields."
            });

        }

        if (receiver.toString() === req.user.id.toString()) {

            return res.status(400).json({
                message: "You cannot send a swap request to yourself."
            });

        }

        const exists = await SwapRequest.findOne({

            sender: req.user.id,
            receiver,
            status: "Pending"

        });

        if (exists) {

            return res.status(400).json({
                message: "Request already sent."
            });

        }

        const swap = await SwapRequest.create({

            sender: req.user.id,
            receiver,
            teachSkill,
            learnSkill,
            status: "Pending"

        });
await Notification.create({
    recipient: receiver,
    sender: req.user.id,
    type: "swap_request",
    message: "You received a new skill swap request.",
    swapId: swap._id
});
        res.status(201).json(swap);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }

};

// ======================================
// Get My Requests
// ======================================

exports.getMyRequests = async (req, res) => {

    try {

        const swaps = await SwapRequest.find({

            $or: [

                { sender: req.user.id },

                { receiver: req.user.id }

            ]

        })

        .populate(
            "sender",
            "name location teachSkills learnSkills"
        )

        .populate(
            "receiver",
            "name location teachSkills learnSkills"
        )

        .sort({

            createdAt: -1

        });

        res.json(swaps);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: error.message

        });

    }

};

// ======================================
// Accept Request
// ======================================

exports.acceptRequest = async (req, res) => {

    try {

        const swap = await SwapRequest.findById(req.params.id);

        if (!swap) {

            return res.status(404).json({

                message: "Request not found."

            });

        }

        swap.status = "Accepted";

        await swap.save();
        await Notification.create({
    recipient: swap.sender,
    sender: req.user.id,
    type: "swap_accepted",
    message: "Your skill swap request was accepted.",
    swapId: swap._id
});

        res.json({

            message: "Request accepted.",

            swapId: swap._id

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: error.message

        });

    }

};

// ======================================
// Reject Request
// ======================================

exports.rejectRequest = async (req, res) => {

    try {

        const swap = await SwapRequest.findById(req.params.id);

        if (!swap) {

            return res.status(404).json({

                message: "Request not found."

            });

        }

        swap.status = "Rejected";

        await swap.save();
        await Notification.create({
    recipient: swap.sender,
    sender: req.user.id,
    type: "swap_rejected",
    message: "Your skill swap request was rejected.",
    swapId: swap._id
});

        res.json({

            message: "Request rejected."

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: error.message

        });

    }

};

// ======================================
// Get All Sent Requests
// ======================================

exports.getSentRequests = async (req, res) => {

    try {

        const swaps = await SwapRequest.find({

            sender: req.user.id

        })

        .select("receiver status")

        .populate("receiver", "_id");

        res.json(swaps);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: error.message

        });

    }

};

const MAX_SESSION_DURATION_HOURS = 8;

// ======================================
// Create Swap Session
// POST /api/swaps/:id/sessions
// ======================================
exports.createSession = async (req, res) => {
    try {
        const { title, description, startTime, endTime } = req.body;

        if (!title || !startTime || !endTime) {
            return res.status(400).json({
                message: "Title, start time, and end time are required."
            });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return res.status(400).json({
                message: "Invalid session date or time."
            });
        }

        if (start <= now) {
            return res.status(400).json({
                message: "Session must be scheduled for a future time."
            });
        }

        if (end <= start) {
            return res.status(400).json({
                message: "End time must be after start time."
            });
        }

        const durationHours = (end - start) / (1000 * 60 * 60);

        if (durationHours > MAX_SESSION_DURATION_HOURS) {
            return res.status(400).json({
                message: "A session cannot exceed 8 hours."
            });
        }

        const swap = await SwapRequest.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({
                message: "Swap request not found."
            });
        }

        const userId = req.user.id.toString();
        const senderId = swap.sender.toString();
        const receiverId = swap.receiver.toString();

        if (userId !== senderId && userId !== receiverId) {
            return res.status(403).json({
                message: "You are not a participant in this swap."
            });
        }

        if (swap.status !== "Accepted") {
            return res.status(400).json({
                message: "Only accepted swaps can have scheduled sessions."
            });
        }

        // Check overlapping sessions for either participant.
        // Two sessions overlap when existing.start < new.end
        // and existing.end > new.start.
        const conflict = await SwapSession.findOne({
            participants: { $in: [senderId, receiverId] },
            status: "Scheduled",
            startTime: { $lt: end },
            endTime: { $gt: start }
        });

        if (conflict) {
            return res.status(409).json({
                message: "A participant already has a session at that time.",
                conflictingSessionId: conflict._id
            });
        }

        const session = await SwapSession.create({
            swapRequest: swap._id,
            organizer: req.user.id,
            participants: [swap.sender, swap.receiver],
            title: title.trim(),
            description:
                typeof description === "string"
                    ? description.trim()
                    : "",
            startTime: start,
            endTime: end
        });

        return res.status(201).json({
            message: "Swap session scheduled successfully.",
            session
        });
    } catch (error) {
        console.error("Create Session Error:", error);

        return res.status(500).json({
            message: "Could not schedule the session."
        });
    }
};

// ======================================
// Get My Sessions
// GET /api/swaps/sessions/my
// ======================================
exports.getMySessions = async (req, res) => {
    try {
        const sessions = await SwapSession.find({
            participants: req.user.id
        })
            .populate("swapRequest", "teachSkill learnSkill status")
            .populate("participants", "name")
            .sort({ startTime: 1 });

        return res.json({ sessions });
    } catch (error) {
        console.error("Get Sessions Error:", error);

        return res.status(500).json({
            message: "Could not retrieve your sessions."
        });
    }
};

// ======================================
// Cancel Swap Session
// PATCH /api/swaps/sessions/:sessionId/cancel
// ======================================
exports.cancelSession = async (req, res) => {
    try {
        const { reason } = req.body;

        if (reason !== undefined && typeof reason !== "string") {
            return res.status(400).json({
                message: "Cancellation reason must be text."
            });
        }

        if (reason && reason.length > 500) {
            return res.status(400).json({
                message: "Cancellation reason cannot exceed 500 characters."
            });
        }

        const session = await SwapSession.findById(
            req.params.sessionId
        );

        if (!session) {
            return res.status(404).json({
                message: "Session not found."
            });
        }

        const isParticipant = session.participants.some(
            participant => participant.toString() === req.user.id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                message: "You are not a participant in this session."
            });
        }

        if (session.status !== "Scheduled") {
            return res.status(400).json({
                message: "Only scheduled sessions can be cancelled."
            });
        }

        session.status = "Cancelled";
        session.cancellationReason = reason?.trim() || "";

        await session.save();

        return res.json({
            message: "Session cancelled successfully.",
            session
        });
    } catch (error) {
        console.error("Cancel Session Error:", error);

        return res.status(500).json({
            message: "Could not cancel the session."
        });
    }
};

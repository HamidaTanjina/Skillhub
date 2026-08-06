const SwapRequest = require("../models/swapRequest");

exports.sendRequest = async (req, res) => {
    try {
        const receiver = req.body.receiver || req.body.receiverId;
        const teachSkill = req.body.teachSkill || req.body.senderTeachSkill || req.body.offeredSkill;
        const learnSkill = req.body.learnSkill || req.body.senderLearnSkill || req.body.requestedSkill;

        if (!receiver || !teachSkill || !learnSkill) {
            return res.status(400).json({
                message: "Missing required fields: receiver, teachSkill, or learnSkill."
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
                message: "Request already sent to this user."
            });
        }

        const swap = await SwapRequest.create({
            sender: req.user.id,
            receiver,
            teachSkill,
            learnSkill,
            status: "Pending"
        });

        res.status(201).json(swap);

    } catch (error) {
        console.error("Send Request Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        const swaps = await SwapRequest.find({
            $or: [
                { sender: req.user.id },
                { receiver: req.user.id }
            ]
        })
        .populate("sender", "name location teachSkills learnSkills")
        .populate("receiver", "name location teachSkills learnSkills")
        .sort({ createdAt: -1 });

        res.json(swaps);

    } catch (error) {
        console.error("Get Requests Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.acceptRequest = async (req, res) => {
    try {

        const swap = await SwapRequest.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        swap.status = "Accepted";

        await swap.save();

        res.json({
            message: "Request accepted.",
            swapId: swap._id
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

exports.rejectRequest = async (req, res) => {
    try {
        const swap = await SwapRequest.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({ message: "Request not found" });
        }

        swap.status = "Rejected";
        await swap.save();

        res.json({ message: "Request rejected." });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.completeSwap = async (req, res) => {

    try {

        const swap = await SwapRequest.findById(req.params.id);

        if (!swap) {

            return res.status(404).json({
                message: "Swap not found"
            });

        }

        const userId = req.user.id;

        // Mark current user's completion
        if (swap.sender.toString() === userId) {

            swap.senderCompleted = true;

        }
        else if (swap.receiver.toString() === userId) {

            swap.receiverCompleted = true;

        }
        else {

            return res.status(403).json({
                message: "Unauthorized"
            });

        }

        // Both users completed
        if (
            swap.senderCompleted &&
            swap.receiverCompleted
        ) {

            swap.status = "Completed";

        }

        await swap.save();

        res.json({

            message:
                swap.status === "Completed"
                    ? "Swap completed successfully."
                    : "Waiting for the other user to complete.",

            status: swap.status,

            senderCompleted: swap.senderCompleted,

            receiverCompleted: swap.receiverCompleted

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Server Error"

        });

    }

};
// ==============================
// Get Request Status
// ==============================

exports.getRequestStatus = async (req, res) => {

    try {

        const receiverId = req.params.receiverId;

        const swap = await SwapRequest.findOne({

            sender: req.user.id,

            receiver: receiverId,

            status: {
                $in: ["Pending", "Accepted"]
            }

        });

        if (!swap) {

            return res.json({
                status: "NONE"
            });

        }

        res.json({
            status: swap.status
        });

    }

    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
// ==============================
// Get All Sent Requests
// ==============================

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

        res.status(500).json({
            message: error.message
        });

    }

};
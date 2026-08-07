const SwapRequest = require("../models/swapRequest");

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
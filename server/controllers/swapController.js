const Swap = require("../models/Swap");

// ===========================
// Send Swap Request
// ===========================

exports.sendRequest = async (req, res) => {

    try {

        const {
            receiver,
            senderTeachSkill,
            senderLearnSkill
        } = req.body;

        const exists = await Swap.findOne({

            sender: req.user.id,
            receiver,
            status: "Pending"

        });

        if (exists) {

            return res.status(400).json({

                message: "Request already sent."

            });

        }

        const swap = await Swap.create({

            sender: req.user.id,
            receiver,
            senderTeachSkill,
            senderLearnSkill

        });

        res.status(201).json(swap);

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

// ===========================
// Get My Requests
// ===========================

exports.getMyRequests = async (req, res) => {

    try {

        const swaps = await Swap.find({

            $or: [

                { sender: req.user.id },

                { receiver: req.user.id }

            ]

        })

        .populate("sender", "name")

        .populate("receiver", "name")

        .sort({

            createdAt: -1

        });

        res.json(swaps);

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

// ===========================
// Accept Request
// ===========================

exports.acceptRequest = async (req, res) => {

    try {

        const swap = await Swap.findById(req.params.id);

        if (!swap) {

            return res.status(404).json({

                message: "Request not found"

            });

        }

        swap.status = "Accepted";

        await swap.save();

        res.json({

            message: "Request accepted."

        });

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

// ===========================
// Reject Request
// ===========================

exports.rejectRequest = async (req, res) => {

    try {

        const swap = await Swap.findById(req.params.id);

        if (!swap) {

            return res.status(404).json({

                message: "Request not found"

            });

        }

        swap.status = "Rejected";

        await swap.save();

        res.json({

            message: "Request rejected."

        });

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

// ===========================
// Complete Swap
// ===========================

exports.completeSwap = async (req, res) => {

    try {

        const swap = await Swap.findById(req.params.id);

        if (!swap) {

            return res.status(404).json({

                message: "Swap not found"

            });

        }

        swap.status = "Completed";

        await swap.save();

        res.json({

            message: "Swap completed."

        });

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};
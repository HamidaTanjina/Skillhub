const Message = require("../models/Message");
const Swap = require("../models/swapRequest");

// ======================================================
// Get All Messages
// ======================================================

exports.getMessages = async (req, res) => {

    try {

        const { swapId } = req.params;
        const userId = req.user.id;

        const swap = await Swap.findById(swapId);

        if (!swap) {

            return res.status(404).json({
                message: "Swap not found"
            });

        }

        const senderId = swap.sender.toString();
        const receiverId = swap.receiver.toString();

        if (
            senderId !== userId &&
            receiverId !== userId
        ) {

            return res.status(403).json({
                message: "Unauthorized"
            });

        }

        const messages = await Message.find({
            swap: swapId
        })
        .populate("sender", "name")
        .populate("receiver", "name")
        .sort({
            createdAt: 1
        });

        res.json(messages);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// ======================================================
// Send Message
// ======================================================

exports.sendMessage = async (req, res) => {

    try {

        const { swapId } = req.params;
        const { message } = req.body;
        const userId = req.user.id;

        if (!message || message.trim() === "") {

            return res.status(400).json({
                message: "Message cannot be empty"
            });

        }

        const swap = await Swap.findById(swapId);

        if (!swap) {

            return res.status(404).json({
                message: "Swap not found"
            });

        }

        let receiver;

        if (swap.sender.toString() === userId) {

            receiver = swap.receiver;

        }
        else if (swap.receiver.toString() === userId) {

            receiver = swap.sender;

        }
        else {

            return res.status(403).json({
                message: "Unauthorized"
            });

        }

        // Save message
        const newMessage = await Message.create({

            swap: swapId,
            sender: userId,
            receiver,
            message

        });

        // Populate sender & receiver
        const populatedMessage = await Message.findById(newMessage._id)
            .populate("sender", "name")
            .populate("receiver", "name");

        // Send message instantly using Socket.IO
        const io = req.app.get("io");

        io.to(swapId).emit("receiveMessage", populatedMessage);

        // Return response
        res.status(201).json(populatedMessage);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};
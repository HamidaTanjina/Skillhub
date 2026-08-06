const express = require("express");

const router = express.Router();

const chatController = require("../controllers/chatController");

const auth = require("../middleware/authMiddleware");

// ======================================================
// Get All Active Chats
// ======================================================

router.get(
    "/",
    auth,
    chatController.getChatList
);

// ======================================================
// Get Messages of One Chat
// ======================================================

router.get(
    "/:swapId",
    auth,
    chatController.getMessages
);

// ======================================================
// Send Message
// ======================================================

router.post(
    "/:swapId",
    auth,
    chatController.sendMessage
);

module.exports = router;
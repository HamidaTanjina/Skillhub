const express = require("express");

const router = express.Router();

const chatController = require("../controllers/chatController");

const auth = require("../middleware/authMiddleware");

// ======================================================
// Get All Messages of a Swap
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
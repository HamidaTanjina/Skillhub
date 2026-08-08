const express = require("express");

const router = express.Router();

const notificationController =
    require("../controllers/notificationController");

const auth =
    require("../middleware/authMiddleware");


// Get notifications
router.get(
    "/",
    auth,
    notificationController.getNotifications
);


// Get unread count
router.get(
    "/unread-count",
    auth,
    notificationController.getUnreadCount
);


// Mark one as read
router.put(
    "/:id/read",
    auth,
    notificationController.markAsRead
);


// Mark all as read
router.put(
    "/read-all",
    auth,
    notificationController.markAllAsRead
);


module.exports = router;
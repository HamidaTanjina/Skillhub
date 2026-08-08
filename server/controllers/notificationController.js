const Notification = require("../models/Notification");

// ======================================
// Get My Notifications
// ======================================

exports.getNotifications = async (req, res) => {

    try {

        const notifications =
            await Notification.find({
                recipient: req.user.id
            })
            .populate("sender", "name")
            .sort({
                createdAt: -1
            })
            .limit(30);

        res.json(notifications);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};


// ======================================
// Get Unread Notification Count
// ======================================

exports.getUnreadCount = async (req, res) => {

    try {

        const count =
            await Notification.countDocuments({
                recipient: req.user.id,
                isRead: false
            });

        res.json({
            count
        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};


// ======================================
// Mark One Notification As Read
// ======================================

exports.markAsRead = async (req, res) => {

    try {

        const notification =
            await Notification.findOneAndUpdate(

                {
                    _id: req.params.id,
                    recipient: req.user.id
                },

                {
                    isRead: true
                },

                {
                    new: true
                }

            );

        if (!notification) {

            return res.status(404).json({
                message: "Notification not found."
            });

        }

        res.json(notification);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};


// ======================================
// Mark All Notifications As Read
// ======================================

exports.markAllAsRead = async (req, res) => {

    try {

        await Notification.updateMany(

            {
                recipient: req.user.id,
                isRead: false
            },

            {
                isRead: true
            }

        );

        res.json({
            message: "All notifications marked as read."
        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

const SwapSession = require("../models/SwapSession");
const Notification = require("../models/Notification");

const REMINDER_MINUTES = 15;
const CHECK_INTERVAL_MS = 60 * 1000;

let reminderTimer = null;
let isChecking = false;

async function checkSessionReminders(io) {
    if (isChecking) return;

    isChecking = true;

    try {
        const now = new Date();

        const reminderWindowEnd = new Date(
            now.getTime() + REMINDER_MINUTES * 60 * 1000
        );

        // Find sessions starting within the next 15 minutes.
        const sessions = await SwapSession.find({
            status: "Scheduled",
            startTime: {
                $gt: now,
                $lte: reminderWindowEnd
            },
            reminderSentAt: null
        }).lean();

        for (const session of sessions) {
            // Atomically claim the reminder so it is not processed twice.
            const claimedSession =
                await SwapSession.findOneAndUpdate(
                    {
                        _id: session._id,
                        status: "Scheduled",
                        reminderSentAt: null,
                        startTime: {
                            $gt: new Date(),
                            $lte: new Date(
                                Date.now() +
                                REMINDER_MINUTES * 60 * 1000
                            )
                        }
                    },
                    {
                        $set: {
                            reminderSentAt: new Date()
                        }
                    },
                    {
                        new: true
                    }
                );

            if (!claimedSession) continue;

            try {
                const participants = [
                    ...new Set(
                        session.participants.map(id => String(id))
                    )
                ];

                const notifications = participants.map(recipientId => {
                    const otherParticipant = participants.find(
                        id => id !== recipientId
                    );

                    return {
                        recipient: recipientId,
                        sender: otherParticipant || String(session.organizer),
                        type: "session_reminder",
                        message:
                            `Reminder: "${session.title}" starts in ` +
                            `${REMINDER_MINUTES} minutes.`,
                        swapId: session.swapRequest,
                        isRead: false
                    };
                });

                const savedNotifications =
                    await Notification.insertMany(notifications);

                // Real-time delivery to connected participants.
                if (io) {
                    for (const notification of savedNotifications) {
                        io.to(String(notification.recipient)).emit(
                            "sessionReminder",
                            notification
                        );
                    }
                }

                console.log(
                    `Session reminder sent for ${session._id}`
                );
            } catch (error) {
                // Allow a later retry if saving notifications fails.
                await SwapSession.updateOne(
                    {
                        _id: session._id,
                        reminderSentAt: claimedSession.reminderSentAt
                    },
                    {
                        $set: {
                            reminderSentAt: null
                        }
                    }
                );

                throw error;
            }
        }
    } catch (error) {
        console.error("Session reminder check failed:", error);
    } finally {
        isChecking = false;
    }
}

function startSessionReminderService(io) {
    if (reminderTimer) return;

    // Check once at startup, then every minute.
    checkSessionReminders(io);

    reminderTimer = setInterval(() => {
        checkSessionReminders(io);
    }, CHECK_INTERVAL_MS);

    console.log("Session reminder service started.");
}

function stopSessionReminderService() {
    if (reminderTimer) {
        clearInterval(reminderTimer);
        reminderTimer = null;
    }
}

module.exports = {
    startSessionReminderService,
    stopSessionReminderService,
    checkSessionReminders
};

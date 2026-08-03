const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";
const SOCKET_URL = "https://skillhub-backend-cths.onrender.com";

const token = localStorage.getItem("token");

// ======================================================
// Login Check
// ======================================================

if (!token) {

    window.location.href = "index.html";

}

// ======================================================
// Get Swap ID
// ======================================================

const params = new URLSearchParams(window.location.search);

const swapId = params.get("swapId");

if (!swapId) {

    alert("Invalid chat.");

    window.location.href = "requests.html";

}

// ======================================================
// DOM
// ======================================================

const chatBody = document.getElementById("chatBody");

const messageInput = document.getElementById("messageInput");

const sendBtn = document.getElementById("sendBtn");

const chatUser = document.getElementById("chatUser");


// ======================================================
// Variables
// ======================================================

let currentUserId = null;

let socket = null;

let isLoadingMessages = false;


// ======================================================
// Start
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    // Get current user from JWT
    const user = parseJwt(token);

    currentUserId = String(user.id || user._id || "");

    // Button click
    if (sendBtn) {

        sendBtn.addEventListener("click", sendMessage);

    }

    // Enter key
    if (messageInput) {

        messageInput.addEventListener("keydown", (e) => {

            if (e.key === "Enter" && !e.shiftKey) {

                e.preventDefault();

                sendMessage();

            }

        });

    }

    // Connect Socket.IO first
    initializeSocket();

    // Load existing messages
    loadMessages();

});


// ======================================================
// JWT Parser
// ======================================================

function parseJwt(token) {

    try {

        const parts = token.split(".");

        if (parts.length !== 3) {

            return {};

        }

        const base64 = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const padded = base64.padEnd(
            base64.length + (4 - base64.length % 4) % 4,
            "="
        );

        return JSON.parse(atob(padded));

    }

    catch (error) {

        console.error("JWT Error:", error);

        return {};

    }

}


// ======================================================
// Socket.IO
// ======================================================

function initializeSocket() {

    // Socket.IO library not loaded
    if (typeof io === "undefined") {

        console.error(
            "Socket.IO is not loaded. Make sure chat.html includes the Socket.IO CDN before chat.js."
        );

        return;

    }

    socket = io(SOCKET_URL, {

        transports: ["websocket", "polling"],

        auth: {

            token: token

        }

    });


    // ==================================================
    // Connected
    // ==================================================

    socket.on("connect", () => {

        console.log(
            "✅ Socket.IO Connected:",
            socket.id
        );

        // Join this swap's private room
        socket.emit("joinRoom", swapId);

        console.log(
            "📩 Joined chat room:",
            swapId
        );

    });


    // ==================================================
    // Receive New Message
    // ==================================================

    socket.on("receiveMessage", (msg) => {

        console.log(
            "📨 New message received:",
            msg
        );

        if (!msg) {

            return;

        }

        // Check if this message already exists in DOM
        // This prevents duplicate messages.
        if (
            msg._id &&
            document.querySelector(
                `[data-message-id="${msg._id}"]`
            )
        ) {

            return;

        }

        const senderId = getUserId(msg.sender);

        const type =
            senderId === String(currentUserId)
                ? "sent"
                : "received";

        createMessage(

            msg.message,

            type,

            formatTime(msg.createdAt),

            msg._id

        );

        scrollToBottom();

        // Update partner name
        if (
            type === "received" &&
            msg.sender &&
            msg.sender.name
        ) {

            chatUser.textContent = msg.sender.name;

        }

    });


    // ==================================================
    // Connection Error
    // ==================================================

    socket.on("connect_error", (error) => {

        console.error(
            "❌ Socket.IO Connection Error:",
            error.message
        );

    });


    // ==================================================
    // Disconnect
    // ==================================================

    socket.on("disconnect", (reason) => {

        console.log(
            "⚠️ Socket disconnected:",
            reason
        );

    });

}


// ======================================================
// Get User ID Safely
// ======================================================

function getUserId(user) {

    if (!user) {

        return "";

    }

    if (typeof user === "string") {

        return String(user);

    }

    return String(
        user._id ||
        user.id ||
        ""
    );

}


// ======================================================
// Load Messages
// ======================================================

async function loadMessages() {

    if (isLoadingMessages) {

        return;

    }

    isLoadingMessages = true;

    try {

        const response = await fetch(

            `${API_BASE_URL}/chat/${swapId}`,

            {

                method: "GET",

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );


        const messages = await response.json();


        if (!response.ok) {

            console.error(
                "Load messages error:",
                messages
            );

            return;

        }


        // Clear current messages
        chatBody.innerHTML = "";


        // ==================================================
        // Set Partner Name
        // ==================================================

        if (messages.length > 0) {

            const firstMessage = messages[0];

            const senderId =
                getUserId(firstMessage.sender);

            let partner = null;


            if (
                senderId === String(currentUserId)
            ) {

                partner =
                    firstMessage.receiver;

            }

            else {

                partner =
                    firstMessage.sender;

            }


            if (
                partner &&
                partner.name
            ) {

                chatUser.textContent =
                    partner.name;

            }

            else {

                chatUser.textContent =
                    "Skill Partner";

            }

        }

        else {

            chatUser.textContent =
                "Skill Partner";

        }


        // ==================================================
        // Display Messages
        // ==================================================

        messages.forEach((msg) => {

            const senderId =
                getUserId(msg.sender);

            const type =
                senderId === String(currentUserId)
                    ? "sent"
                    : "received";


            createMessage(

                msg.message,

                type,

                formatTime(msg.createdAt),

                msg._id

            );

        });


        scrollToBottom();

    }

    catch (error) {

        console.error(
            "❌ Load Messages Error:",
            error
        );

    }

    finally {

        isLoadingMessages = false;

    }

}


// ======================================================
// Send Message
// ======================================================

async function sendMessage() {

    if (!messageInput) {

        return;

    }


    const text =
        messageInput.value.trim();


    // Don't send empty messages
    if (!text) {

        return;

    }


    // Prevent double clicks
    if (sendBtn) {

        sendBtn.disabled = true;

    }


    try {

        const response = await fetch(

            `${API_BASE_URL}/chat/${swapId}`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`

                },

                body: JSON.stringify({

                    message: text

                })

            }

        );


        const data =
            await response.json();


        // ==================================================
        // Error
        // ==================================================

        if (!response.ok) {

            console.error(
                "Send message error:",
                data
            );

            alert(
                data.message ||
                "Unable to send message."
            );

            return;

        }


        // ==================================================
        // Clear Input
        // ==================================================

        messageInput.value = "";



        // ==================================================
        // Fallback
        // ==================================================

        /*
            If Socket.IO is not connected, display the
            returned message immediately.
        */

        if (
            !socket ||
            !socket.connected
        ) {

            const senderId =
                getUserId(data.sender);

            const type =
                senderId === String(currentUserId)
                    ? "sent"
                    : "received";


            // Prevent duplicate
            if (
                !data._id ||
                !document.querySelector(
                    `[data-message-id="${data._id}"]`
                )
            ) {

                createMessage(

                    data.message,

                    type,

                    formatTime(data.createdAt),

                    data._id

                );

            }

            scrollToBottom();

        }

    }

    catch (error) {

        console.error(
            "❌ Send Message Error:",
            error
        );

        alert(
            "Unable to send message. Please try again."
        );

    }

    finally {

        if (sendBtn) {

            sendBtn.disabled = false;

        }

        messageInput.focus();

    }

}


// ======================================================
// Create Message Bubble
// ======================================================

function createMessage(
    text,
    type,
    time,
    messageId = ""
) {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        `message ${type}`;


    // Message ID prevents duplicate messages
    if (messageId) {

        wrapper.dataset.messageId =
            messageId;

    }


    const bubble =
        document.createElement("div");


    bubble.className =
        "bubble";


    // Message text
    const messageText =
        document.createElement("span");


    messageText.className =
        "message-text";


    messageText.textContent =
        text;


    // Time
    const timeElement =
        document.createElement("span");


    timeElement.className =
        "message-time";


    timeElement.textContent =
        time;


    bubble.appendChild(
        messageText
    );

    bubble.appendChild(
        timeElement
    );


    wrapper.appendChild(
        bubble
    );


    chatBody.appendChild(
        wrapper
    );

}


// ======================================================
// Escape HTML
// ======================================================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


// ======================================================
// Format Time
// ======================================================

function formatTime(date) {

    if (!date) {

        return "";

    }


    const d =
        new Date(date);


    if (isNaN(d.getTime())) {

        return "";

    }


    let hour =
        d.getHours();


    let minute =
        d.getMinutes();


    const ampm =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12;


    if (hour === 0) {

        hour = 12;

    }


    minute =
        String(minute)
            .padStart(2, "0");


    return `${hour}:${minute} ${ampm}`;

}


// ======================================================
// Scroll To Bottom
// ======================================================

function scrollToBottom() {

    if (!chatBody) {

        return;

    }


    requestAnimationFrame(() => {

        chatBody.scrollTop =
            chatBody.scrollHeight;

    });

}


// ======================================================
// Clear Chat
// ======================================================

function clearChat() {

    if (chatBody) {

        chatBody.innerHTML = "";

    }

}


// ======================================================
// Cleanup Socket When Leaving Page
// ======================================================

window.addEventListener(
    "beforeunload",
    () => {

        if (socket) {

            socket.disconnect();

        }

    }
);
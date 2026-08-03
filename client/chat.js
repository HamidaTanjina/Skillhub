const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";
const SOCKET_URL = "https://skillhub-backend-cths.onrender.com";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

const params = new URLSearchParams(window.location.search);
const swapId = params.get("swapId");

if (!swapId) {
    alert("Invalid chat.");
    window.location.href = "requests.html";
}

const chatBody = document.getElementById("chatBody");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatUser = document.getElementById("chatUser");

let currentUserId = null;
let socket = null;

// ===============================================
// Start
// ===============================================

document.addEventListener("DOMContentLoaded", () => {

    const user = parseJwt(token);

    currentUserId = user.id || user._id;

    sendBtn.addEventListener("click", sendMessage);

    messageInput.addEventListener("keydown", e => {

        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }

    });

    loadMessages();

    initializeSocket();

});

// ===============================================
// JWT
// ===============================================

function parseJwt(token) {

    try {

        const base64 = token.split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        return JSON.parse(atob(base64));

    }

    catch {

        return {};

    }

}

// ===============================================
// Socket
// ===============================================

function initializeSocket() {

    if (typeof io === "undefined") {

        console.log("Socket.io not loaded. Using polling.");

        setInterval(loadMessages, 3000);

        return;

    }

    socket = io(SOCKET_URL, {

        auth: {
            token
        }

    });

    socket.on("connect", () => {

        console.log("Socket Connected");

       socket.emit("joinRoom", swapId);

    });

    socket.on("receiveMessage", () => {

        loadMessages();

    });

    socket.on("disconnect", () => {

        console.log("Socket disconnected");

    });

}

// ===============================================
// Load Messages
// ===============================================

async function loadMessages() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/chat/${swapId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const messages = await response.json();

        if (!response.ok) {

            console.log(messages);

            return;

        }

        chatBody.innerHTML = "";

        if (messages.length > 0) {

            let partner = "";

            const first = messages[0];

            if (first.sender._id === currentUserId) {

                partner = first.receiver.name;

            } else {

                partner = first.sender.name;

            }

            chatUser.textContent = partner;

        } else {

            chatUser.textContent = "Skill Partner";

        }

        messages.forEach(msg => {

            createMessage(
                msg.message,
                msg.sender._id === currentUserId ? "sent" : "received",
                formatTime(msg.createdAt)
            );

        });

        scrollToBottom();

    }

    catch (err) {

        console.log(err);

    }

}

// ===============================================
// Send Message
// ===============================================

async function sendMessage() {

    const text = messageInput.value.trim();

    if (!text) return;

    sendBtn.disabled = true;

    try {

        const response = await fetch(
            `${API_BASE_URL}/chat/${swapId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: text
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);

            sendBtn.disabled = false;

            return;

        }

        messageInput.value = "";

        if (socket) {

            socket.emit("sendMessage", {

                swapId,
                message: data

            });

        } else {

            loadMessages();

        }

    }

    catch (err) {

        console.log(err);

    }

    sendBtn.disabled = false;

}

// ===============================================
// Create Bubble
// ===============================================

function createMessage(text, type, time) {

    const wrapper = document.createElement("div");

    wrapper.className = `message ${type}`;

    const bubble = document.createElement("div");

    bubble.className = "bubble";

    bubble.innerHTML = `
        ${escapeHtml(text)}
        <span>${time}</span>
    `;

    wrapper.appendChild(bubble);

    chatBody.appendChild(wrapper);

}

// ===============================================
// Escape HTML
// ===============================================

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}

// ===============================================
// Time
// ===============================================

function formatTime(date) {

    const d = new Date(date);

    let h = d.getHours();

    let m = d.getMinutes();

    const ampm = h >= 12 ? "PM" : "AM";

    h %= 12;

    if (h === 0) h = 12;

    m = String(m).padStart(2, "0");

    return `${h}:${m} ${ampm}`;

}

// ===============================================
// Scroll
// ===============================================

function scrollToBottom() {

    chatBody.scrollTop = chatBody.scrollHeight;

}
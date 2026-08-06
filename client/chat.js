const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";
const SOCKET_URL = "https://skillhub-backend-cths.onrender.com";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

// ======================================================
// DOM
// ======================================================

const chatList = document.getElementById("chatList");
const chatBody = document.getElementById("chatBody");
const chatUser = document.getElementById("chatUser");
const chatAvatar = document.getElementById("chatAvatar");
const chatStatus = document.getElementById("chatStatus");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const searchChat = document.getElementById("searchChat");

// ======================================================
// Variables
// ======================================================

let currentUserId = "";
let currentSwapId = "";
let socket = null;
let isLoadingMessages = false;

// ======================================================
// Start
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const user = parseJwt(token);

    currentUserId = String(user.id || user._id || "");

    initializeSocket();

    loadChatList();

    sendBtn.disabled = true;
    messageInput.disabled = true;

    sendBtn.addEventListener("click", sendMessage);

    messageInput.addEventListener("keydown", (e) => {

        if (e.key === "Enter") {

            e.preventDefault();

            sendMessage();

        }

    });

    if (searchChat) {

        searchChat.addEventListener("keyup", filterChats);

    }

});

// ======================================================
// JWT Parser
// ======================================================

function parseJwt(token) {

    try {

        const base64 = token
            .split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        return JSON.parse(atob(base64));

    }

    catch {

        return {};

    }

}
// ======================================================
// Socket.IO
// ======================================================

function initializeSocket() {

    socket = io(SOCKET_URL, {

        auth: {

            token: token

        }

    });

    socket.on("connect", () => {

        console.log("✅ Socket Connected:", socket.id);

        if (currentSwapId) {

            socket.emit("joinRoom", currentSwapId);

        }

    });

    socket.on("receiveMessage", (msg) => {

        // Update left sidebar
        loadChatList();

     const swapId =
    typeof msg.swap === "object"
        ? msg.swap._id
        : msg.swap;

if (String(swapId) !== String(currentSwapId)) {
    return;
}
        createMessage(

            msg.message,

            String(msg.sender._id) === currentUserId
                ? "sent"
                : "received",

            formatTime(msg.createdAt),

            msg._id

        );

        scrollToBottom();

    });

    socket.on("disconnect", () => {

        console.log("Socket disconnected");

    });

}

// ======================================================
// Load Chat List
// ======================================================

async function loadChatList() {

    try {

        const response = await fetch(

            `${API_BASE_URL}/chat`,

            {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );

        const chats = await response.json();

        chatList.innerHTML = "";

        chats.forEach(chat => {

            const item = document.createElement("div");

            item.className = "chat-item";

            item.dataset.swap = chat.swapId;

            item.innerHTML = `

                <div class="chat-avatar">

                    ${chat.partner.name.charAt(0).toUpperCase()}

                </div>

                <div class="chat-info">

                    <h4>${chat.partner.name}</h4>

                    <p>${chat.lastMessage || "Start chatting..."}</p>

                </div>

                <div class="chat-time">

                    ${chat.lastTime ? formatTime(chat.lastTime) : ""}

                </div>

            `;

            item.onclick = () => {

                document.querySelectorAll(".chat-item")
                    .forEach(c => c.classList.remove("active"));

                item.classList.add("active");

                openChat(chat);

            };

            chatList.appendChild(item);

        });

    }

    catch (err) {

        console.log(err);

    }

}

// ======================================================
// Open Selected Chat
// ======================================================

function openChat(chat) {

    currentSwapId = chat.swapId;

    chatUser.textContent = chat.partner.name;

    chatAvatar.textContent =
        chat.partner.name.charAt(0).toUpperCase();

    chatStatus.textContent = "Active Skill Partner";

    messageInput.disabled = false;

    sendBtn.disabled = false;

    chatBody.innerHTML = "";

    if (socket && socket.connected) {

        socket.emit("joinRoom", currentSwapId);

    }

    loadMessages();

}
// ======================================================
// Load Messages
// ======================================================

async function loadMessages() {

    if (!currentSwapId) return;

    if (isLoadingMessages) return;

    isLoadingMessages = true;

    try {

        const response = await fetch(

            `${API_BASE_URL}/chat/${currentSwapId}`,

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

        messages.forEach(msg => {

            createMessage(

                msg.message,

                String(msg.sender._id) === currentUserId
                    ? "sent"
                    : "received",

                formatTime(msg.createdAt),

                msg._id

            );

        });

        scrollToBottom();

    }

    catch (err) {

        console.log(err);

    }

    finally {

        isLoadingMessages = false;

    }

}

// ======================================================
// Send Message
// ======================================================

async function sendMessage() {

    if (!currentSwapId) {

        alert("Select a chat first.");

        return;

    }

    const text = messageInput.value.trim();

    if (!text) {

        return;

    }

    sendBtn.disabled = true;

    try {

        const response = await fetch(

            `${API_BASE_URL}/chat/${currentSwapId}`,

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

            alert(data.message || "Unable to send message.");

            return;

        }

        // Clear input
        messageInput.value = "";

        // If socket isn't connected, display immediately
        if (!socket || !socket.connected) {

            createMessage(

                data.message,

                "sent",

                formatTime(data.createdAt),

                data._id

            );

            scrollToBottom();

        }

        // Refresh sidebar
        loadChatList();

    }

    catch (err) {

        console.log(err);

        alert("Failed to send message.");

    }

    finally {

        sendBtn.disabled = false;

        messageInput.focus();

    }

}
// ======================================================
// Create Message Bubble
// ======================================================

function createMessage(text, type, time, id = "") {

    // Prevent duplicate messages
    if (id && document.querySelector(`[data-id="${id}"]`)) {

        return;

    }

    const wrapper = document.createElement("div");

    wrapper.className = `message ${type}`;

    if (id) {

        wrapper.dataset.id = id;

    }

    const bubble = document.createElement("div");

    bubble.className = "bubble";

    const messageText = document.createElement("div");

    messageText.className = "message-text";

    messageText.textContent = text;

    const messageTime = document.createElement("span");

    messageTime.className = "message-time";

    messageTime.textContent = time;

    bubble.appendChild(messageText);

    bubble.appendChild(messageTime);

    wrapper.appendChild(bubble);

    chatBody.appendChild(wrapper);

}

// ======================================================
// Search Chats
// ======================================================

function filterChats() {

    const keyword = searchChat.value.toLowerCase();

    document.querySelectorAll(".chat-item").forEach(item => {

        const name = item
            .querySelector("h4")
            .textContent
            .toLowerCase();

        if (name.includes(keyword)) {

            item.style.display = "flex";

        } else {

            item.style.display = "none";

        }

    });

}
// ======================================================
// Format Time
// ======================================================

function formatTime(date) {

    if (!date) {

        return "";

    }

    const d = new Date(date);

    if (isNaN(d.getTime())) {

        return "";

    }

    let hour = d.getHours();

    let minute = d.getMinutes();

    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;

    if (hour === 0) {

        hour = 12;

    }

    minute = String(minute).padStart(2, "0");

    return `${hour}:${minute} ${ampm}`;

}

// ======================================================
// Scroll To Bottom
// ======================================================

function scrollToBottom() {

    if (!chatBody) return;

    requestAnimationFrame(() => {

        chatBody.scrollTop = chatBody.scrollHeight;

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
// Cleanup Socket
// ======================================================

window.addEventListener("beforeunload", () => {

    if (socket) {

        socket.disconnect();

    }

});
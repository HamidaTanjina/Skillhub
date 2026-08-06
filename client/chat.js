// ======================================================
// SkillHub Chat
// ======================================================
const params = new URLSearchParams(window.location.search);

const autoSwapId = params.get("swapId");
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

let socket = null;

let currentUserId = "";
let currentSwapId = "";
let currentRoom = "";

let chatData = [];

let isLoadingMessages = false;

// ======================================================
// Start
// ======================================================

document.addEventListener("DOMContentLoaded", async () => {

    const user = parseJwt(token);

    currentUserId = String(
        user.id ||
        user._id ||
        ""
    );

    
    messageInput.disabled = true;
    sendBtn.disabled = true;

   
    initializeSocket();

  
    await loadChatList(autoSwapId);

   
    sendBtn.addEventListener(
        "click",
        sendMessage
    );

    
    messageInput.addEventListener(
        "keydown",
        (e) => {

            if (e.key === "Enter") {

                e.preventDefault();

                sendMessage();

            }

        }
    );

    // Search chats
    if (searchChat) {

        searchChat.addEventListener(
            "keyup",
            filterChats
        );

    }

});

// ======================================================
// Parse JWT
// ======================================================

function parseJwt(token) {

    try {

        const base64 = token
            .split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        return JSON.parse(atob(base64));

    } catch {

        return {};

    }

}
// ======================================================
// Socket.IO
// ======================================================

function initializeSocket() {

    socket = io(SOCKET_URL, {

        auth: {
            token
        },

        transports: [
            "websocket",
            "polling"
        ]

    });

    socket.on("connect", () => {

        console.log("✅ Socket Connected:", socket.id);

        if (currentSwapId) {

            joinRoom(currentSwapId);

        }

    });

    socket.on(
        "receiveMessage",
        receiveMessage
    );

    socket.on("disconnect", () => {

        console.log("❌ Socket Disconnected");

    });

    socket.on("connect_error", (err) => {

        console.log("Socket Error:", err.message);

    });

}

// ======================================================
// Join Room
// ======================================================

function joinRoom(roomId) {

    if (!socket) return;

    if (!socket.connected) return;

    if (
        currentRoom &&
        currentRoom !== roomId
    ) {

        socket.emit(
            "leaveRoom",
            currentRoom
        );

    }

    currentRoom = roomId;

    socket.emit(
        "joinRoom",
        roomId
    );

    console.log(
        "Joined Room:",
        roomId
    );

}
// ======================================================
// Open Chat By Swap ID
// ======================================================

function openChatById(swapId) {

    const chat = chatData.find(
        chat => String(chat.swapId) === String(swapId)
    );

    if (!chat) {

        console.log("Chat not found for swap:", swapId);

        return;

    }

    openChat(chat);

}

// ======================================================
// Receive Message
// ======================================================

function receiveMessage(msg) {

    // Refresh sidebar
   loadChatList(currentSwapId);

    const swapId =

        typeof msg.swap === "object"

            ? msg.swap._id

            : msg.swap;

    if (
        String(swapId) !==
        String(currentSwapId)
    ) {

        return;

    }

    createMessage(

        msg.message,

        String(msg.sender._id) === currentUserId

            ? "sent"

            : "received",

        formatTime(
            msg.createdAt
        ),

        msg._id

    );

    scrollToBottom();

}
// ======================================================
// Load Chat List
// ======================================================

async function loadChatList(autoOpenId = null) {

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

        if (!response.ok) {

            console.log(chats);

            return;

        }

        // Save chats globally
        chatData = chats;

        chatList.innerHTML = "";

        // -----------------------------
        // No chats
        // -----------------------------

        if (!chats.length) {

            chatList.innerHTML = `

                <div class="empty-chat-list">

                    <i class="fa-solid fa-comments"></i>

                    <h3>No Active Chats</h3>

                    <p>
                        When one of your swap requests is accepted,
                        it will automatically appear here.
                    </p>

                </div>

            `;

            return;

        }

        // -----------------------------
        // Build chat list
        // -----------------------------

        chats.forEach(chat => {

            const item = document.createElement("div");

            item.className = "chat-item";

            item.dataset.swap = chat.swapId;

            if (
                String(chat.swapId) ===
                String(currentSwapId)
            ) {

                item.classList.add("active");

            }

            item.innerHTML = `

                <div class="chat-avatar">

                    ${chat.partner.name
                        .charAt(0)
                        .toUpperCase()}

                </div>

                <div class="chat-info">

                    <h4>${chat.partner.name}</h4>

                    <p>

                        ${chat.lastMessage || "💬 Start chatting now"}

                    </p>

                </div>

                <div class="chat-time">

                    ${chat.lastTime
                        ? formatTime(chat.lastTime)
                        : ""}

                </div>

            `;

            item.addEventListener("click", () => {

                document
                    .querySelectorAll(".chat-item")
                    .forEach(i =>
                        i.classList.remove("active")
                    );

                item.classList.add("active");

                openChat(chat);

            });

            chatList.appendChild(item);

            // Automatically open chat from Requests page
            if (
    autoOpenId &&
    String(chat.swapId) === String(autoOpenId)
) {

    setTimeout(() => {

        openChatById(autoOpenId);

    }, 100);

}
        });

    }

    catch (err) {

        console.log(err);

    }

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

        if (!messages.length) {

            chatBody.innerHTML = `

                <div class="empty-chat">

                    <i class="fa-regular fa-comments"></i>

                    <h2>No Messages Yet</h2>

                    <p>Start chatting now.</p>

                </div>

            `;

            return;

        }

        messages.forEach(msg => {

            const senderId = String(

                msg.sender._id ||

                msg.sender.id ||

                msg.sender

            );

            createMessage(

                msg.message,

                senderId === currentUserId

                    ? "sent"

                    : "received",

                formatTime(msg.createdAt),

                msg._id

            );

        });

        scrollToBottom();

    }

    catch (err) {

        console.log("Load Messages:", err);

    }

    finally {

        isLoadingMessages = false;

    }

}
// ======================================================
// Create Message
// ======================================================

function createMessage(text, type, time, id = "") {

    // Prevent duplicate messages
    if (
        id &&
        document.querySelector(`[data-id="${id}"]`)
    ) {

        return;

    }

    const empty = document.querySelector(".empty-chat");

    if (empty) {

        empty.remove();

    }

    const wrapper = document.createElement("div");

    wrapper.className = `message ${type}`;

    if (id) {

        wrapper.dataset.id = id;

    }

    const bubble = document.createElement("div");

    bubble.className = "bubble";

    const msgText = document.createElement("div");

    msgText.className = "message-text";

    msgText.textContent = text;

    const msgTime = document.createElement("div");

    msgTime.className = "message-time";

    msgTime.textContent = time;

    bubble.appendChild(msgText);

    bubble.appendChild(msgTime);

    wrapper.appendChild(bubble);

    chatBody.appendChild(wrapper);

    scrollToBottom();

}
// ======================================================
// Open Chat
// ======================================================

function openChat(chat) {

    // Don't reload if same chat is already open
    if (String(currentSwapId) === String(chat.swapId)) {

        return;

    }

    currentSwapId = String(chat.swapId);

    chatUser.textContent = chat.partner.name;

    chatAvatar.textContent =
        chat.partner.name
            .charAt(0)
            .toUpperCase();

    chatStatus.textContent =
        "Active Skill Partner";

    messageInput.disabled = false;

    sendBtn.disabled = false;

    // Highlight selected chat
    document
        .querySelectorAll(".chat-item")
        .forEach(item => {

            item.classList.remove("active");

            if (
                String(item.dataset.swap) ===
                currentSwapId
            ) {

                item.classList.add("active");

            }

        });

    // Clear previous messages
    chatBody.innerHTML = "";

    // Join Socket Room
    joinRoom(currentSwapId);

    // Update URL without refreshing page
    const url = new URL(window.location);

    url.searchParams.set(
        "swapId",
        currentSwapId
    );

    window.history.replaceState(
        {},
        "",
        url
    );

    // Load chat history
    loadMessages();

    // Focus message box
    messageInput.focus();

}
// ======================================================
// Send Message
// ======================================================

async function sendMessage() {

    if (!currentSwapId) {

        alert("Please select a conversation.");

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

        // If socket isn't connected,
        // show message immediately.
        if (!socket || !socket.connected) {

            createMessage(

                data.message,

                "sent",

                formatTime(data.createdAt),

                data._id

            );

        }

        // Refresh sidebar
        loadChatList();

        messageInput.focus();

    }

    catch (err) {

        console.error(err);

        alert("Failed to send message.");

    }

    finally {

        sendBtn.disabled = false;

    }

}

// ======================================================
// Search Chats
// ======================================================

function filterChats() {

    if (!searchChat) return;

    const keyword = searchChat.value
        .trim()
        .toLowerCase();

    document.querySelectorAll(".chat-item").forEach(item => {

        const name = item
            .querySelector("h4")
            .textContent
            .toLowerCase();

        item.style.display =

            name.includes(keyword)

                ? "flex"

                : "none";

    });

}

// ======================================================
// Format Time
// ======================================================

function formatTime(date) {

    if (!date) return "";

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

    requestAnimationFrame(() => {

        chatBody.scrollTop = chatBody.scrollHeight;

    });

}
// ======================================================
// Cleanup
// ======================================================

window.addEventListener(

    "beforeunload",

    () => {

        if (!socket) return;

        if (currentRoom) {

            socket.emit(

                "leaveRoom",

                currentRoom

            );

        }

        socket.disconnect();

    }

);
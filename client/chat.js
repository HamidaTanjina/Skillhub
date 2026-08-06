// ======================================================
// SkillHub Chat
// ======================================================

const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";
const SOCKET_URL = "https://skillhub-backend-cths.onrender.com";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

// ======================================================
// DOM Elements
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

let isLoadingMessages = false;

let currentRoom = "";

// ======================================================
// Start
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const user = parseJwt(token);

    currentUserId = String(
        user.id ||
        user._id ||
        ""
    );

    initializeSocket();

const params = new URLSearchParams(window.location.search);

const autoOpenSwap = params.get("swapId");

loadChatList(autoOpenSwap);

    messageInput.disabled = true;
    sendBtn.disabled = true;

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

            token

        },

        transports: [

            "websocket",

            "polling"

        ]

    });

    // ------------------------------

    socket.on("connect", () => {

        console.log(
            "✅ Connected:",
            socket.id
        );

        if (currentSwapId) {

            joinRoom(currentSwapId);

        }

    });

    // ------------------------------

    socket.on(
        "receiveMessage",
        receiveMessage
    );

    // ------------------------------

    socket.on(
        "disconnect",
        () => {

            console.log(
                "Socket disconnected"
            );

        }
    );

    socket.on(
        "connect_error",
        (err) => {

            console.log(
                err.message
            );

        }
    );

}

// ======================================================
// Join Room
// ======================================================

function joinRoom(roomId) {

    if (!socket) {

        return;

    }

    if (!socket.connected) {

        return;

    }

    // Leave previous room

    if (
    currentRoom &&
    currentRoom !== roomId.toString()
){

        socket.emit(
            "leaveRoom",
            currentRoom
        );

    }

  currentRoom = roomId.toString();

   socket.emit(
    "joinRoom",
    roomId.toString()
);

    console.log(
        "Joined Room:",
        roomId
    );

}

// ======================================================
// Receive Message
// ======================================================

function receiveMessage(msg) {
 console.log("Received:", msg);
    loadChatList();

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

        String(msg.sender._id) ===
        currentUserId

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
async function loadChatList(autoOpenSwap = null) {

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

        chatList.innerHTML = "";

        if (!chats.length) {

            chatList.innerHTML = `

              <div class="empty-chat">

    <i class="fa-solid fa-comments"></i>

    <h2>You're connected!</h2>

    <p>

        Your skill swap has been accepted.
        Say hello and start learning together.

    </p>

</div>

            `;

            return;

        }

        chats.forEach(chat => {

            const item = document.createElement("div");

            item.className = "chat-item";

            if (String(chat.swapId) === String(currentSwapId)) {

                item.classList.add("active");

            }

            item.dataset.swap = chat.swapId;

            item.innerHTML = `

                <div class="chat-avatar">

                    ${chat.partner.name.charAt(0).toUpperCase()}

                </div>

                <div class="chat-info">

                    <h4>${chat.partner.name}</h4>

                   <p>${chat.lastMessage}</p>

                </div>

                <div class="chat-time">

                    ${chat.lastTime ? formatTime(chat.lastTime) : ""}

                </div>

            `;

            item.addEventListener(

                "click",

                () => {

                    document

                        .querySelectorAll(".chat-item")

                        .forEach(chat =>

                            chat.classList.remove("active")

                        );

                    item.classList.add("active");

                    openChat(chat);

                }

            );

            chatList.appendChild(item);
            if (
    autoOpenSwap &&
    String(chat.swapId) === String(autoOpenSwap)
) {

    item.classList.add("active");

    openChat(chat);

}

        });

    }

    catch (err) {

        console.log(err);

    }

}

// ======================================================
// Open Chat
// ======================================================

function openChat(chat) {

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

    // Remove welcome screen

    chatBody.innerHTML = "";

    // Join Socket Room

    joinRoom(currentSwapId);

    // Load old messages

    loadMessages();

    // Focus cursor

    messageInput.focus();

}
// ======================================================
// Load Messages
// ======================================================

async function loadMessages() {

    if (!currentSwapId) {

        return;

    }

    if (isLoadingMessages) {

        return;

    }

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

        // Clear old messages

        chatBody.innerHTML = "";

        // No messages yet

        if (!messages.length) {

            chatBody.innerHTML = `

                <div class="empty-chat">

                    <i class="fa-regular fa-comments"></i>

                    <h2>No Messages Yet</h2>

                    <p>

                        Start the conversation by sending your first message.

                    </p>

                </div>

            `;

            return;

        }

        // Show messages

        messages.forEach(msg => {

            const senderId = String(

                msg.sender._id ||

                msg.sender.id ||

                msg.sender

            );

            const type =

                senderId === currentUserId

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

    catch (err) {

        console.log("Load Messages Error:", err);

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

        // If Socket.IO isn't connected,
        // show message immediately.
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

        messageInput.focus();

    }

    catch (err) {

        console.error("Send Message Error:", err);

        alert("Failed to send message.");

    }

    finally {

        sendBtn.disabled = false;

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

    // Remove welcome screen if present
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

    if (isNaN(d.getTime())) return "";

    let hour = d.getHours();

    const minute = String(

        d.getMinutes()

    ).padStart(2, "0");

    const ampm =

        hour >= 12

            ? "PM"

            : "AM";

    hour = hour % 12;

    if (hour === 0) {

        hour = 12;

    }

    return `${hour}:${minute} ${ampm}`;

}

// ======================================================
// Scroll To Bottom
// ======================================================

function scrollToBottom() {

    requestAnimationFrame(() => {

        chatBody.scrollTop =

            chatBody.scrollHeight;

    });

}

// ======================================================
// Clear Chat
// ======================================================

function clearChat() {

    chatBody.innerHTML = "";

}

// ======================================================
// Cleanup Socket
// ======================================================

window.addEventListener(

    "beforeunload",

    () => {

        if (socket) {

            socket.disconnect();

        }

    }

);
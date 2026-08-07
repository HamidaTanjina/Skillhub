// ======================================================
// SkillHub Chat
// ======================================================

const params = new URLSearchParams(window.location.search);
const autoSwapId = params.get("swapId");

const API_BASE_URL =
    "https://skillhub-backend-cths.onrender.com/api";

const SOCKET_URL =
    "https://skillhub-backend-cths.onrender.com";

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

const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.getElementById("emojiPicker");


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

    initializeEmojiPicker();

    initializeSocket();

    await loadChatList(autoSwapId);

    // ---------------------------------------------
    // Send button
    // ---------------------------------------------

    sendBtn.addEventListener(
        "click",
        sendMessage
    );


    // ---------------------------------------------
    // Enter to send
    // ---------------------------------------------

    messageInput.addEventListener(
        "keydown",
        (e) => {

            if (e.key === "Enter") {

                e.preventDefault();

                sendMessage();

            }

        }
    );


    // ---------------------------------------------
    // Search chats
    // ---------------------------------------------

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


    // ---------------------------------------------
    // Connected
    // ---------------------------------------------

    socket.on("connect", () => {

        console.log(
            "✅ Connected:",
            socket.id
        );

        if (currentSwapId) {

            joinRoom(currentSwapId);

        }

    });


    // ---------------------------------------------
    // Receive message
    // ---------------------------------------------

    socket.on(
        "receiveMessage",
        receiveMessage
    );


    // ---------------------------------------------
    // Disconnect
    // ---------------------------------------------

    socket.on("disconnect", () => {

        console.log(
            "Socket disconnected"
        );

    });


    // ---------------------------------------------
    // Connection error
    // ---------------------------------------------

    socket.on("connect_error", (err) => {

        console.log(
            "Socket Error:",
            err.message
        );

    });

}


// ======================================================
// Join Room
// ======================================================

function joinRoom(roomId) {

    if (!socket) return;

    if (!socket.connected) return;


    // Leave previous room
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
        c =>
            String(c.swapId) ===
            String(swapId)
    );


    if (!chat) {

        console.log(
            "Chat not found:",
            swapId
        );

        return;

    }


    openChat(chat);

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

                    Authorization:
                        `Bearer ${token}`

                }

            }

        );


        const chats = await response.json();


        if (!response.ok) {

            console.log(chats);

            return;

        }


        chatData = chats;


        chatList.innerHTML = "";


        // ---------------------------------------------
        // No chats
        // ---------------------------------------------

        if (!chats.length) {

            chatList.innerHTML = `

                <div class="empty-chat-list">

                    <i class="fa-solid fa-comments"></i>

                    <h3>No Active Chats</h3>

                    <p>
                        When a swap request is accepted,
                        it will automatically appear here.
                    </p>

                </div>

            `;

            return;

        }


        // ---------------------------------------------
        // Create chat items
        // ---------------------------------------------

        chats.forEach(chat => {

            const item =
                document.createElement("div");


            item.className =
                "chat-item";


            item.dataset.swap =
                chat.swapId;


            // Keep selected chat highlighted
            if (
                String(chat.swapId) ===
                String(currentSwapId)
            ) {

                item.classList.add("active");

            }


            const partnerName =
                chat.partner?.name ||
                "Unknown User";


            const firstLetter =
                partnerName
                    .charAt(0)
                    .toUpperCase();


            item.innerHTML = `

                <div class="chat-avatar">

                    ${firstLetter}

                </div>


                <div class="chat-info">

                    <h4>
                        ${partnerName}
                    </h4>

                    <p>
                        ${chat.lastMessage ||
                        "💬 Start chatting now"}
                    </p>

                </div>


                <div class="chat-time">

                    ${
                        chat.lastTime
                            ? formatTime(chat.lastTime)
                            : ""
                    }

                </div>

            `;


            // ---------------------------------------------
            // Open chat
            // ---------------------------------------------

            item.addEventListener(
                "click",
                () => {

                    openChat(chat);

                }
            );


            chatList.appendChild(item);

        });


        // ---------------------------------------------
        // Automatically open chat
        // ---------------------------------------------

        if (autoOpenId) {

            setTimeout(() => {

                openChatById(
                    autoOpenId
                );

            }, 100);

        }

    }

    catch (err) {

        console.log(
            "Chat List Error:",
            err
        );

    }

}


// ======================================================
// Get Skill Exchange
// ======================================================
//
// Supports several possible backend structures:
//
// chat.teachSkill
// chat.learnSkill
//
// chat.swap.teachSkill
// chat.swap.learnSkill
//
// chat.swapData.teachSkill
// chat.swapData.learnSkill
//
// chat.skillExchange
// ======================================================

function getSkillExchange(chat) {

    let teachSkill = "";
    let learnSkill = "";


    // ---------------------------------------------
    // Direct properties
    // ---------------------------------------------

    teachSkill =
        chat.teachSkill ||
        "";

    learnSkill =
        chat.learnSkill ||
        "";


    // ---------------------------------------------
    // Nested swap object
    // ---------------------------------------------

    if (
        (!teachSkill || !learnSkill) &&
        chat.swap &&
        typeof chat.swap === "object"
    ) {

        teachSkill =
            chat.swap.teachSkill ||
            teachSkill;

        learnSkill =
            chat.swap.learnSkill ||
            learnSkill;

    }


    // ---------------------------------------------
    // Nested swapData object
    // ---------------------------------------------

    if (
        (!teachSkill || !learnSkill) &&
        chat.swapData &&
        typeof chat.swapData === "object"
    ) {

        teachSkill =
            chat.swapData.teachSkill ||
            teachSkill;

        learnSkill =
            chat.swapData.learnSkill ||
            learnSkill;

    }


    // ---------------------------------------------
    // Alternative names
    // ---------------------------------------------

    teachSkill =
        teachSkill ||
        chat.mySkill ||
        chat.offeredSkill ||
        "";


    learnSkill =
        learnSkill ||
        chat.partnerSkill ||
        chat.requestedSkill ||
        "";


    // ---------------------------------------------
    // Final display
    // ---------------------------------------------

    if (teachSkill && learnSkill) {

        return `${teachSkill} <-> ${learnSkill}`;

    }


    if (teachSkill) {

        return `${teachSkill} <-> Skill`;

    }


    if (learnSkill) {

        return `Skill <-> ${learnSkill}`;

    }


    return "Skill Exchange";

}


// ======================================================
// Open Chat
// ======================================================

function openChat(chat) {

    currentSwapId =
        String(chat.swapId);


    // ---------------------------------------------
    // Partner name
    // ---------------------------------------------

    const partnerName =
        chat.partner?.name ||
        "Unknown User";


    chatUser.textContent =
        partnerName;


    // ---------------------------------------------
    // Avatar
    // ---------------------------------------------

    chatAvatar.textContent =
        partnerName
            .charAt(0)
            .toUpperCase();


    // ---------------------------------------------
    // IMPORTANT:
    // Show exchanged skills instead of
    // "Active Skill Partner"
    // ---------------------------------------------

    chatStatus.textContent =
        getSkillExchange(chat);


    // ---------------------------------------------
    // Enable input
    // ---------------------------------------------

    messageInput.disabled = false;

    sendBtn.disabled = false;


    // ---------------------------------------------
    // Remove welcome screen
    // ---------------------------------------------

    const welcome =
        chatBody.querySelector(".empty-chat");

    if (welcome) {

        welcome.remove();

    }


    // ---------------------------------------------
    // Highlight selected chat
    // ---------------------------------------------

    document
        .querySelectorAll(".chat-item")
        .forEach(item => {

            item.classList.remove(
                "active"
            );


            if (
                item.dataset.swap ===
                currentSwapId
            ) {

                item.classList.add(
                    "active"
                );

            }

        });


    // ---------------------------------------------
    // Clear previous messages
    // ---------------------------------------------

    chatBody.innerHTML = "";


    // ---------------------------------------------
    // Join socket room
    // ---------------------------------------------

    joinRoom(
        currentSwapId
    );


    // ---------------------------------------------
    // Update URL
    // ---------------------------------------------

    const url =
        new URL(window.location);


    url.searchParams.set(
        "swapId",
        currentSwapId
    );


    window.history.replaceState(
        {},
        "",
        url
    );


    // ---------------------------------------------
    // Load previous messages
    // ---------------------------------------------

    loadMessages();


    // ---------------------------------------------
    // Focus input
    // ---------------------------------------------

    messageInput.focus();

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

                    Authorization:
                        `Bearer ${token}`

                }

            }

        );


        const messages =
            await response.json();


        if (!response.ok) {

            console.log(messages);

            return;

        }


        chatBody.innerHTML = "";


        // ---------------------------------------------
        // No messages
        // ---------------------------------------------

        if (!messages.length) {

            chatBody.innerHTML = `

                <div class="empty-chat">

                    <i class="fa-regular fa-comments"></i>

                    <h2>No Messages Yet</h2>

                    <p>
                        Start chatting with your
                        skill partner.
                    </p>

                </div>

            `;

            return;

        }


        // ---------------------------------------------
        // Display messages
        // ---------------------------------------------

        messages.forEach(msg => {

            const senderId =
                String(

                    msg.sender?._id ||
                    msg.sender?.id ||
                    msg.sender

                );


            createMessage(

                msg.message,

                senderId === currentUserId
                    ? "sent"
                    : "received",

                formatTime(
                    msg.createdAt
                ),

                msg._id

            );

        });


        scrollToBottom();

    }

    catch (err) {

        console.log(
            "Load Messages Error:",
            err
        );

    }

    finally {

        isLoadingMessages = false;

    }

}


// ======================================================
// Receive Message
// ======================================================

function receiveMessage(msg) {

    // ---------------------------------------------
    // Refresh sidebar
    // ---------------------------------------------

    loadChatList();


    const swapId =

        typeof msg.swap === "object"

            ? msg.swap?._id

            : msg.swap;


    // ---------------------------------------------
    // Ignore messages from another chat
    // ---------------------------------------------

    if (

        String(swapId) !==
        String(currentSwapId)

    ) {

        return;

    }


    // ---------------------------------------------
    // Determine sender
    // ---------------------------------------------

    const senderId =
        String(

            msg.sender?._id ||
            msg.sender?.id ||
            msg.sender

        );


    // ---------------------------------------------
    // Create message
    // ---------------------------------------------

    createMessage(

        msg.message,

        senderId === currentUserId
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
// Send Message
// ======================================================

async function sendMessage() {

    if (!currentSwapId) {

        alert(
            "Please select a conversation."
        );

        return;

    }


    const text =
        messageInput.value.trim();


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


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to send message."
            );

            return;

        }


        // ---------------------------------------------
        // Clear input
        // ---------------------------------------------

        messageInput.value = "";


        // ---------------------------------------------
        // If socket disconnected,
        // display immediately
        // ---------------------------------------------

        if (
            !socket ||
            !socket.connected
        ) {

            createMessage(

                data.message,

                "sent",

                formatTime(
                    data.createdAt
                ),

                data._id

            );

        }


        // ---------------------------------------------
        // Refresh sidebar
        // ---------------------------------------------

        loadChatList();


        messageInput.focus();

    }

    catch (err) {

        console.error(
            "Send Message Error:",
            err
        );

        alert(
            "Failed to send message."
        );

    }

    finally {

        sendBtn.disabled = false;

    }

}


// ======================================================
// Create Message Bubble
// ======================================================

function createMessage(
    text,
    type,
    time,
    id = ""
) {

    // ---------------------------------------------
    // Prevent duplicate messages
    // ---------------------------------------------

    if (

        id &&
        document.querySelector(
            `[data-id="${id}"]`
        )

    ) {

        return;

    }


    // ---------------------------------------------
    // Remove empty screen
    // ---------------------------------------------

    const empty =
        document.querySelector(
            ".empty-chat"
        );


    if (empty) {

        empty.remove();

    }


    // ---------------------------------------------
    // Message wrapper
    // ---------------------------------------------

    const wrapper =
        document.createElement("div");


    wrapper.className =
        `message ${type}`;


    if (id) {

        wrapper.dataset.id =
            id;

    }


    // ---------------------------------------------
    // Bubble
    // ---------------------------------------------

    const bubble =
        document.createElement("div");


    bubble.className =
        "bubble";


    // ---------------------------------------------
    // Message text
    // ---------------------------------------------

    const messageText =
        document.createElement("div");


    messageText.className =
        "message-text";


    messageText.textContent =
        text;


    // ---------------------------------------------
    // Message time
    // ---------------------------------------------

    const messageTime =
        document.createElement("div");


    messageTime.className =
        "message-time";


    messageTime.textContent =
        time;


    // ---------------------------------------------
    // Build
    // ---------------------------------------------

    bubble.appendChild(
        messageText
    );

    bubble.appendChild(
        messageTime
    );

    wrapper.appendChild(
        bubble
    );

    chatBody.appendChild(
        wrapper
    );


    scrollToBottom();

}


// ======================================================
// Emoji Picker
// ======================================================

function initializeEmojiPicker() {

    if (
        !emojiBtn ||
        !emojiPicker ||
        !messageInput
    ) {

        console.log(
            "Emoji elements not found."
        );

        return;

    }


    // ---------------------------------------------
    // Open / close picker
    // ---------------------------------------------

    emojiBtn.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            emojiPicker.classList.toggle(
                "show"
            );

        }
    );


    // ---------------------------------------------
    // Emoji buttons
    // ---------------------------------------------

    const emojiButtons =
        emojiPicker.querySelectorAll(
            "button"
        );


    emojiButtons.forEach(button => {

        button.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();


                const emoji =
                    button.textContent;


                // ---------------------------------
                // Cursor position
                // ---------------------------------

                const start =
                    messageInput.selectionStart ??
                    messageInput.value.length;


                const end =
                    messageInput.selectionEnd ??
                    messageInput.value.length;


                const text =
                    messageInput.value;


                // ---------------------------------
                // Insert emoji
                // ---------------------------------

                messageInput.value =
                    text.substring(
                        0,
                        start
                    ) +

                    emoji +

                    text.substring(
                        end
                    );


                // ---------------------------------
                // Put cursor after emoji
                // ---------------------------------

                const newPosition =
                    start +
                    emoji.length;


                messageInput.focus();


                messageInput.selectionStart =
                    newPosition;


                messageInput.selectionEnd =
                    newPosition;


                // ---------------------------------
                // Close picker
                // ---------------------------------

                emojiPicker.classList.remove(
                    "show"
                );

            }
        );

    });


    // ---------------------------------------------
    // Close when clicking outside
    // ---------------------------------------------

    document.addEventListener(
        "click",
        (event) => {

            if (

                !emojiPicker.contains(
                    event.target
                ) &&

                !emojiBtn.contains(
                    event.target
                )

            ) {

                emojiPicker.classList.remove(
                    "show"
                );

            }

        }
    );

}


// ======================================================
// Search Chats
// ======================================================

function filterChats() {

    if (!searchChat) return;


    const keyword =
        searchChat.value
            .trim()
            .toLowerCase();


    document
        .querySelectorAll(".chat-item")
        .forEach(item => {

            const name =
                item
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

    requestAnimationFrame(() => {

        chatBody.scrollTop =
            chatBody.scrollHeight;

    });

}


// ======================================================
// Clear Chat
// ======================================================

function clearChat() {

    currentSwapId = "";

    currentRoom = "";


    chatBody.innerHTML = `

        <div class="empty-chat">

            <i class="fa-solid fa-comments"></i>

            <h2>
                Welcome to SkillHub Chat
            </h2>

            <p>
                Select a conversation from
                the left sidebar to start
                chatting with your skill partner.
            </p>

        </div>

    `;


    chatUser.textContent =
        "Select a Chat";


    chatAvatar.innerHTML =
        `<i class="fa-solid fa-user"></i>`;


    chatStatus.textContent =
        "Select a conversation";


    messageInput.value = "";

    messageInput.disabled = true;

    sendBtn.disabled = true;

}


// ======================================================
// Cleanup
// ======================================================

window.addEventListener(
    "beforeunload",
    () => {

        if (!socket) {

            return;

        }


        if (currentRoom) {

            socket.emit(
                "leaveRoom",
                currentRoom
            );

        }


        socket.disconnect();

    }
);
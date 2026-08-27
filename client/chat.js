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

let socket = null;

let currentUserId = "";
let currentSwapId = "";
let currentRoom = "";

let chatData = [];

let isLoadingMessages = false;
let onlineUsers = new Set();

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

function getChatSwapId(chat) {

    if (!chat) {
        return "";
    }

    if (chat.swapId) {

        if (
            typeof chat.swapId === "object"
        ) {

            return String(
                chat.swapId._id ||
                chat.swapId.id ||
                ""
            );

        }

        return String(chat.swapId);

    }

    if (chat.swap) {

        if (
            typeof chat.swap === "object"
        ) {

            return String(
                chat.swap._id ||
                chat.swap.id ||
                ""
            );

        }

        return String(chat.swap);

    }

    if (chat.swapData) {

        if (
            typeof chat.swapData === "object"
        ) {

            return String(
                chat.swapData._id ||
                chat.swapData.id ||
                ""
            );

        }

        return String(chat.swapData);

    }

    if (chat._id) {

        return String(chat._id);

    }

    return "";

}

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

    socket.on("onlineUsers", (users) => {

        onlineUsers = new Set(
            users.map(id => String(id))
        );

        updateCurrentUserStatus();

        loadChatList();

    });

    socket.on("userOnline", (userId) => {

        onlineUsers.add(
            String(userId)
        );

        updateCurrentUserStatus();

        loadChatList();

    });

    socket.on("userOffline", (userId) => {

        onlineUsers.delete(
            String(userId)
        );

        updateCurrentUserStatus();

        loadChatList();

    });

    socket.on("connect", () => {

        console.log(
            "Connected:",
            socket.id
        );

        if (currentSwapId) {

            joinRoom(currentSwapId);

        }

    });

    socket.on(
        "receiveMessage",
        receiveMessage
    );

    socket.on("disconnect", () => {

        console.log(
            "Socket disconnected"
        );

    });

    socket.on("connect_error", (err) => {

        console.log(
            "Socket Error:",
            err.message
        );

    });

}

function updateCurrentUserStatus() {

    if (!currentSwapId) return;

    const chat = chatData.find(
        c =>
            getChatSwapId(c) ===
            String(currentSwapId)
    );

    if (!chat) return;

    const partnerId =
        chat.partner?._id ||
        chat.partner?.id;

    const isOnline =
        partnerId &&
        onlineUsers.has(
            String(partnerId)
        );

    chatStatus.textContent = "";

    chatAvatar.classList.toggle(
        "online",
        Boolean(isOnline)
    );

}

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

function openChatById(swapId) {

    const targetSwapId =
        String(swapId || "");

    const chat = chatData.find(
        c =>
            getChatSwapId(c) ===
            targetSwapId
    );

    if (!chat) {

        console.log(
            "Chat not found:",
            targetSwapId
        );

        console.log(
            "Available chat swap IDs:",
            chatData.map(
                c => getChatSwapId(c)
            )
        );

        return;

    }

    openChat(chat);

}

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

        const chats =
            await response.json();

        if (!response.ok) {

            console.log(chats);

            return;

        }

        chatData =
            Array.isArray(chats)
                ? chats
                : [];

        chatList.innerHTML = "";

        if (!chatData.length) {

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

        chatData.forEach(chat => {

            const item =
                document.createElement("div");

            item.className =
                "chat-item";

            const chatSwapId =
                getChatSwapId(chat);

            item.dataset.swap =
                chatSwapId;

            if (
                String(chatSwapId) ===
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

            const partnerId =
                chat.partner?._id ||
                chat.partner?.id;

            const isOnline =
                partnerId &&
                onlineUsers.has(
                    String(partnerId)
                );

            item.innerHTML = `

                <div class="chat-avatar ${isOnline ? "online" : ""}">

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

            item.addEventListener(
                "click",
                () => {

                    openChat(chat);

                }
            );

            chatList.appendChild(item);

        });

        if (autoOpenId) {

            setTimeout(() => {

                openChatById(
                    autoOpenId
                );

            }, 100);

        }

        updateCurrentUserStatus();

    }

    catch (err) {

        console.log(
            "Chat List Error:",
            err
        );

    }

}

function getSkillExchange(chat) {

    let teachSkill = "";
    let learnSkill = "";

    teachSkill =
        chat.teachSkill ||
        "";

    learnSkill =
        chat.learnSkill ||
        "";

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

function openChat(chat) {

    const swapId =
        getChatSwapId(chat);

    if (!swapId) {

        console.log(
            "Invalid chat swap:",
            chat
        );

        alert(
            "Unable to open this conversation."
        );

        return;

    }

    currentSwapId =
        String(swapId);

    document.getElementById(
        "chatHeader"
    ).style.display = "flex";

    document.getElementById(
        "chatInputArea"
    ).style.display = "flex";

    const partnerName =
        chat.partner?.name ||
        "Unknown User";

    chatUser.textContent =
        partnerName;

    chatAvatar.textContent =
        partnerName
            .charAt(0)
            .toUpperCase();

    const chatSkill =
        document.getElementById(
            "chatSkill"
        );

    chatSkill.textContent =
        getSkillExchange(chat);

    updateCurrentUserStatus();

    messageInput.disabled = false;

    sendBtn.disabled = false;

    const welcome =
        chatBody.querySelector(
            ".empty-chat"
        );

    if (welcome) {

        welcome.remove();

    }

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

    chatBody.innerHTML = "";

    joinRoom(
        currentSwapId
    );

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

    loadMessages();

    messageInput.focus();

}

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

function receiveMessage(msg) {

    loadChatList();

    const swapId =
        typeof msg.swap === "object"
            ? msg.swap?._id
            : msg.swap;

    if (
        String(swapId) !==
        String(currentSwapId)
    ) {

        return;

    }

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

    scrollToBottom();

}

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

        messageInput.value = "";

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

function createMessage(
    text,
    type,
    time,
    id = ""
) {

    if (
        id &&
        document.querySelector(
            `[data-id="${id}"]`
        )
    ) {

        return;

    }

    const empty =
        document.querySelector(
            ".empty-chat"
        );

    if (empty) {

        empty.remove();

    }

    const wrapper =
        document.createElement("div");

    wrapper.className =
        `message ${type}`;

    if (id) {

        wrapper.dataset.id =
            id;

    }

    const bubble =
        document.createElement("div");

    bubble.className =
        "bubble";

    const messageText =
        document.createElement("div");

    messageText.className =
        "message-text";

    messageText.textContent =
        text;

    const messageTime =
        document.createElement("div");

    messageTime.className =
        "message-time";

    messageTime.textContent =
        time;

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

    emojiBtn.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            emojiPicker.classList.toggle(
                "show"
            );

        }
    );

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

                const start =
                    messageInput.selectionStart ??
                    messageInput.value.length;

                const end =
                    messageInput.selectionEnd ??
                    messageInput.value.length;

                const text =
                    messageInput.value;

                messageInput.value =
                    text.substring(
                        0,
                        start
                    ) +
                    emoji +
                    text.substring(
                        end
                    );

                const newPosition =
                    start +
                    emoji.length;

                messageInput.focus();

                messageInput.selectionStart =
                    newPosition;

                messageInput.selectionEnd =
                    newPosition;

                emojiPicker.classList.remove(
                    "show"
                );

            }
        );

    });

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

function scrollToBottom() {

    requestAnimationFrame(() => {

        chatBody.scrollTop =
            chatBody.scrollHeight;

    });

}

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

    chatAvatar.classList.remove(
        "online"
    );

    chatStatus.textContent =
        "Select a conversation";

    messageInput.value = "";

    messageInput.disabled = true;

    sendBtn.disabled = true;

}

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
const params = new URLSearchParams(window.location.search);
const autoSwapId = params.get("swapId");

const API_BASE_URL =
    "https://skillhub-backend-cths.onrender.com/api";

const SOCKET_URL =
    "https://skillhub-backend-cths.onrender.com";

const token =
    localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

const chatList =
    document.getElementById("chatList");

const chatBody =
    document.getElementById("chatBody");

const chatUser =
    document.getElementById("chatUser");

const chatAvatar =
    document.getElementById("chatAvatar");

const chatStatus =
    document.getElementById("chatStatus");

const chatSkill =
    document.getElementById("chatSkill");

const chatHeader =
    document.getElementById("chatHeader");

const chatInputArea =
    document.getElementById("chatInputArea");

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const searchChat =
    document.getElementById("searchChat");

const emojiBtn =
    document.getElementById("emojiBtn");

const emojiPicker =
    document.getElementById("emojiPicker");

let socket = null;

let currentUserId = "";
let currentSwapId = "";
let currentRoom = "";

let chatData = [];

let isLoadingMessages = false;

let onlineUsers =
    new Set();

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const user =
            parseJwt(token);

        currentUserId =
            String(
                user.id ||
                user._id ||
                ""
            );

        if (!currentUserId) {
            localStorage.removeItem("token");
            window.location.href =
                "index.html";
            return;
        }

        messageInput.disabled = true;
        sendBtn.disabled = true;

        initializeEmojiPicker();

        initializeSocket();

        await loadChatList(
            autoSwapId
        );

        sendBtn.addEventListener(
            "click",
            sendMessage
        );

        messageInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

        if (searchChat) {

            searchChat.addEventListener(
                "input",
                filterChats
            );

        }

    }
);

function parseJwt(
    jwtToken
) {

    try {

        if (!jwtToken) {
            return {};
        }

        const parts =
            jwtToken.split(".");

        if (parts.length !== 3) {
            return {};
        }

        const base64 =
            parts[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");

        return JSON.parse(
            atob(base64)
        );

    }

    catch (error) {

        console.error(
            "JWT parsing error:",
            error
        );

        return {};

    }

}

function getChatSwapId(
    chat
) {

    if (!chat) {
        return "";
    }

    if (chat.swapId) {

        if (
            typeof chat.swapId ===
            "object"
        ) {

            return String(
                chat.swapId._id ||
                chat.swapId.id ||
                ""
            );

        }

        return String(
            chat.swapId
        );

    }

    if (chat.swap) {

        if (
            typeof chat.swap ===
            "object"
        ) {

            return String(
                chat.swap._id ||
                chat.swap.id ||
                ""
            );

        }

        return String(
            chat.swap
        );

    }

    if (chat.swapData) {

        if (
            typeof chat.swapData ===
            "object"
        ) {

            return String(
                chat.swapData._id ||
                chat.swapData.id ||
                ""
            );

        }

        return String(
            chat.swapData
        );

    }

    if (chat._id) {

        return String(
            chat._id
        );

    }

    return "";

}

function initializeSocket() {

    if (
        typeof io !== "function"
    ) {

        console.error(
            "Socket.IO library not loaded."
        );

        return;

    }

    socket =
        io(
            SOCKET_URL,
            {
                auth: {
                    token: token
                },

                transports: [
                    "websocket",
                    "polling"
                ]
            }
        );

    socket.on(
        "connect",
        () => {

            console.log(
                "Socket connected:",
                socket.id
            );

            if (currentSwapId) {

                joinRoom(
                    currentSwapId
                );

            }

        }
    );

    socket.on(
        "onlineUsers",
        users => {

            onlineUsers =
                new Set(
                    Array.isArray(users)
                        ? users.map(
                            id =>
                                String(id)
                        )
                        : []
                );

            updateCurrentUserStatus();

            loadChatList();

        }
    );

    socket.on(
        "userOnline",
        userId => {

            onlineUsers.add(
                String(userId)
            );

            updateCurrentUserStatus();

            updateChatListOnlineStatus();

        }
    );

    socket.on(
        "userOffline",
        userId => {

            onlineUsers.delete(
                String(userId)
            );

            updateCurrentUserStatus();

            updateChatListOnlineStatus();

        }
    );

    socket.on(
        "receiveMessage",
        receiveMessage
    );

    socket.on(
        "disconnect",
        reason => {

            console.log(
                "Socket disconnected:",
                reason
            );

        }
    );

    socket.on(
        "connect_error",
        error => {

            console.error(
                "Socket connection error:",
                error.message
            );

        }
    );

}

function updateChatListOnlineStatus() {

    document
        .querySelectorAll(".chat-item")
        .forEach(item => {

            const swapId =
                item.dataset.swap;

            const chat =
                chatData.find(
                    currentChat =>
                        getChatSwapId(
                            currentChat
                        ) ===
                        String(swapId)
                );

            if (!chat) {
                return;
            }

            const partnerId =
                chat.partner?._id ||
                chat.partner?.id;

            const avatar =
                item.querySelector(
                    ".chat-avatar"
                );

            if (!avatar) {
                return;
            }

            const isOnline =
                partnerId &&
                onlineUsers.has(
                    String(partnerId)
                );

            avatar.classList.toggle(
                "online",
                Boolean(isOnline)
            );

        });

}

function updateCurrentUserStatus() {

    if (!currentSwapId) {
        return;
    }

    const chat =
        chatData.find(
            item =>
                getChatSwapId(item) ===
                String(currentSwapId)
        );

    if (!chat) {
        return;
    }

    const partnerId =
        chat.partner?._id ||
        chat.partner?.id;

    const isOnline =
        partnerId &&
        onlineUsers.has(
            String(partnerId)
        );

    if (chatStatus) {

        chatStatus.textContent =
            isOnline
                ? "Active now"
                : "Offline";

        chatStatus.classList.toggle(
            "active",
            Boolean(isOnline)
        );

    }

    if (chatAvatar) {

        chatAvatar.classList.toggle(
            "online",
            Boolean(isOnline)
        );

    }

}

function joinRoom(
    roomId
) {

    if (
        !socket ||
        !socket.connected ||
        !roomId
    ) {
        return;
    }

    if (
        currentRoom &&
        currentRoom !== String(roomId)
    ) {

        socket.emit(
            "leaveRoom",
            currentRoom
        );

    }

    currentRoom =
        String(roomId);

    socket.emit(
        "joinRoom",
        currentRoom
    );

    console.log(
        "Joined room:",
        currentRoom
    );

}

function openChatById(
    swapId
) {

    const targetSwapId =
        String(
            swapId || ""
        );

    if (!targetSwapId) {
        return;
    }

    const chat =
        chatData.find(
            item =>
                getChatSwapId(item) ===
                targetSwapId
        );

    if (!chat) {

        console.error(
            "Chat not found:",
            targetSwapId
        );

        return;

    }

    openChat(chat);

}

async function loadChatList(
    autoOpenId = null
) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/chat`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            window.location.href =
                "index.html";

            return;

        }

        const chats =
            await response.json();

        if (!response.ok) {

            console.error(
                "Chat list error:",
                chats
            );

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

                    <h3>
                        No Active Chats
                    </h3>

                    <p>
                        When a swap request is accepted,
                        it will automatically appear here.
                    </p>

                </div>

            `;

            if (
                chatHeader
            ) {

                chatHeader.style.display =
                    "none";

            }

            if (
                chatInputArea
            ) {

                chatInputArea.style.display =
                    "none";

            }

            return;

        }

        chatData.forEach(
            chat => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "chat-item";

                const chatSwapId =
                    getChatSwapId(
                        chat
                    );

                item.dataset.swap =
                    chatSwapId;

                if (
                    String(chatSwapId) ===
                    String(currentSwapId)
                ) {

                    item.classList.add(
                        "active"
                    );

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

                const avatar =
                    document.createElement(
                        "div"
                    );

                avatar.className =
                    "chat-avatar";

                if (isOnline) {

                    avatar.classList.add(
                        "online"
                    );

                }

                avatar.textContent =
                    firstLetter;

                const info =
                    document.createElement(
                        "div"
                    );

                info.className =
                    "chat-info";

                const name =
                    document.createElement(
                        "h4"
                    );

                name.textContent =
                    partnerName;

                const preview =
                    document.createElement(
                        "p"
                    );

                preview.textContent =
                    chat.lastMessage ||
                    "Start chatting now...";

                info.appendChild(
                    name
                );

                info.appendChild(
                    preview
                );

                const time =
                    document.createElement(
                        "div"
                    );

                time.className =
                    "chat-time";

                time.textContent =
                    chat.lastTime
                        ? formatTime(
                            chat.lastTime
                        )
                        : "";

                item.appendChild(
                    avatar
                );

                item.appendChild(
                    info
                );

                item.appendChild(
                    time
                );

                item.addEventListener(
                    "click",
                    () => {

                        openChat(
                            chat
                        );

                    }
                );

                chatList.appendChild(
                    item
                );

            }
        );

        updateCurrentUserStatus();

        if (autoOpenId) {

            setTimeout(
                () => {

                    openChatById(
                        autoOpenId
                    );

                },
                100
            );

        }

    }

    catch (error) {

        console.error(
            "Chat list error:",
            error
        );

        chatList.innerHTML = `

            <div class="empty-chat-list">

                <i class="fa-solid fa-circle-exclamation"></i>

                <h3>
                    Unable to load chats
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>

        `;

    }

}

function getSkillExchange(
    chat
) {

    let teachSkill =
        chat?.teachSkill ||
        "";

    let learnSkill =
        chat?.learnSkill ||
        "";

    if (
        (!teachSkill ||
            !learnSkill) &&
        chat?.swap &&
        typeof chat.swap ===
            "object"
    ) {

        teachSkill =
            chat.swap.teachSkill ||
            teachSkill;

        learnSkill =
            chat.swap.learnSkill ||
            learnSkill;

    }

    if (
        (!teachSkill ||
            !learnSkill) &&
        chat?.swapData &&
        typeof chat.swapData ===
            "object"
    ) {

        teachSkill =
            chat.swapData.teachSkill ||
            teachSkill;

        learnSkill =
            chat.swapData.learnSkill ||
            learnSkill;

    }

    if (
        teachSkill &&
        learnSkill
    ) {

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

function openChat(
    chat
) {

    const swapId =
        getChatSwapId(
            chat
        );

    if (!swapId) {

        alert(
            "Unable to open this conversation."
        );

        return;

    }

    currentSwapId =
        String(swapId);

    if (chatHeader) {

        chatHeader.style.display =
            "flex";

    }

    if (chatInputArea) {

        chatInputArea.style.display =
            "flex";

    }

    const partnerName =
        chat.partner?.name ||
        "Unknown User";

    chatUser.textContent =
        partnerName;

    chatAvatar.textContent =
        partnerName
            .charAt(0)
            .toUpperCase();

    chatSkill.textContent =
        getSkillExchange(
            chat
        );

    updateCurrentUserStatus();

    messageInput.disabled =
        false;

    sendBtn.disabled =
        false;

    document
        .querySelectorAll(
            ".chat-item"
        )
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.swap ===
                        currentSwapId
                );

            }
        );

    chatBody.innerHTML = "";

    joinRoom(
        currentSwapId
    );

    const url =
        new URL(
            window.location.href
        );

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

    if (!currentSwapId) {
        return;
    }

    if (isLoadingMessages) {
        return;
    }

    isLoadingMessages =
        true;

    const swapIdAtStart =
        currentSwapId;

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/chat/${encodeURIComponent(
                    swapIdAtStart
                )}`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            window.location.href =
                "index.html";

            return;

        }

        const messages =
            await response.json();

        if (!response.ok) {

            console.error(
                "Messages error:",
                messages
            );

            return;

        }

        if (
            currentSwapId !==
            swapIdAtStart
        ) {

            return;

        }

        chatBody.innerHTML = "";

        if (
            !Array.isArray(messages) ||
            !messages.length
        ) {

            chatBody.innerHTML = `

                <div class="empty-chat">

                    <i class="fa-regular fa-comments"></i>

                    <h2>
                        No Messages Yet
                    </h2>

                    <p>
                        Start chatting with your
                        skill partner.
                    </p>

                </div>

            `;

            return;

        }

        messages.forEach(
            msg => {

                const senderId =
                    String(
                        msg.sender?._id ||
                        msg.sender?.id ||
                        msg.sender ||
                        ""
                    );

                createMessage(
                    msg.message,
                    senderId ===
                        currentUserId
                        ? "sent"
                        : "received",
                    formatTime(
                        msg.createdAt
                    ),
                    msg._id
                );

            }
        );

        scrollToBottom();

    }

    catch (error) {

        console.error(
            "Load messages error:",
            error
        );

    }

    finally {

        isLoadingMessages =
            false;

    }

}

function receiveMessage(
    msg
) {

    if (!msg) {
        return;
    }

    const swapId =
        typeof msg.swap ===
            "object"
            ? msg.swap?._id ||
              msg.swap?.id
            : msg.swap;

    if (!swapId) {
        return;
    }

    if (
        String(swapId) !==
        String(currentSwapId)
    ) {

        loadChatList();

        return;

    }

    const senderId =
        String(
            msg.sender?._id ||
            msg.sender?.id ||
            msg.sender ||
            ""
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

    loadChatList();

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

    sendBtn.disabled =
        true;

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/chat/${encodeURIComponent(
                    currentSwapId
                )}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify({
                            message: text
                        })
                }
            );

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            window.location.href =
                "index.html";

            return;

        }

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Unable to send message."
            );

            return;

        }

        messageInput.value =
            "";

        loadChatList();

        messageInput.focus();

    }

    catch (error) {

        console.error(
            "Send message error:",
            error
        );

        alert(
            "Failed to send message."
        );

    }

    finally {

        sendBtn.disabled =
            false;

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
            `[data-id="${CSS.escape(
                String(id)
            )}"]`
        )
    ) {

        return;

    }

    const empty =
        chatBody.querySelector(
            ".empty-chat"
        );

    if (empty) {
        empty.remove();
    }

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        `message ${type}`;

    if (id) {

        wrapper.dataset.id =
            String(id);

    }

    const bubble =
        document.createElement(
            "div"
        );

    bubble.className =
        "bubble";

    const messageText =
        document.createElement(
            "div"
        );

    messageText.className =
        "message-text";

    messageText.textContent =
        text || "";

    const messageTime =
        document.createElement(
            "div"
        );

    messageTime.className =
        "message-time";

    messageTime.textContent =
        time || "";

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

        return;

    }

    emojiBtn.addEventListener(
        "click",
        event => {

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

    emojiButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const emoji =
                        button.dataset.emoji ||
                        button.textContent.trim();

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

                    const position =
                        start +
                        emoji.length;

                    messageInput.focus();

                    messageInput.selectionStart =
                        position;

                    messageInput.selectionEnd =
                        position;

                    emojiPicker.classList.remove(
                        "show"
                    );

                }
            );

        }
    );

    document.addEventListener(
        "click",
        event => {

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

    if (!searchChat) {
        return;
    }

    const keyword =
        searchChat.value
            .trim()
            .toLowerCase();

    document
        .querySelectorAll(
            ".chat-item"
        )
        .forEach(
            item => {

                const nameElement =
                    item.querySelector(
                        "h4"
                    );

                const name =
                    nameElement
                        ? nameElement.textContent
                            .toLowerCase()
                        : "";

                item.style.display =
                    name.includes(
                        keyword
                    )
                        ? "flex"
                        : "none";

            }
        );

}

function formatTime(
    date
) {

    if (!date) {
        return "";
    }

    const d =
        new Date(date);

    if (
        Number.isNaN(
            d.getTime()
        )
    ) {

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
            .padStart(
                2,
                "0"
            );

    return `${hour}:${minute} ${ampm}`;

}

function scrollToBottom() {

    requestAnimationFrame(
        () => {

            chatBody.scrollTop =
                chatBody.scrollHeight;

        }
    );

}

function clearChat() {

    if (
        socket &&
        socket.connected &&
        currentRoom
    ) {

        socket.emit(
            "leaveRoom",
            currentRoom
        );

    }

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
        "Offline";

    chatSkill.textContent =
        "Skill Exchange";

    messageInput.value =
        "";

    messageInput.disabled =
        true;

    sendBtn.disabled =
        true;

    if (chatHeader) {

        chatHeader.style.display =
            "none";

    }

    if (chatInputArea) {

        chatInputArea.style.display =
            "none";

    }

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
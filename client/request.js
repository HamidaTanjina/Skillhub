// ======================================================
// SkillHub Request Management
// Part 1A - Setup & Fetch Requests
// ======================================================

const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

let requestsData = [];
let currentReviewSwap = "";
let selectedRating = 0;

const params = new URLSearchParams(window.location.search);
let currentFilter = params.get("tab") || "sent";

document.addEventListener("DOMContentLoaded", () => {
    setupTabListeners();
    setupLogout();
    fetchRequests();
});

// ======================================================
// Decode JWT
// ======================================================

function parseJwt(token) {

    try {

        const base64Url = token.split(".")[1];

        const base64 = base64Url
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        return JSON.parse(atob(base64));

    } catch {

        return null;

    }

}

// ======================================================
// Fetch All Requests
// ======================================================

async function fetchRequests() {

    const container = document.getElementById("requestContainer");

    container.innerHTML = `
        <div class="empty">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <h2>Loading Requests...</h2>
        </div>
    `;

    try {

        const response = await fetch(
            `${API_BASE_URL}/swaps/my`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        const user = parseJwt(token);
        const currentUserId = (user.id || user._id).toString();

    requestsData = data.map(item => {

    const senderId = (item.sender._id || item.sender).toString();

    const receiverId = (item.receiver._id || item.receiver).toString();

    const isSender = senderId === currentUserId;

    const partner = isSender ? item.receiver : item.sender;

    return {

        id: item._id,

        partnerName: partner?.name || "Unknown User",

        location: partner?.location || "Location not added",

        teachSkill: item.teachSkill,

        learnSkill: item.learnSkill,

        status: item.status,

        isSender,

        senderId,

        receiverId,

        senderCompleted: item.senderCompleted,

        receiverCompleted: item.receiverCompleted

    };

});

        renderRequests(currentFilter);

    }

    catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="empty">
                <i class="fa-solid fa-circle-exclamation"></i>
                <h2>Unable to load requests</h2>
                <p>Please try again later.</p>
            </div>
        `;

    }

}
// ======================================================
// Render Requests
// ======================================================

function renderRequests(filter = "sent") {

    const container = document.getElementById("requestContainer");
    container.innerHTML = "";

    let filtered = [];

    // -----------------------------
    // Filter Requests
    // -----------------------------

    if (filter === "sent") {

        filtered = requestsData.filter(request =>
            request.isSender &&
            request.status === "Pending"
        );

    }

    else if (filter === "received") {

        filtered = requestsData.filter(request =>
            !request.isSender &&
            request.status === "Pending"
        );

    }

    else if (filter === "accepted") {

        filtered = requestsData.filter(request =>
            request.status === "Accepted" ||
            request.status === "Pending Confirmation"
        );

    }

    else if (filter === "completed") {

        filtered = requestsData.filter(request =>
            request.status === "Completed"
        );

    }

    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="empty">
                <i class="fa-regular fa-folder-open"></i>
                <h2>No Requests Found</h2>
                <p>You don't have any requests in this section yet.</p>
            </div>
        `;

        return;
    }

    filtered.forEach(request => {

        let statusClass = "";
        let buttons = "";

        // =====================================================
        // Pending
        // =====================================================

        if (request.status === "Pending") {

            statusClass = "pending";

            if (request.isSender) {

                buttons = `
                    <button class="pending-btn" disabled>
                        <i class="fa-solid fa-clock"></i>
                        Waiting...
                    </button>
                `;

            } else {

                buttons = `
                    <button
                        class="accept-btn"
                        onclick="updateRequestStatus('${request.id}','accept')">

                        <i class="fa-solid fa-check"></i>
                        Accept
                    </button>

                    <button
                        class="reject-btn"
                        onclick="updateRequestStatus('${request.id}','reject')">

                        <i class="fa-solid fa-xmark"></i>
                        Reject
                    </button>
                `;

            }

        }

        // =====================================================
        // Accepted
        // =====================================================

        else if (request.status === "Accepted") {

            statusClass = "accepted";

            buttons = `
                <button
                    class="chat-btn"
                    onclick="openChat('${request.id}')">

                    <i class="fa-solid fa-comments"></i>
                    Chat
                </button>

                <button
                    class="complete-btn"
                    onclick="openReview('${request.id}')">

                    <i class="fa-solid fa-circle-check"></i>
                    Complete Swap
                </button>
            `;

        }

        // =====================================================
        // Pending Confirmation
        // =====================================================

        else if (request.status === "Pending Confirmation") {

            statusClass = "pending";

            buttons = `
                <button
                    class="chat-btn"
                    onclick="openChat('${request.id}')">

                    <i class="fa-solid fa-comments"></i>
                    Chat
                </button>
            `;

            // Sender has already reviewed
            if (
                request.isSender &&
                request.senderCompleted
            ) {

                buttons += `
                    <button
                        class="pending-btn"
                        disabled>

                        <i class="fa-solid fa-clock"></i>
                        Waiting for partner confirmation
                    </button>
                `;

            }

            // Receiver has already reviewed
            else if (
                !request.isSender &&
                request.receiverCompleted
            ) {

                buttons += `
                    <button
                        class="pending-btn"
                        disabled>

                        <i class="fa-solid fa-clock"></i>
                        Waiting for partner confirmation
                    </button>
                `;

            }

            // Current user has NOT reviewed yet
            else {

                buttons += `
                    <button
                        class="complete-btn"
                        onclick="openReview('${request.id}')">

                        <i class="fa-solid fa-circle-check"></i>
                        Complete Swap
                    </button>
                `;

            }

        }

        // =====================================================
        // Completed
        // =====================================================

        else if (request.status === "Completed") {

            statusClass = "completed";

            buttons = `
                <button disabled>

                    <i class="fa-solid fa-check-double"></i>

                    Swap Completed

                </button>
            `;

        }

        // =====================================================
        // Rejected
        // =====================================================

        else {

            statusClass = "rejected";

            buttons = `
                <button disabled>

                    <i class="fa-solid fa-ban"></i>

                    Request Rejected

                </button>
            `;

        }

        const avatar =
            (request.partnerName || "?")
                .charAt(0)
                .toUpperCase();

        const requestType =
            request.isSender
                ? "Sent To"
                : "Received From";

        container.innerHTML += `

<div class="request-card">

    <div class="request-header">

        <div class="user-info">

            <div class="avatar">
                ${avatar}
            </div>

            <div>

                <p class="request-type">
                    ${requestType}
                </p>

                <h3>
                    ${request.partnerName}
                </h3>

                <p class="location">

                    <i class="fa-solid fa-location-dot"></i>

                    ${request.location}

                </p>

            </div>

        </div>

        <div class="status ${statusClass}">

            <i class="fa-solid fa-circle"></i>

            ${request.status}

        </div>

    </div>

    <hr>

    <div class="skill-row">

        <div class="skill-item">

            <span class="label">Teaching</span>

            <span class="skill">

                <i class="fa-solid fa-graduation-cap"></i>

                ${request.teachSkill}

            </span>

        </div>

        <i class="fa-solid fa-arrow-right-arrow-left swap-icon"></i>

        <div class="skill-item">

            <span class="label">Learning</span>

            <span class="skill learn">

                <i class="fa-solid fa-lightbulb"></i>

                ${request.learnSkill}

            </span>

        </div>

    </div>

    <div class="request-actions">

        ${buttons}

    </div>

</div>
`;

    });

}
// ======================================================
// Update Request Status
// ======================================================

async function updateRequestStatus(id, action) {

    try {

        const response = await fetch(
            `${API_BASE_URL}/swaps/${id}/${action}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to update request.");
            return;
        }

        await fetchRequests();

        alert(data.message);

    }

    catch (error) {

        console.error(error);

        alert("Something went wrong.");

    }

}

// ======================================================
// Tab Navigation
// ======================================================

function setupTabListeners() {

    const tabs = document.querySelectorAll(".tab-btn");

    tabs.forEach(tab => {

        if (tab.dataset.tab === currentFilter) {

            tab.classList.add("active");

        } else {

            tab.classList.remove("active");

        }

    });

    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            tabs.forEach(btn => btn.classList.remove("active"));

            tab.classList.add("active");

            currentFilter = tab.dataset.tab;

            const url = new URL(window.location);

            url.searchParams.set("tab", currentFilter);

            window.history.replaceState({}, "", url);

            renderRequests(currentFilter);

        });

    });

}

// ======================================================
// Logout
// ======================================================

function setupLogout() {

    const logoutBtn = document.getElementById("logoutBtn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {

        if (!confirm("Are you sure you want to logout?")) return;

        localStorage.removeItem("token");

        window.location.href = "index.html";

    });

}

// ======================================================
// Helpers
// ======================================================

function refreshRequests() {

    fetchRequests();

}

function getStatusClass(status) {

    switch (status) {

        case "Pending":
            return "pending";

        case "Accepted":
            return "accepted";

        case "Completed":
            return "completed";

        case "Rejected":
            return "rejected";

        default:
            return "";

    }

}

// ======================================================
// Open Chat
// ======================================================

function openChat(swapId) {

    window.location.href = `chat.html?swapId=${swapId}`;

}

// ======================================================
// Review Modal
// ======================================================

function openReview(swapId) {

    currentReviewSwap = swapId;

    selectedRating = 0;

    document.querySelectorAll(".star-rating i").forEach(star => {

        star.classList.remove("active");

    });

    document.getElementById("reviewComment").value = "";

    document.getElementById("recommendUser").checked = false;

    document.getElementById("reviewModal").style.display = "flex";

}

function closeReviewModal() {

    document.getElementById("reviewModal").style.display = "none";

}

// ======================================================
// Star Rating
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const stars = document.querySelectorAll(".star-rating i");

    stars.forEach(star => {

        star.addEventListener("click", () => {

            selectedRating = Number(star.dataset.value);

            stars.forEach(s => {

                if (Number(s.dataset.value) <= selectedRating) {

                    s.classList.add("active");

                } else {

                    s.classList.remove("active");

                }

            });

        });

    });

});

// ======================================================
// Submit Review
// ======================================================

async function submitReview() {

    if (selectedRating === 0) {

        alert("Please select a rating.");

        return;

    }

    const comment = document
        .getElementById("reviewComment")
        .value
        .trim();

    if (!comment) {

        alert("Please write your review.");

        return;

    }

    const recommend =
        document.getElementById("recommendUser").checked;

    try {

        const response = await fetch(

            `${API_BASE_URL}/reviews`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify({

                    swapId: currentReviewSwap,

                    rating: selectedRating,

                    comment,

                    recommend

                })

            }

        );

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);

            return;

        }

        alert(data.message);

        closeReviewModal();

        await fetchRequests();

    }

    catch (error) {

        console.error(error);

        alert("Unable to submit review.");

    }

}
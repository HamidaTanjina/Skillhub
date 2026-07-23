const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

let requestsData = [];
const params = new URLSearchParams(window.location.search);

let currentFilter = params.get("tab") || "sent";
document.addEventListener("DOMContentLoaded", () => {
    setupTabListeners();
    setupLogout();
    fetchRequests();
});

// ==============================
// Decode JWT
// ==============================

function parseJwt(token) {

    try {

        const base64Url = token.split(".")[1];

        const base64 = base64Url
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        return JSON.parse(atob(base64));

    }

    catch (error) {

        return null;

    }

}

// ==============================
// Load Requests
// ==============================

async function fetchRequests() {

    const container =
        document.getElementById("requestContainer");

    container.innerHTML = `

        <div class="empty">

            <h2>

                <i class="fa-solid fa-spinner fa-spin"></i>

                Loading Requests...

            </h2>

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

        const currentUserId =
            (user.id || user._id).toString();

        requestsData = data.map(item => {

            const senderId =
                (item.sender._id || item.sender).toString();

            const receiverId =
                (item.receiver._id || item.receiver).toString();

            const isSender =
                senderId === currentUserId;

            const partner =
                isSender
                    ? item.receiver
                    : item.sender;

            return {

                id: item._id,

               partnerName:
    partner?.name || "Unknown User",

location:
    partner?.location || "Location not added",
                teachSkill:
                    item.teachSkill,

                learnSkill:
                    item.learnSkill,

                status:
                    item.status,

                isSender:
                    isSender,

                senderId:
                    senderId,

                receiverId:
                    receiverId

            };

        });

        renderRequests(currentFilter);

    }

    catch (error) {

        console.log(error);

        container.innerHTML = `

            <div class="empty">

                <h2>

                    Unable to load requests.

                </h2>

            </div>

        `;

    }

}
// ==============================
// Render Requests
// ==============================

function renderRequests(filter = "sent") {

    const container = document.getElementById("requestContainer");

    container.innerHTML = "";

    let filtered = [];

    // ==========================
    // Filter Tabs
    // ==========================

    if (filter === "sent") {

        filtered = requestsData.filter(request =>
            request.isSender &&
            (request.status === "Pending" ||
             request.status === "Accepted")
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
            request.status === "Accepted"
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

                <i class="fa-solid fa-folder-open"></i>

                <h2>No Requests Found</h2>

            </div>

        `;

        return;

    }

    filtered.forEach(request => {

        let statusClass = "";
        let buttons = "";

        // ==========================
        // Pending
        // ==========================

        if (request.status === "Pending") {

            statusClass = "pending";

            if (request.isSender) {

                buttons = `

                    <button
                        class="pending-btn"
                        disabled>

                        <i class="fa-solid fa-clock"></i>

                        Waiting For Response

                    </button>

                `;

            }

            else {

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

        // ==========================
        // Accepted
        // ==========================

        else if (request.status === "Accepted") {

            statusClass = "accepted";

            buttons = `

                <button
                    class="chat-btn"
                    onclick="location.href='chat.html'">

                    <i class="fa-solid fa-comments"></i>

                    Open Chat

                </button>

            `;

            if (!request.isSender) {

                buttons += `

                    <button
                        class="complete-btn"
                        onclick="updateRequestStatus('${request.id}','complete')">

                        <i class="fa-solid fa-circle-check"></i>

                        Complete Swap

                    </button>

                `;

            }

        }

        // ==========================
        // Completed
        // ==========================

        else if (request.status === "Completed") {

            statusClass = "completed";

            buttons = `

                <button disabled>

                    <i class="fa-solid fa-check-double"></i>

                    Completed

                </button>

            `;

        }

        // ==========================
        // Rejected
        // ==========================

        else {

            statusClass = "rejected";

            buttons = `

                <button disabled>

                    <i class="fa-solid fa-ban"></i>

                    Rejected

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

            <p>

                <i class="fa-solid fa-location-dot"></i>

                ${request.location}

            </p>

        </div>

    </div>

   <div class="skill-row">

    <div class="skill-item">
        <span class="label">Teach</span>
        <span class="skill">${request.teachSkill}</span>
    </div>

    <i class="fa-solid fa-arrow-right-arrow-left swap-icon"></i>

    <div class="skill-item">
        <span class="label">Learn</span>
        <span class="skill learn">${request.learnSkill}</span>
    </div>

</div>

</div>

<div class="card-footer">

    <div class="status ${statusClass}">
        ${request.status}
    </div>

</div>

<div class="request-actions">
    ${buttons}
</div>

</div>

`;

    });

}
// ==============================
// Accept / Reject / Complete
// ==============================

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

        alert(data.message);

        await fetchRequests();

    }

    catch (error) {

        console.log(error);

        alert("Something went wrong.");

    }

}

// ==============================
// Tab Navigation
// ==============================

function setupTabListeners() {

    const tabs = document.querySelectorAll(".tab-btn");

    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            tabs.forEach(btn =>
                btn.classList.remove("active")
            );

            tab.classList.add("active");

            currentFilter = tab.dataset.tab;

            renderRequests(currentFilter);

        });

    });

}
document.querySelectorAll(".tab-btn").forEach(btn => {

    if (btn.dataset.tab === currentFilter) {

        document.querySelectorAll(".tab-btn").forEach(b =>
            b.classList.remove("active")
        );

        btn.classList.add("active");

    }

});
// ==============================
// Logout
// ==============================

function setupLogout() {

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {

        if (!confirm("Logout from SkillHub?")) return;

        localStorage.removeItem("token");

        window.location.href = "index.html";

    });

}
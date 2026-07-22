const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

let requestsData = [];
let currentFilter = "all";

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
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
    } catch (e) {
        return null;
    }
}

// ==============================
// Load Requests
// ==============================

async function fetchRequests() {

    const container = document.getElementById("requestContainer");

    container.innerHTML = `
        <div class="empty">
            <h2>Loading requests...</h2>
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

        const currentUser = parseJwt(token);

        requestsData = data.map(item => {

            const senderId = item.sender._id || item.sender;

            const isSender =
                senderId === currentUser.id;

            const partner =
                isSender ? item.receiver : item.sender;

            return {

                id: item._id,

                partnerName:
                    partner.name,

                location:
                    partner.location || "Location not added",

                teachSkill:
                    item.teachSkill,

                learnSkill:
                    item.learnSkill,

                status:
                    item.status

            };

        });

        renderRequests(currentFilter);

    }

    catch (error) {

        console.log(error);

        container.innerHTML = `
            <div class="empty">
                <h2>Unable to load requests.</h2>
            </div>
        `;

    }

}
// ==============================
// Render Requests
// ==============================

function renderRequests(filter = "all") {

    const container = document.getElementById("requestContainer");

    container.innerHTML = "";

    let filtered = requestsData;

    if (filter !== "all") {

        filtered = requestsData.filter(request =>

            request.status.toLowerCase() === filter.toLowerCase()

        );

    }

    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="empty">
                <h2>No Requests Found</h2>
            </div>
        `;

        return;

    }

    filtered.forEach(request => {

        let buttons = "";

        let statusClass = "";

        if (request.status === "Pending") {

            statusClass = "pending";

            buttons = `

                <button
                    class="accept-btn"
                    onclick="updateRequestStatus('${request.id}','accept')">

                    Accept

                </button>

                <button
                    class="reject-btn"
                    onclick="updateRequestStatus('${request.id}','reject')">

                    Reject

                </button>

            `;

        }

        else if (request.status === "Accepted") {

            statusClass = "accepted";

            buttons = `

                <button
                    class="chat-btn"
                    onclick="location.href='chat.html'">

                    Open Chat

                </button>

                <button
                    class="complete-btn"
                    onclick="updateRequestStatus('${request.id}','complete')">

                    Complete Swap

                </button>

            `;

        }

        else if (request.status === "Completed") {

            statusClass = "completed";

            buttons = `

                <button disabled>

                    Completed

                </button>

            `;

        }

        else {

            statusClass = "rejected";

            buttons = `

                <button disabled>

                    Rejected

                </button>

            `;

        }

        const avatar = request.partnerName.charAt(0).toUpperCase();

        container.innerHTML += `

<div class="request-card">

    <div class="request-header">

        <div class="avatar">

            ${avatar}

        </div>

        <div>

            <h3>

                ${request.partnerName}

            </h3>

            <p>

                <i class="fa-solid fa-location-dot"></i>

                ${request.location}

            </p>

        </div>

    </div>

    <div class="section">

        <div class="section-title">

            Skill You Teach

        </div>

        <div class="skill-list">

            <span class="skill">

                ${request.teachSkill}

            </span>

        </div>

    </div>

    <div class="section">

        <div class="section-title">

            Skill You Learn

        </div>

        <div class="skill-list">

            <span class="skill learn">

                ${request.learnSkill}

            </span>

        </div>

    </div>

    <div class="status ${statusClass}">

        ${request.status}

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

            alert(data.message);

            return;

        }

        fetchRequests();

    }

    catch (error) {

        console.log(error);

        alert("Something went wrong.");

    }

}
// ==============================
// Tabs
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

// ==============================
// Logout
// ==============================

function setupLogout() {

    const logoutBtn = document.getElementById("logoutBtn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("token");

        window.location.href = "index.html";

    });

}
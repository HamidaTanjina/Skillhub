const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";
const token = localStorage.getItem("token");

if (!token) window.location.href = "index.html";

let requestsData = [];
let currentFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
    setupTabListeners();
    fetchRequests();

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    });
});

async function fetchRequests() {
    const container = document.getElementById("requestContainer");
    try {
        const response = await fetch(`${API_BASE_URL}/swaps/my-requests`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();
        if (Array.isArray(data)) {
            requestsData = data.map((item, index) => {
                const partner = item.receiver && typeof item.receiver === "object" ? item.receiver : item.sender;
                return {
                    id: item._id || index + 1,
                    name: partner ? partner.name : "SkillHub User",
                    location: partner ? partner.location : "Location not specified",
                    teachSkills: item.teachSkill ? [item.teachSkill] : (partner?.teachSkills || ["N/A"]),
                    learnSkills: item.learnSkill ? [item.learnSkill] : (partner?.learnSkills || ["N/A"]),
                    status: item.status || "Pending"
                };
            });
        }
        renderRequests(currentFilter);
    } catch (e) {
        if (container) container.innerHTML = `<p>Error loading requests.</p>`;
    }
}

window.updateRequestStatus = async function(swapId, action) {
    const act = action.toLowerCase();
    try {
        await fetch(`${API_BASE_URL}/swaps/${swapId}/${act}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchRequests();
    } catch (e) {
        alert("Failed to update status");
    }
};

function setupTabListeners() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(tab => tab.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.tab || "all";
            renderRequests(currentFilter);
        });
    });
}

function renderRequests(filter = "all") {
    const container = document.getElementById("requestContainer");
    if (!container) return;
    container.innerHTML = "";

    let filtered = requestsData;
    if (filter !== "all") {
        filtered = requestsData.filter(r => r.status.toLowerCase() === filter.toLowerCase());
    }

    if (filtered.length === 0) {
        container.innerHTML = `<h3>No Requests Found</h3>`;
        return;
    }

    filtered.forEach(req => {
        let buttons = "";
        const statusLower = req.status.toLowerCase();

        if (statusLower === "pending") {
            buttons = `
                <button class="accept-btn" onclick="updateRequestStatus('${req.id}', 'accept')">Accept</button>
                <button class="reject-btn" onclick="updateRequestStatus('${req.id}', 'reject')">Reject</button>
            `;
        } else if (statusLower === "accepted" || statusLower === "active") {
            buttons = `
                <button class="chat-btn" onclick="location.href='chat.html'">Chat</button>
                <button class="complete-btn" onclick="updateRequestStatus('${req.id}', 'complete')">Complete</button>
            `;
        }

        container.innerHTML += `
            <div class="request-card">
                <h3>${req.name}</h3>
                <p><i class="fa-solid fa-location-dot"></i> ${req.location}</p>
                <div class="status ${statusLower}">${req.status}</div>
                <div class="request-actions" style="margin-top:15px;">${buttons}</div>
            </div>
        `;
    });
}
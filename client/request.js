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

// Helper function to decode JWT token payload safely
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

async function fetchRequests() {
    const container = document.getElementById("requestContainer");
    if (container) {
        container.innerHTML = `
            <div class="empty">
                <h2><i class="fa-solid fa-spinner fa-spin"></i> Connecting to server...</h2>
            </div>
        `;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/swap/my-requests`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "index.html";
            return;
        }

        if (!response.ok) {
            throw new Error(`Server status: ${response.status}`);
        }

        const data = await response.json();
        const decodedToken = parseJwt(token);
        const currentUserId = decodedToken ? (decodedToken.id || decodedToken._id) : null;

        if (Array.isArray(data) && data.length > 0) {
            requestsData = data.map((item, index) => {
                let partner = null;
                
                // Identify if current user is the sender or receiver
                const senderId = item.sender ? (item.sender._id || item.sender) : null;
                
                if (currentUserId && senderId && senderId.toString() === currentUserId.toString()) {
                    // Current user sent the request -> Partner is the Receiver
                    partner = item.receiver;
                } else {
                    // Current user received the request -> Partner is the Sender
                    partner = item.sender;
                }

                const partnerName = (partner && typeof partner === "object" && partner.name) 
                    ? partner.name 
                    : "SkillHub User";
                    
                const partnerLocation = (partner && typeof partner === "object" && partner.location) 
                    ? partner.location 
                    : "Location not specified";

                // Format teaching skill
                const rawTeach = item.teachSkill || item.senderTeachSkill || "Skill Swap";
                const teachSkills = Array.isArray(rawTeach) ? rawTeach : [rawTeach];

                // Format learning skill
                const rawLearn = item.learnSkill || item.senderLearnSkill || "Skill Swap";
                const learnSkills = Array.isArray(rawLearn) ? rawLearn : [rawLearn];

                return {
                    id: item._id || item.id || index + 1,
                    name: partnerName,
                    location: partnerLocation,
                    teachSkills: teachSkills,
                    learnSkills: learnSkills,
                    status: capitalize(item.status || "Pending"),
                    review: item.review || "No review written yet.",
                    rating: item.rating || 5
                };
            });
        } else {
            requestsData = [];
        }

        renderRequests(currentFilter);

    } catch (error) {
        console.error("Error loading requests:", error);
        if (container) {
            container.innerHTML = `
                <div class="empty">
                    <h2>Failed to load requests from server.</h2>
                </div>
            `;
        }
    }
}

window.updateRequestStatus = async function(swapId, action) {
    let endpoint = "";
    const act = action.toLowerCase();

    if (act === "active" || act === "accept" || act === "accepted") {
        endpoint = `${API_BASE_URL}/swap/${swapId}/accept`;
    } else if (act === "reject" || act === "rejected") {
        endpoint = `${API_BASE_URL}/swap/${swapId}/reject`;
    } else if (act === "complete" || act === "completed") {
        endpoint = `${API_BASE_URL}/swap/${swapId}/complete`;
    }

    try {
        const response = await fetch(endpoint, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to update status on backend.");
        }

        fetchRequests();

    } catch (error) {
        console.error("Update request error:", error);
        alert("Action failed. Please try again.");
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
        let reviewHTML = "";

        const reqStatus = request.status.toLowerCase();

        if (reqStatus === "pending") {
            statusClass = "pending";
            buttons = `
                <button class="accept-btn" onclick="updateRequestStatus('${request.id}', 'Accept')">
                    Accept
                </button>
                <button class="reject-btn" onclick="updateRequestStatus('${request.id}', 'Reject')">
                    Reject
                </button>
            `;
        } else if (reqStatus === "active" || reqStatus === "accepted") {
            statusClass = "active-status";
            buttons = `
                <button class="chat-btn" onclick="location.href='chat.html'">
                    Open Chat
                </button>
                <button class="complete-btn" onclick="updateRequestStatus('${request.id}', 'Complete')">
                    Complete Swap
                </button>
            `;
        } else {
            statusClass = reqStatus === "rejected" ? "rejected" : "completed";

            if (reqStatus === "completed") {
                const ratingStars = "⭐".repeat(request.rating || 5);
                reviewHTML = `
                    <div class="section">
                        <div class="section-title">Rating</div>
                        <div>${ratingStars}</div>
                    </div>
                    <div class="section">
                        <div class="section-title">Review</div>
                        <p>${request.review}</p>
                    </div>
                `;

                buttons = `
                    <button class="review-btn">
                        View Review
                    </button>
                `;
            } else {
                buttons = `
                    <button class="reject-btn" style="cursor:default; opacity:0.6;">
                        Rejected
                    </button>
                `;
            }
        }

        const avatar = (request.name || "?").charAt(0).toUpperCase();

        const teach = (request.teachSkills || [])
            .map(skill => `<span class="skill">${skill}</span>`)
            .join("");

        const learn = (request.learnSkills || [])
            .map(skill => `<span class="skill learn">${skill}</span>`)
            .join("");

        container.innerHTML += `
            <div class="request-card">
                <div class="request-header">
                    <div class="avatar">${avatar}</div>
                    <div>
                        <h3>${request.name}</h3>
                        <p>
                            <i class="fa-solid fa-location-dot"></i>
                            ${request.location}
                        </p>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Skills They Teach</div>
                    <div class="skill-list">${teach}</div>
                </div>

                <div class="section">
                    <div class="section-title">Wants To Learn</div>
                    <div class="skill-list">${learn}</div>
                </div>

                ${reviewHTML}

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

function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem("token");
            window.location.href = "index.html";
        };
    }
}
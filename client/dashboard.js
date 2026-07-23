const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";

async function loadDashboardData() 
{
    try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "index.html";
                return;
            }
            throw new Error("Failed to load profile.");
        }

        const user = await response.json();

        const welcomeTitle = document.getElementById("welcomeTitle");
        const userName = document.getElementById("userName");
        const profileName = document.getElementById("profileName");
        const profileEmail = document.getElementById("profileEmail");
        const profileLocation = document.getElementById("profileLocation");
        const profileBio = document.getElementById("profileBio");

        if (welcomeTitle) welcomeTitle.textContent = user.name ? `Welcome Back ${user.name}` : "Welcome Back";
        if (userName) userName.textContent = user.name || "User";
        if (profileName) profileName.textContent = user.name || "User";
        if (profileEmail) profileEmail.textContent = user.email || "";
        if (profileLocation) profileLocation.textContent = user.location || "Add Location";
        if (profileBio) profileBio.textContent = user.bio || "Tell everyone about yourself...";

        // Render Skills I Can Teach
        const teachContainer = document.getElementById("teachSkills");
        if (teachContainer) {
            teachContainer.innerHTML = "";
            if (!user.teachSkills || user.teachSkills.length === 0) {
                teachContainer.innerHTML = "<span class='skills-loading-text'>No Skills Added</span>";
            } else {
                user.teachSkills.forEach(skill => {
                    teachContainer.innerHTML += `<span class="skill-tag">${skill}</span>`;
                });
            }
        }

        // Render Skills I Want To Learn
        const learnContainer = document.getElementById("learnSkills");
        if (learnContainer) {
            learnContainer.innerHTML = "";
            if (!user.learnSkills || user.learnSkills.length === 0) {
                learnContainer.innerHTML = "<span class='skills-loading-text'>No Skills Added</span>";
            } else {
                user.learnSkills.forEach(skill => {
                    learnContainer.innerHTML += `<span class="skill-tag">${skill}</span>`;
                });
            }
        }

        // Calculate Profile Completion Percentage
        let completion = 0;
        if (user.name) completion += 20;
        if (user.email) completion += 20;
        if (user.location) completion += 20;
        if (user.bio) completion += 20;
        if (user.teachSkills && user.learnSkills && user.teachSkills.length > 0 && user.learnSkills.length > 0) completion += 20;

        const compText = document.getElementById("profileCompletion");
        const progBar = document.getElementById("progressBar");
        if (compText) compText.textContent = completion + "%";
        if (progBar) progBar.style.width = completion + "%";

        // Fetch Overview Stats & Populate Recent Activity (Updated to plural /swaps/my-requests)
        try {
            const swapRes = await fetch(`${API_BASE_URL}/swaps/my-requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (swapRes.ok) {
                const swaps = await swapRes.json();
                const activeEl = document.getElementById("activeSwaps");
                const pendingEl = document.getElementById("pendingRequests");
                const completedEl = document.getElementById("completedSwaps");

                if (activeEl) activeEl.textContent = swaps.filter(s => s.status === "Accepted" || s.status === "Active").length;
                if (pendingEl) pendingEl.textContent = swaps.filter(s => s.status === "Pending").length;
                if (completedEl) completedEl.textContent = swaps.filter(s => s.status === "Completed").length;

                renderRecentActivity(swaps);
            }
        } catch (e) {
            console.warn("Metrics/Activity unavailable:", e);
        }

        // Fetch & Populate Suggested Matches
        loadSuggestedMatches(user);

    } catch (error) {
        console.error("Dashboard Load Error:", error);
    }
}
// =============================
// Overview Card Navigation
// =============================

document.querySelector(".overview-card.blue")
    .addEventListener("click", () => {
        openRequests("accepted");
    });

document.querySelector(".overview-card.orange")
    .addEventListener("click", () => {
        openRequests("received");
    });

document.querySelector(".overview-card.green")
    .addEventListener("click", () => {
        openRequests("completed");
    });
// 1. Populate Suggested Matches
async function loadSuggestedMatches(currentUser) {
    const container = document.getElementById("matchesContainer");
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/user/all`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) return;

        const allUsers = await response.json();

        // Exclude current logged-in user
        const otherUsers = allUsers.filter(u => u._id !== currentUser._id);

        if (otherUsers.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); padding: 10px;">No matches found yet.</p>`;
            return;
        }

        // Display up to 3 suggested user cards
        container.innerHTML = "";
        otherUsers.slice(0, 3).forEach(user => {
            const initial = user.name ? user.name.charAt(0).toUpperCase() : "?";
            const teachList = (user.teachSkills || []).slice(0, 3).map(s => `<span class="skill-tag">${s}</span>`).join(" ");

            container.innerHTML += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color, #1f2937);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #3b82f6); display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff;">${initial}</div>
                        <div>
                            <h4 style="margin: 0; font-size: 15px; color: var(--text-main, #ffffff);">${user.name || "SkillHub User"}</h4>
                            <div style="margin-top: 4px;">${teachList || "<span style='font-size:12px; color:var(--text-muted);'>No skills listed</span>"}</div>
                        </div>
                    </div>
                    <button onclick="window.location.href='browse-skills.html'" style="padding: 6px 14px; border-radius: 20px; border: 1px solid #3b82f6; background: transparent; color: #60a5fa; cursor: pointer; font-size: 13px;">View</button>
                </div>
            `;
        });

    } catch (e) {
        console.warn("Suggested matches failed:", e);
    }
}

// 2. Populate Recent Activity Feed
function renderRecentActivity(swaps) {
    const container = document.getElementById("activityContainer");
    if (!container) return;

    if (!Array.isArray(swaps) || swaps.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); padding: 10px;">No recent activity.</p>`;
        return;
    }

    container.innerHTML = "";
    swaps.slice(0, 4).forEach(swap => {
        const partner = swap.receiver && typeof swap.receiver === "object" ? swap.receiver : swap.sender;
        const partnerName = partner ? partner.name : "a user";
        const status = swap.status || "Pending";

        container.innerHTML += `
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border-color, #1f2937);">
                <i class="fa-solid fa-clock-rotate-left" style="color: #60a5fa; font-size: 16px;"></i>
                <div style="font-size: 14px; color: var(--text-muted, #94a3b8);">
                    Swap request with <strong style="color: var(--text-main, #ffffff);">${partnerName}</strong> is currently <span style="color: #60a5fa; font-weight: 600;">${status}</span>.
                </div>
            </div>
        `;
    });
}

loadDashboardData();

// Navigation Handlers
const editProfileBtn = document.getElementById("editProfileBtn");
if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
        window.location.href = "profile.html";
    });
}

const addSkillsBtn = document.getElementById("addSkillsBtn");
if (addSkillsBtn) {
    addSkillsBtn.addEventListener("click", () => {
        window.location.href = "add-skills.html";
    });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Logout Error:", error);
        }
        localStorage.removeItem("token");
        window.location.href = "index.html";
    });
}
// =============================
// Open Requests Page
// =============================

function openRequests(tab) {

    window.location.href = `request.html?tab=${tab}`;

}
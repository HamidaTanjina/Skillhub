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
loadNotifications();
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
// ======================================
// Notifications
// ======================================

const notificationBtn =
    document.getElementById("notificationBtn");

const notificationDropdown =
    document.getElementById("notificationDropdown");

const notificationList =
    document.getElementById("notificationList");

const notificationBadge =
    document.getElementById("notificationBadge");

const markAllReadBtn =
    document.getElementById("markAllReadBtn");


// ======================================
// Load Notifications
// ======================================

async function loadNotifications() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/notifications`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            return;
        }

        const notifications =
            await response.json();

        renderNotifications(notifications);

    }

    catch (error) {

        console.error(
            "Notification Load Error:",
            error
        );

    }

}


// ======================================
// Render Notifications
// ======================================

function renderNotifications(notifications) {

    if (!notificationList) {
        return;
    }

    if (
        !Array.isArray(notifications) ||
        notifications.length === 0
    ) {

        notificationList.innerHTML = `
            <div class="notification-empty">
                No notifications
            </div>
        `;

        updateNotificationBadge(0);

        return;
    }


    const unreadCount =
        notifications.filter(
            notification =>
                !notification.isRead
        ).length;


    updateNotificationBadge(
        unreadCount
    );


    notificationList.innerHTML = "";


    notifications.forEach(notification => {

        const item =
            document.createElement("div");

        item.className =
            "notification-item";


        if (!notification.isRead) {

            item.classList.add("unread");

        }


        const icon =
            getNotificationIcon(
                notification.type
            );


        const senderName =
            notification.sender?.name ||
            "SkillHub User";


        item.innerHTML = `

            <div class="notification-icon">

                <i class="${icon}"></i>

            </div>

            <div class="notification-content">

                <p class="notification-message">

                    ${notification.message}

                </p>

                <span class="notification-time">

                    ${formatNotificationTime(
                        notification.createdAt
                    )}

                </span>

            </div>

        `;


        item.addEventListener(
            "click",
            () => {

                markNotificationAsRead(
                    notification._id
                );

            }
        );


        notificationList.appendChild(item);

    });

}


// ======================================
// Notification Icon
// ======================================

function getNotificationIcon(type) {

    switch (type) {

        case "swap_request":
            return "fa-solid fa-handshake";

        case "swap_accepted":
            return "fa-solid fa-check";

        case "swap_rejected":
            return "fa-solid fa-xmark";

        case "new_message":
            return "fa-solid fa-comment";

        default:
            return "fa-solid fa-bell";

    }

}


// ======================================
// Notification Badge
// ======================================

function updateNotificationBadge(count) {

    if (!notificationBadge) {
        return;
    }


    if (count > 0) {

        notificationBadge.textContent =
            count > 9 ? "9+" : count;

        notificationBadge.classList.remove(
            "hidden"
        );

    }

    else {

        notificationBadge.classList.add(
            "hidden"
        );

    }

}


// ======================================
// Mark Notification As Read
// ======================================

async function markNotificationAsRead(id) {

    try {

        await fetch(
            `${API_BASE_URL}/notifications/${id}/read`,
            {
                method: "PUT",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        loadNotifications();

    }

    catch (error) {

        console.error(
            "Mark Notification Error:",
            error
        );

    }

}


// ======================================
// Mark All As Read
// ======================================

if (markAllReadBtn) {

    markAllReadBtn.addEventListener(
        "click",
        async (event) => {

            event.stopPropagation();

            try {

                await fetch(
                    `${API_BASE_URL}/notifications/read-all`,
                    {
                        method: "PUT",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                loadNotifications();

            }

            catch (error) {

                console.error(
                    "Mark All Read Error:",
                    error
                );

            }

        }
    );

}


// ======================================
// Toggle Notification Dropdown
// ======================================

if (notificationBtn) {

    notificationBtn.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            notificationDropdown.classList.toggle(
                "show"
            );

        }
    );

}


// ======================================
// Close Notification Dropdown
// ======================================

document.addEventListener(
    "click",
    (event) => {

        if (
            notificationDropdown &&
            notificationBtn &&
            !notificationDropdown.contains(
                event.target
            ) &&
            !notificationBtn.contains(
                event.target
            )
        ) {

            notificationDropdown.classList.remove(
                "show"
            );

        }

    }
);


// ======================================
// Notification Time
// ======================================

function formatNotificationTime(date) {

    if (!date) {
        return "";
    }

    const notificationDate =
        new Date(date);

    const now =
        new Date();

    const difference =
        Math.floor(
            (now - notificationDate) /
            1000
        );


    if (difference < 60) {

        return "Just now";

    }


    if (difference < 3600) {

        return `${Math.floor(
            difference / 60
        )} min ago`;

    }


    if (difference < 86400) {

        return `${Math.floor(
            difference / 3600
        )} hr ago`;

    }


    return notificationDate.toLocaleDateString();

}
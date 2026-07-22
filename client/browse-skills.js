const token = localStorage.getItem("token");
const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";

let selectedReceiver = "";
let allUsers = [];
let filteredUsers = [];

if (!token) {
    console.warn("No authentication token found in localStorage.");
}

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    loadUsers();
});

function setupEventListeners() {
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const sortFilter = document.getElementById("sortFilter");
    const confirmRequestBtn = document.getElementById("confirmRequestBtn");

    if (searchInput) searchInput.addEventListener("input", filterUsers);
    if (categoryFilter) categoryFilter.addEventListener("change", filterUsers);
    if (sortFilter) sortFilter.addEventListener("change", sortUsers);
    if (confirmRequestBtn) confirmRequestBtn.addEventListener("click", sendRequest);

    window.addEventListener("click", (e) => {
        const modal = document.getElementById("requestModal");
        if (e.target === modal) {
            closeModal();
        }
    });

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "index.html";
        });
    }
}

async function loadUsers() {
    const container = document.getElementById("usersContainer");
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/user/all`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to load users: ${response.statusText}`);
        }

        allUsers = await response.json();
        filteredUsers = [...allUsers];
        renderUsers(filteredUsers);
    } catch (error) {
        console.error("Error loading users:", error);
        container.innerHTML = 
            `<h2 style="color: #ef4444; grid-column: 1/-1; text-align: center;">Unable to load users. Please log in again.</h2>`;
    }
}

function renderUsers(users) {
    const container = document.getElementById("usersContainer");
    if (!container) return;

    container.innerHTML = "";

    const totalUsersEl = document.getElementById("totalUsers");
    if (totalUsersEl) {
        totalUsersEl.textContent = `${users.length} Users Found`;
    }

    if (users.length === 0) {
        container.innerHTML = `<h2 style="grid-column: 1/-1; text-align: center;">No users found.</h2>`;
        return;
    }

    users.forEach(user => {
        const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : "?";

        const teachSkills = (!user.teachSkills || user.teachSkills.length === 0)
            ? `<span class="teach-tag">No Skills</span>`
            : user.teachSkills.map(skill => `
                <span class="teach-tag">
                    <i class="fa-solid fa-code"></i> ${skill}
                </span>
            `).join("");

        const learnSkills = (!user.learnSkills || user.learnSkills.length === 0)
            ? `<span class="learn-tag">No Skills</span>`
            : user.learnSkills.map(skill => `
                <span class="learn-tag">
                    <i class="fa-solid fa-book-open"></i> ${skill}
                </span>
            `).join("");

        const rating = Number(user.rating || 0);
        let stars = "";
        for (let i = 1; i <= 5; i++) {
            stars += i <= Math.round(rating) ? "★" : "☆";
        }

        container.innerHTML += `
            <div class="user-card">
                <div class="user-header">
                    <div class="user-info">
                        <div class="avatar">${firstLetter}</div>
                        <div class="user-details">
                            <h3 class="user-name">${user.name || "Anonymous User"}</h3>
                            <p class="location">
                                <i class="fa-solid fa-location-dot"></i>
                                ${user.location || "Location not added"}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="section-title">SKILLS THEY TEACH</div>
                <div class="skill-list">${teachSkills}</div>

                <div class="section-title">WANTS TO LEARN</div>
                <div class="skill-list">${learnSkills}</div>

                <div class="card-footer">
                    <div class="rating">
                        ${stars}
                        <span>${rating.toFixed(1)} (${user.totalReviews || 0} reviews)</span>
                    </div>
                </div>

                <div class="card-buttons">
                    <button class="request-btn" onclick="openRequestModal('${user._id}')">
                        <i class="fa-regular fa-paper-plane"></i> Send Request
                    </button>
                    <button class="favorite-btn" title="Save Favorite">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
    });
}

function filterUsers() {
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");

    const keyword = searchInput ? searchInput.value.toLowerCase() : "";
    const category = categoryFilter ? categoryFilter.value : "All";

    filteredUsers = allUsers.filter(user => {
        const matchName = (user.name || "").toLowerCase().includes(keyword);
        const matchTeach = (user.teachSkills || []).some(skill => skill.toLowerCase().includes(keyword));
        const matchLearn = (user.learnSkills || []).some(skill => skill.toLowerCase().includes(keyword));

        const searchMatch = matchName || matchTeach || matchLearn;

        if (category === "All") {
            return searchMatch;
        }

        return searchMatch && user.category === category;
    });

    sortUsers();
}

function sortUsers() {
    const sortFilter = document.getElementById("sortFilter");
    const sort = sortFilter ? sortFilter.value : "Name";

    if (sort === "Name") {
        filteredUsers.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sort === "Most Skills") {
        filteredUsers.sort((a, b) => 
            ((b.teachSkills?.length || 0) + (b.learnSkills?.length || 0)) -
            ((a.teachSkills?.length || 0) + (a.learnSkills?.length || 0))
        );
    } else if (sort === "Highest Rated") {
        filteredUsers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === "Newest") {
        filteredUsers.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    renderUsers(filteredUsers);
}

window.openRequestModal = function(receiverId) {
    selectedReceiver = receiverId;
    const modal = document.getElementById("requestModal");
    if (modal) modal.style.display = "flex";
    loadSkillOptions(receiverId);
};

window.closeModal = function() {
    const modal = document.getElementById("requestModal");
    if (modal) modal.style.display = "none";
    selectedReceiver = "";
};

async function loadSkillOptions(targetUserId) {
    const teachSelect = document.getElementById("teachSkillSelect");
    const learnSelect = document.getElementById("learnSkillSelect");

    if (teachSelect) teachSelect.innerHTML = `<option disabled selected>Loading...</option>`;
    if (learnSelect) learnSelect.innerHTML = `<option disabled selected>Loading...</option>`;

    try {
        const myProfileRes = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!myProfileRes.ok) {
            throw new Error("Failed to load user profile skills.");
        }

        const myProfile = await myProfileRes.json();

        if (teachSelect) {
            teachSelect.innerHTML = "";
            if (myProfile.teachSkills && myProfile.teachSkills.length > 0) {
                myProfile.teachSkills.forEach(skill => {
                    teachSelect.innerHTML += `<option value="${skill}">${skill}</option>`;
                });
            } else {
                teachSelect.innerHTML = `<option disabled value="">No teaching skills listed in your profile</option>`;
            }
        }

        const targetUser = allUsers.find(u => u._id === targetUserId);

        if (learnSelect) {
            learnSelect.innerHTML = "";
            if (targetUser && targetUser.teachSkills && targetUser.teachSkills.length > 0) {
                targetUser.teachSkills.forEach(skill => {
                    learnSelect.innerHTML += `<option value="${skill}">${skill}</option>`;
                });
            } else {
                learnSelect.innerHTML = `<option disabled value="">Partner has no teaching skills listed</option>`;
            }
        }

    } catch (error) {
        console.error("Error populating modal skills:", error);
    }
}

async function sendRequest() {
    const teachSkillEl = document.getElementById("teachSkillSelect");
    const learnSkillEl = document.getElementById("learnSkillSelect");

    const teachSkill = teachSkillEl ? teachSkillEl.value : "";
    const learnSkill = learnSkillEl ? learnSkillEl.value : "";

    if (!selectedReceiver || !teachSkill || !learnSkill) {
        alert("Please select both a skill to teach and a skill to learn.");
        return;
    }

    // Payload keys matched strictly to backend Mongoose schema expectations
    const payload = {
        receiver: selectedReceiver,
        senderTeachSkill: teachSkill,
        senderLearnSkill: learnSkill
    };

    try {
        const response = await fetch(`${API_BASE_URL}/swaps/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to send skill swap request");
        }

        alert("Skill swap request sent successfully!");
        closeModal();

    } catch (error) {
        console.error("Request Error:", error);
        alert(error.message || "Failed to send request. Please try again.");
    }
}
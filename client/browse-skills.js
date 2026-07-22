const token = localStorage.getItem("token");
const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";

let selectedReceiver = "";
let allUsers = [];
let filteredUsers = [];

if (!token) window.location.href = "index.html";

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    loadUsers();
});

function setupEventListeners() {
    document.getElementById("searchInput")?.addEventListener("input", filterUsers);
    document.getElementById("categoryFilter")?.addEventListener("change", filterUsers);
    document.getElementById("sortFilter")?.addEventListener("change", sortUsers);
    document.getElementById("confirmRequestBtn")?.addEventListener("click", sendRequest);

    window.addEventListener("click", (e) => {
        if (e.target === document.getElementById("requestModal")) closeModal();
    });

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    });
}

async function loadUsers() {
    const container = document.getElementById("usersContainer");
    try {
        const response = await fetch(`${API_BASE_URL}/user/all`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        allUsers = await response.json();
        filteredUsers = [...allUsers];
        renderUsers(filteredUsers);
    } catch (error) {
        if (container) container.innerHTML = `<h2 style="color: red; text-align: center;">Unable to load users.</h2>`;
    }
}

function renderUsers(users) {
    const container = document.getElementById("usersContainer");
    if (!container) return;
    container.innerHTML = "";

    document.getElementById("totalUsers").textContent = `${users.length} Users Found`;

    users.forEach(user => {
        const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : "?";

        const teachSkills = (!user.teachSkills || user.teachSkills.length === 0)
            ? `<span class="teach-tag">No Skills</span>`
            : user.teachSkills.map(s => `<span class="teach-tag"><i class="fa-solid fa-code"></i> ${s}</span>`).join("");

        const learnSkills = (!user.learnSkills || user.learnSkills.length === 0)
            ? `<span class="learn-tag">No Skills</span>`
            : user.learnSkills.map(s => `<span class="learn-tag"><i class="fa-solid fa-book-open"></i> ${s}</span>`).join("");

        container.innerHTML += `
            <div class="user-card">
                <div class="user-header">
                    <div class="user-info">
                        <div class="avatar">${firstLetter}</div>
                        <div class="user-details">
                            <h3 class="user-name">${user.name || "Anonymous"}</h3>
                            <p class="location"><i class="fa-solid fa-location-dot"></i> ${user.location || "Location not added"}</p>
                        </div>
                    </div>
                </div>
                <div class="section-title">SKILLS THEY TEACH</div>
                <div class="skill-list">${teachSkills}</div>
                <div class="section-title">WANTS TO LEARN</div>
                <div class="skill-list">${learnSkills}</div>
                <div class="card-buttons" style="margin-top: 20px;">
                    <button class="request-btn" onclick="openRequestModal('${user._id}')">
                        <i class="fa-regular fa-paper-plane"></i> Send Request
                    </button>
                </div>
            </div>
        `;
    });
}

function filterUsers() {
    const keyword = document.getElementById("searchInput")?.value.toLowerCase() || "";
    const category = document.getElementById("categoryFilter")?.value || "All";

    filteredUsers = allUsers.filter(user => {
        const matchName = (user.name || "").toLowerCase().includes(keyword);
        const matchTeach = (user.teachSkills || []).some(s => s.toLowerCase().includes(keyword));
        const matchLearn = (user.learnSkills || []).some(s => s.toLowerCase().includes(keyword));
        const match = matchName || matchTeach || matchLearn;
        return category === "All" ? match : (match && user.category === category);
    });

    sortUsers();
}

function sortUsers() {
    const sort = document.getElementById("sortFilter")?.value || "Name";
    if (sort === "Name") filteredUsers.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else if (sort === "Highest Rated") filteredUsers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    renderUsers(filteredUsers);
}

window.openRequestModal = function(receiverId) {
    selectedReceiver = receiverId;
    document.getElementById("requestModal").style.display = "flex";
    loadSkillOptions(receiverId);
};

window.closeModal = function() {
    document.getElementById("requestModal").style.display = "none";
    selectedReceiver = "";
};

async function loadSkillOptions(targetUserId) {
    const teachSelect = document.getElementById("teachSkillSelect");
    const learnSelect = document.getElementById("learnSkillSelect");

    const myProfileRes = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const myProfile = await myProfileRes.json();

    teachSelect.innerHTML = (myProfile.teachSkills || []).map(s => `<option value="${s}">${s}</option>`).join("") || `<option disabled>No skills listed</option>`;
    
    const targetUser = allUsers.find(u => u._id === targetUserId);
    learnSelect.innerHTML = (targetUser?.teachSkills || []).map(s => `<option value="${s}">${s}</option>`).join("") || `<option disabled>Partner has no skills listed</option>`;
}

async function sendRequest() {
    const teachSkill = document.getElementById("teachSkillSelect")?.value;
    const learnSkill = document.getElementById("learnSkillSelect")?.value;

    if (!selectedReceiver || !teachSkill || !learnSkill) {
        alert("Please select both skills.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/swaps/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                receiver: selectedReceiver,
                teachSkill: teachSkill,
                learnSkill: learnSkill
            })
        });

        if (response.ok) {
            alert("Skill swap request sent!");
            closeModal();
        } else {
            alert("Failed to send request.");
        }
    } catch (e) {
        alert("Error sending request.");
    }
}
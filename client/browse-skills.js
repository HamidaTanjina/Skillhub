// ============================
// State & Initial Config
// ============================
const token = localStorage.getItem("token");
const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";

let selectedReceiver = "";
let allUsers = [];
let filteredUsers = [];

// Ensure user is authenticated before attempting operations
if (!token) {
    console.warn("No authentication token found in localStorage.");
}

// Initialize Page Data
loadUsers();

// ============================
// Event Listeners
// ============================
document.getElementById("searchInput").addEventListener("input", filterUsers);
document.getElementById("categoryFilter").addEventListener("change", filterUsers);
document.getElementById("sortFilter").addEventListener("change", sortUsers);
document.getElementById("confirmRequestBtn").addEventListener("click", sendRequest);

// Close modal when clicking outside modal box
window.addEventListener("click", (e) => {
    const modal = document.getElementById("requestModal");
    if (e.target === modal) {
        closeModal();
    }
});

// ============================
// Load Users
// ============================
async function loadUsers() {
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
        document.getElementById("usersContainer").innerHTML = 
            `<h2 style="color: #ef4444; grid-column: 1/-1; text-align: center;">Unable to load users. Please log in again.</h2>`;
    }
}

// ============================
// Render Users
// ============================
function renderUsers(users) {
    const container = document.getElementById("usersContainer");
    container.innerHTML = "";

    document.getElementById("totalUsers").textContent = `${users.length} Users Found`;

    if (users.length === 0) {
        container.innerHTML = `<h2 style="grid-column: 1/-1; text-align: center;">No users found.</h2>`;
        return;
    }

    users.forEach(user => {
        const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : "?";

        // Format Teach Skills
        const teachSkills = (!user.teachSkills || user.teachSkills.length === 0)
            ? `<span class="teach-tag">No Skills</span>`
            : user.teachSkills.map(skill => `
                <span class="teach-tag">
                    <i class="fa-solid fa-code"></i> ${skill}
                </span>
            `).join("");

        // Format Learn Skills
        const learnSkills = (!user.learnSkills || user.learnSkills.length === 0)
            ? `<span class="learn-tag">No Skills</span>`
            : user.learnSkills.map(skill => `
                <span class="learn-tag">
                    <i class="fa-solid fa-book-open"></i> ${skill}
                </span>
            `).join("");

        // Star Rating Generation
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

// ============================
// Filter Users
// ============================
function filterUsers() {
    const keyword = document.getElementById("searchInput").value.toLowerCase();
    const category = document.getElementById("categoryFilter").value;

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

// ============================
// Sort Users
// ============================
function sortUsers() {
    const sort = document.getElementById("sortFilter").value;

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

// ============================
// Modal & Swap Request Operations
// ============================
function openRequestModal(receiverId) {
    selectedReceiver = receiverId;
    document.getElementById("requestModal").style.display = "flex";
    loadSkillOptions();
}

function closeModal() {
    document.getElementById("requestModal").style.display = "none";
    selectedReceiver = "";
}

async function loadSkillOptions() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load user profile skills.");
        }

        const user = await response.json();
        const teachSelect = document.getElementById("teachSkillSelect");
        const learnSelect = document.getElementById("learnSkillSelect");

        teachSelect.innerHTML = "";
        learnSelect.innerHTML = "";

        if (user.teachSkills && user.teachSkills.length > 0) {
            user.teachSkills.forEach(skill => {
                teachSelect.innerHTML += `<option value="${skill}">${skill}</option>`;
            });
        } else {
            teachSelect.innerHTML = `<option disabled>No teaching skills listed</option>`;
        }

        if (user.learnSkills && user.learnSkills.length > 0) {
            user.learnSkills.forEach(skill => {
                learnSelect.innerHTML += `<option value="${skill}">${skill}</option>`;
            });
        } else {
            learnSelect.innerHTML = `<option disabled>No learning skills listed</option>`;
        }

    } catch (error) {
        console.error("Error populating modal skills:", error);
    }
}

async function sendRequest() {
    const teachSkill = document.getElementById("teachSkillSelect").value;
    const learnSkill = document.getElementById("learnSkillSelect").value;

    if (!selectedReceiver || !teachSkill || !learnSkill) {
        alert("Please select both a skill to teach and a skill to learn.");
        return;
    }

    const payload = {
        receiverId: selectedReceiver,
        offeredSkill: teachSkill,
        requestedSkill: learnSkill
    };

    try {
        const response = await fetch(`${API_BASE_URL}/request/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Failed to send skill swap request");
        }

        const result = await response.json();
        alert("Skill swap request sent successfully!");
        closeModal();

    } catch (error) {
        console.error("Request Error:", error);
        alert("Failed to send request. Please try again.");
    }
}
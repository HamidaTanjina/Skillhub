const token = localStorage.getItem("token");
const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";

if (!token) {
    window.location.href = "index.html";
}

let selectedReceiver = "";
let allUsers = [];
let filteredUsers = [];
let requestStatusMap = {};

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    loadUsers();
});

// ============================
// Setup Event Listeners
// ============================

function setupEventListeners() {

    document
        .getElementById("searchInput")
        .addEventListener("input", filterUsers);

    document
        .getElementById("categoryFilter")
        .addEventListener("change", filterUsers);

    document
        .getElementById("sortFilter")
        .addEventListener("change", sortUsers);

    document
        .getElementById("confirmRequestBtn")
        .addEventListener("click", sendRequest);

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", () => {

            localStorage.removeItem("token");

            window.location.href = "index.html";

        });

    }

    window.onclick = function (event) {

        const modal = document.getElementById("requestModal");

        if (event.target === modal) {

            closeModal();

        }

    };

}

// ============================
// Load Users
// ============================

async function loadUsers() {

    const container = document.getElementById("usersContainer");

    try {

        const response = await fetch(
            `${API_BASE_URL}/user/all`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            throw new Error("Failed to load users");

        }

        allUsers = await response.json();

        await loadRequestStatuses();

        filteredUsers = [...allUsers];

        renderUsers(filteredUsers);

    }

    catch (error) {

        console.log(error);

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-circle-exclamation"></i>

                <h2>Unable to load users</h2>

                <p>Please refresh the page.</p>

            </div>

        `;

    }

}

// ============================
// Load Existing Request Status
// ============================
// ============================
// Load Existing Request Status
// ============================
async function loadRequestStatuses() {

    requestStatusMap = {};

    try {

        const response = await fetch(
            `${API_BASE_URL}/swaps/sent`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            return;
        }

        const swaps = await response.json();

        swaps.forEach(swap => {

            const receiverId =
                swap.receiver._id || swap.receiver;

            requestStatusMap[receiverId] = swap.status;

        });

    }

    catch (error) {

        console.log(error);

    }

}
// ============================
// Render Users
// ============================

function renderUsers(users) {

    const container = document.getElementById("usersContainer");

    container.innerHTML = "";

    document.getElementById("totalUsers").textContent =
        `${users.length} Users Found`;

    if (users.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-users-slash"></i>

                <h2>No Users Found</h2>

                <p>Try another search.</p>

            </div>

        `;

        return;

    }

    users.forEach(user => {

        const firstLetter =
            user.name
                ? user.name.charAt(0).toUpperCase()
                : "?";

        const teachSkills =
            user.teachSkills && user.teachSkills.length > 0
                ? user.teachSkills.map(skill => `

                    <span class="teach-tag">

                        <i class="fa-solid fa-code"></i>

                        ${skill}

                    </span>

                `).join("")
                : `<span class="teach-tag">No Skills</span>`;

        const learnSkills =
            user.learnSkills && user.learnSkills.length > 0
                ? user.learnSkills.map(skill => `

                    <span class="learn-tag">

                        <i class="fa-solid fa-book-open"></i>

                        ${skill}

                    </span>

                `).join("")
                : `<span class="learn-tag">No Skills</span>`;

        const rating = Number(user.rating || 0);

        let stars = "";

        for (let i = 1; i <= 5; i++) {

            stars += i <= Math.round(rating)
                ? "★"
                : "☆";

        }

        // ==========================
        // Button State
        // ==========================

        let requestButton = "";

        if (requestStatusMap[user._id] === "Pending") {

            requestButton = `

                <button class="request-btn" disabled>

                    <i class="fa-solid fa-clock"></i>

                    Request Sent

                </button>

            `;

        }

        else if (requestStatusMap[user._id] === "Accepted") {

            requestButton = `

                <button class="request-btn active" disabled>

                    <i class="fa-solid fa-check"></i>

                    Active Swap

                </button>

            `;

        }

        else {

            requestButton = `

                <button
                    class="request-btn"
                    onclick="openRequestModal('${user._id}')">

                    <i class="fa-regular fa-paper-plane"></i>

                    Send Request

                </button>

            `;

        }

        container.innerHTML += `

<div class="user-card">

    <div class="user-header">

        <div class="user-info">

            <div class="avatar">

                ${firstLetter}

            </div>

            <div class="user-details">

                <h3 class="user-name">

                    ${user.name}

                </h3>

                <p class="location">

                    <i class="fa-solid fa-location-dot"></i>

                    ${user.location || "Location not added"}

                </p>

            </div>

        </div>

    </div>

    <div class="section-title">

        Skills They Teach

    </div>

    <div class="skill-list">

        ${teachSkills}

    </div>

    <div class="section-title">

        Wants To Learn

    </div>

    <div class="skill-list">

        ${learnSkills}

    </div>

    <div class="card-footer">

        <div class="rating">

            ${stars}

            <span>

                ${rating.toFixed(1)}
                (${user.totalReviews || 0} reviews)

            </span>

        </div>

    </div>

 <div class="card-buttons">

    ${requestButton}

    <button
        class="view-profile-btn"
        onclick="viewProfile('${user._id}')">

        <i class="fa-solid fa-user"></i>

        View Profile

    </button>


</div>

`;

    });

}
// ============================
// Filter Users
// ============================

function filterUsers() {

    const keyword =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();

    const category =
        document
            .getElementById("categoryFilter")
            .value;

    filteredUsers = allUsers.filter(user => {

        const matchName =
            (user.name || "")
                .toLowerCase()
                .includes(keyword);

        const matchTeach =
            (user.teachSkills || []).some(skill =>
                skill.toLowerCase().includes(keyword)
            );

        const matchLearn =
            (user.learnSkills || []).some(skill =>
                skill.toLowerCase().includes(keyword)
            );

        const searchMatch =
            matchName ||
            matchTeach ||
            matchLearn;

        if (category === "All") {

            return searchMatch;

        }

        return (

            searchMatch &&

            user.category === category

        );

    });

    sortUsers();

}

// ============================
// Sort Users
// ============================

function sortUsers() {

    const sort =
        document
            .getElementById("sortFilter")
            .value;

    if (sort === "Name") {

        filteredUsers.sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
        );

    }

    else if (sort === "Highest Rated") {

        filteredUsers.sort((a, b) =>
            (b.rating || 0) -
            (a.rating || 0)
        );

    }

    else if (sort === "Most Skills") {

        filteredUsers.sort((a, b) =>

            ((b.teachSkills?.length || 0) +
            (b.learnSkills?.length || 0))

            -

            ((a.teachSkills?.length || 0) +
            (a.learnSkills?.length || 0))

        );

    }

    else if (sort === "Newest") {

        filteredUsers.sort((a, b) =>

            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)

        );

    }

    renderUsers(filteredUsers);

}

// ============================
// Open Request Modal
// ============================

window.openRequestModal = function (receiverId) {

    selectedReceiver = receiverId;

    document.getElementById("requestModal").style.display = "flex";

    loadSkillOptions(receiverId);

};

// ============================
// Close Modal
// ============================

window.closeModal = function () {

    document.getElementById("requestModal").style.display = "none";

    selectedReceiver = "";

};

// ============================
// Load Skill Options
// ============================

async function loadSkillOptions(receiverId) {

    const teachSelect =
        document.getElementById("teachSkillSelect");

    const learnSelect =
        document.getElementById("learnSkillSelect");

    teachSelect.innerHTML = "";
    learnSelect.innerHTML = "";

    try {

        const myResponse = await fetch(

            `${API_BASE_URL}/user/profile`,

            {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );

        if (!myResponse.ok) {

            throw new Error("Unable to load profile");

        }

        const myProfile = await myResponse.json();

        if (

            myProfile.teachSkills &&

            myProfile.teachSkills.length > 0

        ) {

            myProfile.teachSkills.forEach(skill => {

                teachSelect.innerHTML += `

                    <option value="${skill}">

                        ${skill}

                    </option>

                `;

            });

        }

        else {

            teachSelect.innerHTML = `

                <option value="">

                    No Teaching Skills

                </option>

            `;

        }

        const receiver = allUsers.find(

            user => user._id === receiverId

        );

        if (

            receiver &&

            receiver.teachSkills &&

            receiver.teachSkills.length > 0

        ) {

            receiver.teachSkills.forEach(skill => {

                learnSelect.innerHTML += `

                    <option value="${skill}">

                        ${skill}

                    </option>

                `;

            });

        }

        else {

            learnSelect.innerHTML = `

                <option value="">

                    User has no teaching skills

                </option>

            `;

        }

    }

    catch (error) {

        console.log(error);

        alert("Unable to load skills.");

    }

}
// ============================
// Send Swap Request
// ============================

async function sendRequest() {

    const teachSkill =
        document.getElementById("teachSkillSelect").value;

    const learnSkill =
        document.getElementById("learnSkillSelect").value;

    if (!selectedReceiver) {

        alert("Please select a user.");

        return;

    }

    if (!teachSkill || !learnSkill) {

        alert("Please select both skills.");

        return;

    }

    try {

        const response = await fetch(

            `${API_BASE_URL}/swaps/send`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify({

                    receiver: selectedReceiver,

                    teachSkill,

                    learnSkill

                })

            }

        );

        const data = await response.json();

        if (!response.ok) {

            alert(data.message || "Failed to send request.");

            return;

        }

        alert("Skill Swap Request Sent Successfully!");

        closeModal();

        // Reload users and request status
        await loadUsers();

    }

    catch (error) {

        console.log(error);

        alert("Unable to send request.");

    }

}

// ============================
// Logout
// ============================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("token");

        window.location.href = "index.html";

    });

}
// ======================================================
// VIEW PROFILE
// ======================================================

async function viewProfile(userId) {

    const user = allUsers.find(
        user => user._id === userId
    );

    if (!user) {

        alert("User information not found.");

        return;

    }

    // ==============================
    // Basic User Information
    // ==============================

    const name = user.name || "Unknown User";

    document.getElementById("profileName").textContent = name;

    document.getElementById("profileLocation").innerHTML = `
        <i class="fa-solid fa-location-dot"></i>
        ${user.location || "Location not added"}
    `;

    document.getElementById("profileBio").textContent =
        user.bio || "No bio available.";

    document.getElementById("profileAvatar").textContent =
        name.charAt(0).toUpperCase();

    // ==============================
    // Show Modal
    // ==============================

    document.getElementById("profileModal").style.display = "flex";

    // ==============================
    // Loading State
    // ==============================

    document.getElementById("profileReviews").innerHTML = `
        <p class="no-reviews">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Loading reviews...
        </p>
    `;

    // ==============================
    // Load Reviews
    // ==============================

    try {

        const response = await fetch(
            `${API_BASE_URL}/reviews/user/${userId}`
        );

        const reviews = await response.json();

        if (!response.ok) {

            throw new Error(
                reviews.message || "Unable to load reviews"
            );

        }

        // ==============================
        // Calculate Rating
        // ==============================

        let totalRating = 0;

        reviews.forEach(review => {

            totalRating += Number(review.rating || 0);

        });

        const averageRating =
            reviews.length > 0
                ? totalRating / reviews.length
                : 0;

        // ==============================
        // Display Rating
        // ==============================

        let stars = "";

        for (let i = 1; i <= 5; i++) {

            stars +=
                i <= Math.round(averageRating)
                    ? "★"
                    : "☆";

        }

        document.getElementById("profileStars").textContent =
            stars;

        document.getElementById("profileRating").textContent =
            averageRating.toFixed(1);

        document.getElementById("profileReviewCount").textContent =
            `(${reviews.length} reviews)`;

        // ==============================
        // No Reviews
        // ==============================

        if (reviews.length === 0) {

            document.getElementById("profileReviews").innerHTML = `
                <div class="no-reviews">

                    <i class="fa-regular fa-star"></i>

                    <p>No reviews yet.</p>

                </div>
            `;

            return;

        }

        // ==============================
        // Display Reviews
        // ==============================

        let reviewsHTML = "";

        reviews.forEach(review => {

            const reviewerName =
                review.reviewer?.name || "Anonymous";

            let reviewStars = "";

            for (let i = 1; i <= 5; i++) {

                reviewStars +=
                    i <= Number(review.rating)
                        ? "★"
                        : "☆";

            }

            reviewsHTML += `

                <div class="review-item">

                    <div class="review-header">

                        <div>

                            <strong>
                                ${reviewerName}
                            </strong>

                            <div class="review-stars">

                                ${reviewStars}

                            </div>

                        </div>

                    </div>

                    <p class="review-comment">

                        ${review.comment}

                    </p>

                    ${
                        review.recommend
                            ? `
                                <span class="recommended">

                                    <i class="fa-solid fa-thumbs-up"></i>

                                    Recommended

                                </span>
                              `
                            : ""
                    }

                </div>

            `;

        });

        document.getElementById("profileReviews").innerHTML =
            reviewsHTML;

    }

    catch (error) {

        console.error("Review loading error:", error);

        document.getElementById("profileReviews").innerHTML = `

            <div class="no-reviews">

                <i class="fa-solid fa-circle-exclamation"></i>

                <p>
                    Unable to load reviews.
                </p>

            </div>

        `;

    }

}


// ======================================================
// CLOSE PROFILE MODAL
// ======================================================

function closeProfileModal() {

    document.getElementById("profileModal").style.display =
        "none";

}


// ======================================================
// CLOSE PROFILE MODAL WHEN CLICKING OUTSIDE
// ======================================================

window.addEventListener("click", function(event) {

    const modal =
        document.getElementById("profileModal");

    if (event.target === modal) {

        closeProfileModal();

    }

});
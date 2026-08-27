"use strict";


// ======================================================
// CONFIGURATION
// ======================================================

const token = localStorage.getItem("token");

const API_BASE_URL =
    "https://skillhub-backend-cths.onrender.com/api";


// ======================================================
// AUTHENTICATION
// ======================================================

// header.js already performs authentication.
// This fallback keeps this page safe if header.js
// is accidentally not loaded.

if (!token) {
    window.location.href = "index.html";
}


// ======================================================
// PAGE VARIABLES
// ======================================================

let selectedReceiver = "";

let allUsers = [];

let filteredUsers = [];

let requestStatusMap = {};


// ======================================================
// PAGE INITIALIZATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupEventListeners();

        loadUsers();

    }
);


// ======================================================
// SETUP PAGE EVENT LISTENERS
// ======================================================

function setupEventListeners() {

    // ----------------------------------------------
    // Search
    // ----------------------------------------------

    const searchInput =
        document.getElementById("searchInput");

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterUsers
        );

    }


    // ----------------------------------------------
    // Category Filter
    // ----------------------------------------------

    const categoryFilter =
        document.getElementById("categoryFilter");

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            filterUsers
        );

    }


    // ----------------------------------------------
    // Sort Filter
    // ----------------------------------------------

    const sortFilter =
        document.getElementById("sortFilter");

    if (sortFilter) {

        sortFilter.addEventListener(
            "change",
            sortUsers
        );

    }


    // ----------------------------------------------
    // Confirm Request
    // ----------------------------------------------

    const confirmRequestBtn =
        document.getElementById(
            "confirmRequestBtn"
        );

    if (confirmRequestBtn) {

        confirmRequestBtn.addEventListener(
            "click",
            sendRequest
        );

    }


    // ----------------------------------------------
    // Request Modal Outside Click
    // ----------------------------------------------

    const requestModal =
        document.getElementById(
            "requestModal"
        );

    if (requestModal) {

        requestModal.addEventListener(
            "click",
            event => {

                if (
                    event.target === requestModal
                ) {

                    closeModal();

                }

            }
        );

    }

}


// ======================================================
// LOAD USERS
// ======================================================

async function loadUsers() {

    const container =
        document.getElementById(
            "usersContainer"
        );


    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/user/all`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }

                }
            );


        // ------------------------------------------
        // Authentication expired
        // ------------------------------------------

        if (response.status === 401) {

            localStorage.removeItem("token");

            window.location.href =
                "index.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Failed to load users"
            );

        }


        allUsers =
            await response.json();


        // ------------------------------------------
        // Load existing request statuses
        // ------------------------------------------

        await loadRequestStatuses();


        filteredUsers =
            [...allUsers];


        renderUsers(
            filteredUsers
        );


    }

    catch (error) {

        console.error(
            "Load users error:",
            error
        );


        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-circle-exclamation"></i>

                <h2>Unable to load users</h2>

                <p>Please refresh the page.</p>

            </div>

        `;

    }

}


// ======================================================
// LOAD EXISTING REQUEST STATUS
// ======================================================

async function loadRequestStatuses() {

    requestStatusMap = {};


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/swaps/sent`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }

                }
            );


        if (!response.ok) {
            return;
        }


        const swaps =
            await response.json();


        swaps.forEach(
            swap => {

                const receiverId =
                    swap.receiver?._id ||
                    swap.receiver;


                if (receiverId) {

                    requestStatusMap[
                        receiverId
                    ] = swap.status;

                }

            }
        );

    }

    catch (error) {

        console.error(
            "Request status loading error:",
            error
        );

    }

}


// ======================================================
// RENDER USERS
// ======================================================

function renderUsers(users) {

    const container =
        document.getElementById(
            "usersContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const totalUsers =
        document.getElementById(
            "totalUsers"
        );


    if (totalUsers) {

        totalUsers.textContent =
            `${users.length} Users Found`;

    }


    // ----------------------------------------------
    // No users
    // ----------------------------------------------

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


    // ----------------------------------------------
    // Render users
    // ----------------------------------------------

    users.forEach(
        user => {

            const firstLetter =
                user.name
                    ? user.name
                        .charAt(0)
                        .toUpperCase()
                    : "?";


            // --------------------------------------
            // Teaching skills
            // --------------------------------------

            const teachSkills =
                user.teachSkills &&
                user.teachSkills.length > 0

                    ? user.teachSkills
                        .map(
                            skill => `

                                <span class="teach-tag">

                                    <i class="fa-solid fa-code"></i>

                                    ${escapeHTML(skill)}

                                </span>

                            `
                        )
                        .join("")

                    : `

                        <span class="teach-tag">

                            No Skills

                        </span>

                    `;


            // --------------------------------------
            // Learning skills
            // --------------------------------------

            const learnSkills =
                user.learnSkills &&
                user.learnSkills.length > 0

                    ? user.learnSkills
                        .map(
                            skill => `

                                <span class="learn-tag">

                                    <i class="fa-solid fa-book-open"></i>

                                    ${escapeHTML(skill)}

                                </span>

                            `
                        )
                        .join("")

                    : `

                        <span class="learn-tag">

                            No Skills

                        </span>

                    `;


            // --------------------------------------
            // Rating
            // --------------------------------------

            const rating =
                Number(
                    user.rating || 0
                );


            let stars = "";


            for (
                let i = 1;
                i <= 5;
                i++
            ) {

                stars +=
                    i <= Math.round(rating)
                        ? "★"
                        : "☆";

            }


            // --------------------------------------
            // Request button
            // --------------------------------------

            let requestButton = "";


            if (
                requestStatusMap[user._id] ===
                "Pending"
            ) {

                requestButton = `

                    <button
                        class="request-btn"
                        disabled
                    >

                        <i class="fa-solid fa-clock"></i>

                        Request Sent

                    </button>

                `;

            }

            else if (
                requestStatusMap[user._id] ===
                "Accepted"
            ) {

                requestButton = `

                    <button
                        class="request-btn active"
                        disabled
                    >

                        <i class="fa-solid fa-check"></i>

                        Active Swap

                    </button>

                `;

            }

            else {

                requestButton = `

                    <button
                        class="request-btn"
                        onclick="openRequestModal('${user._id}')"
                    >

                        <i class="fa-regular fa-paper-plane"></i>

                        Send Request

                    </button>

                `;

            }


            // --------------------------------------
            // User card
            // --------------------------------------

            container.innerHTML += `

                <div class="user-card">

                    <div class="user-header">

                        <div class="user-info">

                            <div class="avatar">

                                ${firstLetter}

                            </div>


                            <div class="user-details">

                                <h3 class="user-name">

                                    ${escapeHTML(
                                        user.name ||
                                        "Unknown User"
                                    )}

                                </h3>


                                <p class="location">

                                    <i class="fa-solid fa-location-dot"></i>

                                    ${escapeHTML(
                                        user.location ||
                                        "Location not added"
                                    )}

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
                            onclick="viewProfile('${user._id}')"
                        >

                            <i class="fa-solid fa-user"></i>

                            View Profile

                        </button>

                    </div>

                </div>

            `;

        }
    );

}


// ======================================================
// FILTER USERS
// ======================================================

function filterUsers() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    const keyword =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const category =
        categoryFilter
            ? categoryFilter.value
            : "All";


    filteredUsers =
        allUsers.filter(
            user => {

                const matchName =
                    (user.name || "")
                        .toLowerCase()
                        .includes(keyword);


                const matchTeach =
                    (user.teachSkills || [])
                        .some(
                            skill =>
                                skill
                                    .toLowerCase()
                                    .includes(keyword)
                        );


                const matchLearn =
                    (user.learnSkills || [])
                        .some(
                            skill =>
                                skill
                                    .toLowerCase()
                                    .includes(keyword)
                        );


                const searchMatch =
                    matchName ||
                    matchTeach ||
                    matchLearn;


                if (
                    category === "All"
                ) {

                    return searchMatch;

                }


                return (
                    searchMatch &&
                    user.category === category
                );

            }
        );


    sortUsers();

}


// ======================================================
// SORT USERS
// ======================================================

function sortUsers() {

    const sortFilter =
        document.getElementById(
            "sortFilter"
        );


    const sort =
        sortFilter
            ? sortFilter.value
            : "Newest";


    if (
        sort === "Name"
    ) {

        filteredUsers.sort(
            (a, b) =>
                (a.name || "")
                    .localeCompare(
                        b.name || ""
                    )
        );

    }

    else if (
        sort === "Highest Rated"
    ) {

        filteredUsers.sort(
            (a, b) =>
                (b.rating || 0) -
                (a.rating || 0)
        );

    }

    else if (
        sort === "Most Skills"
    ) {

        filteredUsers.sort(
            (a, b) => {

                const bSkills =
                    (b.teachSkills?.length || 0) +
                    (b.learnSkills?.length || 0);


                const aSkills =
                    (a.teachSkills?.length || 0) +
                    (a.learnSkills?.length || 0);


                return bSkills - aSkills;

            }
        );

    }

    else if (
        sort === "Newest"
    ) {

        filteredUsers.sort(
            (a, b) =>
                new Date(
                    b.createdAt || 0
                ) -
                new Date(
                    a.createdAt || 0
                )
        );

    }


    renderUsers(
        filteredUsers
    );

}


// ======================================================
// OPEN REQUEST MODAL
// ======================================================

window.openRequestModal =
    function (receiverId) {

        selectedReceiver =
            receiverId;


        const modal =
            document.getElementById(
                "requestModal"
            );


        if (modal) {

            modal.style.display =
                "flex";

        }


        loadSkillOptions(
            receiverId
        );

    };


// ======================================================
// CLOSE REQUEST MODAL
// ======================================================

window.closeModal =
    function () {

        const modal =
            document.getElementById(
                "requestModal"
            );


        if (modal) {

            modal.style.display =
                "none";

        }


        selectedReceiver = "";

    };


// ======================================================
// LOAD SKILL OPTIONS
// ======================================================

async function loadSkillOptions(
    receiverId
) {

    const teachSelect =
        document.getElementById(
            "teachSkillSelect"
        );


    const learnSelect =
        document.getElementById(
            "learnSkillSelect"
        );


    if (
        !teachSelect ||
        !learnSelect
    ) {

        return;

    }


    // --------------------------------------------------
    // Clear both dropdowns
    // --------------------------------------------------

    teachSelect.innerHTML = "";

    learnSelect.innerHTML = "";


    // --------------------------------------------------
    // Add placeholder to TEACH dropdown
    // --------------------------------------------------

    const teachPlaceholder =
        document.createElement(
            "option"
        );

    teachPlaceholder.value = "";

    teachPlaceholder.textContent =
        "Select a skill you can teach";

    teachPlaceholder.disabled = true;

    teachPlaceholder.selected = true;


    teachSelect.appendChild(
        teachPlaceholder
    );


    // --------------------------------------------------
    // Add placeholder to LEARN dropdown
    // --------------------------------------------------

    const learnPlaceholder =
        document.createElement(
            "option"
        );

    learnPlaceholder.value = "";

    learnPlaceholder.textContent =
        "Select a skill you want to learn";

    learnPlaceholder.disabled = true;

    learnPlaceholder.selected = true;


    learnSelect.appendChild(
        learnPlaceholder
    );


    try {

        // ------------------------------------------
        // Load current user's profile
        // ------------------------------------------

        const myResponse =
            await fetch(
                `${API_BASE_URL}/user/profile`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }

                }
            );


        if (!myResponse.ok) {

            throw new Error(
                "Unable to load profile"
            );

        }


        const myProfile =
            await myResponse.json();


        // ------------------------------------------
        // My teaching skills
        // ------------------------------------------

        if (
            myProfile.teachSkills &&
            myProfile.teachSkills.length > 0
        ) {

            myProfile.teachSkills.forEach(
                skill => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        skill;


                    option.textContent =
                        skill;


                    teachSelect.appendChild(
                        option
                    );

                }
            );

        }

        else {

            teachPlaceholder.textContent =
                "You have no teaching skills";

        }


        // ------------------------------------------
        // Receiver
        // ------------------------------------------

        const receiver =
            allUsers.find(
                user =>
                    user._id === receiverId
            );


        // ------------------------------------------
        // Receiver teaching skills
        // ------------------------------------------

        if (
            receiver &&
            receiver.teachSkills &&
            receiver.teachSkills.length > 0
        ) {

            receiver.teachSkills.forEach(
                skill => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        skill;


                    option.textContent =
                        skill;


                    learnSelect.appendChild(
                        option
                    );

                }
            );

        }

        else {

            learnPlaceholder.textContent =
                "User has no teaching skills";

        }


        // --------------------------------------------------
        // IMPORTANT:
        // Make sure neither dropdown automatically
        // selects the first actual skill.
        // --------------------------------------------------

        teachSelect.value = "";

        learnSelect.value = "";

    }

    catch (error) {

        console.error(
            "Skill loading error:",
            error
        );


        alert(
            "Unable to load skills."
        );

    }

}


// ======================================================
// SEND SWAP REQUEST
// ======================================================

async function sendRequest() {

    const teachSelect =
        document.getElementById(
            "teachSkillSelect"
        );


    const learnSelect =
        document.getElementById(
            "learnSkillSelect"
        );


    const teachSkill =
        teachSelect
            ? teachSelect.value
            : "";


    const learnSkill =
        learnSelect
            ? learnSelect.value
            : "";


    // ----------------------------------------------
    // Validate receiver
    // ----------------------------------------------

    if (!selectedReceiver) {

        alert(
            "Please select a user."
        );

        return;
    }


    // ----------------------------------------------
    // Validate skills
    // ----------------------------------------------

    if (
        !teachSkill ||
        !learnSkill
    ) {

        alert(
            "Please select both skills."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/swaps/send`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify({
                            receiver:
                                selectedReceiver,

                            teachSkill:
                                teachSkill,

                            learnSkill:
                                learnSkill
                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to send request."
            );

            return;
        }


        alert(
            "Skill Swap Request Sent Successfully!"
        );


        closeModal();


        // ------------------------------------------
        // Refresh users/request status
        // ------------------------------------------

        await loadUsers();


        // ------------------------------------------
        // Refresh shared header
        // ------------------------------------------

        if (
            typeof window.refreshHeader ===
            "function"
        ) {

            await window.refreshHeader();

        }

    }

    catch (error) {

        console.error(
            "Send request error:",
            error
        );


        alert(
            "Unable to send request."
        );

    }

}


// ======================================================
// VIEW PROFILE
// ======================================================

window.viewProfile =
    async function (userId) {

        const user =
            allUsers.find(
                user =>
                    user._id === userId
            );


        if (!user) {

            alert(
                "User information not found."
            );

            return;
        }


        // ------------------------------------------
        // Basic user information
        // ------------------------------------------

        const name =
            user.name ||
            "Unknown User";


        const profileName =
            document.getElementById(
                "profileName"
            );


        if (profileName) {

            profileName.textContent =
                name;

        }


        const profileLocation =
            document.getElementById(
                "profileLocation"
            );


        if (profileLocation) {

            profileLocation.innerHTML = `

                <i class="fa-solid fa-location-dot"></i>

                ${escapeHTML(
                    user.location ||
                    "Location not added"
                )}

            `;

        }


        const profileBio =
            document.getElementById(
                "profileBio"
            );


        if (profileBio) {

            profileBio.textContent =
                user.bio ||
                "No bio available.";

        }


        const profileAvatar =
            document.getElementById(
                "profileAvatar"
            );


        if (profileAvatar) {

            profileAvatar.textContent =
                name
                    .charAt(0)
                    .toUpperCase();

        }


        // ------------------------------------------
        // Show modal
        // ------------------------------------------

        const profileModal =
            document.getElementById(
                "profileModal"
            );


        if (profileModal) {

            profileModal.style.display =
                "flex";

        }


        // ------------------------------------------
        // Loading state
        // ------------------------------------------

        const profileReviews =
            document.getElementById(
                "profileReviews"
            );


        if (profileReviews) {

            profileReviews.innerHTML = `

                <p class="no-reviews">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Loading reviews...

                </p>

            `;

        }


        // ------------------------------------------
        // Load reviews
        // ------------------------------------------

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/reviews/user/${userId}`
                );


            const reviews =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    reviews.message ||
                    "Unable to load reviews"
                );

            }


            // --------------------------------------
            // Calculate rating
            // --------------------------------------

            let totalRating = 0;


            reviews.forEach(
                review => {

                    totalRating +=
                        Number(
                            review.rating || 0
                        );

                }
            );


            const averageRating =
                reviews.length > 0
                    ? totalRating /
                        reviews.length
                    : 0;


            // --------------------------------------
            // Display rating
            // --------------------------------------

            let stars = "";


            for (
                let i = 1;
                i <= 5;
                i++
            ) {

                stars +=
                    i <=
                    Math.round(
                        averageRating
                    )
                        ? "★"
                        : "☆";

            }


            const profileStars =
                document.getElementById(
                    "profileStars"
                );


            if (profileStars) {

                profileStars.textContent =
                    stars;

            }


            const profileRating =
                document.getElementById(
                    "profileRating"
                );


            if (profileRating) {

                profileRating.textContent =
                    averageRating.toFixed(1);

            }


            const profileReviewCount =
                document.getElementById(
                    "profileReviewCount"
                );


            if (profileReviewCount) {

                profileReviewCount.textContent =
                    `(${reviews.length} reviews)`;

            }


            // --------------------------------------
            // No reviews
            // --------------------------------------

            if (
                reviews.length === 0
            ) {

                if (profileReviews) {

                    profileReviews.innerHTML = `

                        <div class="no-reviews">

                            <i class="fa-regular fa-star"></i>

                            <p>No reviews yet.</p>

                        </div>

                    `;

                }

                return;
            }


            // --------------------------------------
            // Display reviews
            // --------------------------------------

            let reviewsHTML = "";


            reviews.forEach(
                review => {

                    const reviewerName =
                        review.reviewer?.name ||
                        "Anonymous";


                    let reviewStars = "";


                    for (
                        let i = 1;
                        i <= 5;
                        i++
                    ) {

                        reviewStars +=
                            i <=
                            Number(
                                review.rating
                            )
                                ? "★"
                                : "☆";

                    }


                    reviewsHTML += `

                        <div class="review-item">

                            <div class="review-header">

                                <div>

                                    <strong>

                                        ${escapeHTML(
                                            reviewerName
                                        )}

                                    </strong>


                                    <div class="review-stars">

                                        ${reviewStars}

                                    </div>

                                </div>

                            </div>


                            <p class="review-comment">

                                ${escapeHTML(
                                    review.comment ||
                                    ""
                                )}

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

                }
            );


            if (profileReviews) {

                profileReviews.innerHTML =
                    reviewsHTML;

            }

        }

        catch (error) {

            console.error(
                "Review loading error:",
                error
            );


            if (profileReviews) {

                profileReviews.innerHTML = `

                    <div class="no-reviews">

                        <i class="fa-solid fa-circle-exclamation"></i>

                        <p>

                            Unable to load reviews.

                        </p>

                    </div>

                `;

            }

        }

    };


// ======================================================
// CLOSE PROFILE MODAL
// ======================================================

window.closeProfileModal =
    function () {

        const modal =
            document.getElementById(
                "profileModal"
            );


        if (modal) {

            modal.style.display =
                "none";

        }

    };


// ======================================================
// CLOSE PROFILE MODAL ON OUTSIDE CLICK
// ======================================================

window.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById(
                "profileModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeProfileModal();

        }

    }
);


// ======================================================
// HTML ESCAPING
// ======================================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value);


    return div.innerHTML;

}
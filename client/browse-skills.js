"use strict";

const token = localStorage.getItem("token");

const API_BASE_URL =
    "https://skillhub-backend-cths.onrender.com/api";

if (!token) {
    window.location.href = "index.html";
}

let selectedReceiver = "";

let allUsers = [];

let filteredUsers = [];

let requestStatusMap = {};

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const highlightedUserId =
    urlParams.get("userId");

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupEventListeners();

        loadUsers();

    }
);

function setupEventListeners() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterUsers
        );

    }

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            filterUsers
        );

    }

    const sortFilter =
        document.getElementById(
            "sortFilter"
        );

    if (sortFilter) {

        sortFilter.addEventListener(
            "change",
            sortUsers
        );

    }

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

    const requestModal =
        document.getElementById(
            "requestModal"
        );

    if (requestModal) {

        requestModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    requestModal
                ) {

                    closeModal();

                }

            }
        );

    }

}

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

        if (response.status === 401) {

            localStorage.removeItem(
                "token"
            );

            window.location.href =
                "index.html";

            return;
        }

        if (!response.ok) {

            throw new Error(
                "Failed to load users"
            );

        }

        const users =
            await response.json();

        allUsers =
            Array.isArray(users)
                ? users
                : [];

        await loadRequestStatuses();

        filteredUsers =
            [...allUsers];

        filterUsers();

        if (highlightedUserId) {

            setTimeout(
                () => {

                    const userCard =
                        document.getElementById(
                            `user-card-${highlightedUserId}`
                        );

                    if (userCard) {

                        userCard.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                        userCard.style.outline =
                            "2px solid #3b82f6";

                        userCard.style.outlineOffset =
                            "4px";

                        setTimeout(
                            () => {

                                userCard.style.outline =
                                    "";

                                userCard.style.outlineOffset =
                                    "";

                            },
                            2500
                        );

                    }

                },
                100
            );

        }

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

        if (!Array.isArray(swaps)) {
            return;
        }

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

    users.forEach(
        user => {

            const firstLetter =
                user.name
                    ? user.name
                        .charAt(0)
                        .toUpperCase()
                    : "?";

            const teachSkills =
                Array.isArray(
                    user.teachSkills
                ) &&
                user.teachSkills.length > 0

                    ? user.teachSkills
                        .map(
                            skill => `

                                <span class="teach-tag">

                                    <i class="fa-solid fa-code"></i>

                                    ${escapeHTML(
                                        getSkillName(skill)
                                    )}

                                </span>

                            `
                        )
                        .join("")

                    : `

                        <span class="teach-tag">

                            No Skills

                        </span>

                    `;

            const learnSkills =
                Array.isArray(
                    user.learnSkills
                ) &&
                user.learnSkills.length > 0

                    ? user.learnSkills
                        .map(
                            skill => `

                                <span class="learn-tag">

                                    <i class="fa-solid fa-book-open"></i>

                                    ${escapeHTML(
                                        getSkillName(skill)
                                    )}

                                </span>

                            `
                        )
                        .join("")

                    : `

                        <span class="learn-tag">

                            No Skills

                        </span>

                    `;

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

            let requestButton = "";

            if (
                requestStatusMap[
                    user._id
                ] === "Pending"
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
                requestStatusMap[
                    user._id
                ] === "Accepted"
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
                        onclick="openRequestModal('${escapeAttribute(user._id)}')"
                    >

                        <i class="fa-regular fa-paper-plane"></i>

                        Send Request

                    </button>

                `;

            }

            container.innerHTML += `

                <div
                    class="user-card"
                    id="user-card-${escapeAttribute(user._id)}"
                >

                    <div class="user-header">

                        <div class="user-info">

                            <div class="avatar">

                                ${escapeHTML(
                                    firstLetter
                                )}

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
                            onclick="viewProfile('${escapeAttribute(user._id)}')"
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

    const selectedCategory =
        categoryFilter
            ? categoryFilter.value
                .trim()
                .toLowerCase()
            : "all";

    filteredUsers =
        allUsers.filter(
            user => {

                const userName =
                    String(
                        user.name || ""
                    ).toLowerCase();

                const teachSkills =
                    Array.isArray(
                        user.teachSkills
                    )
                        ? user.teachSkills
                        : [];

                const learnSkills =
                    Array.isArray(
                        user.learnSkills
                    )
                        ? user.learnSkills
                        : [];

                const matchName =
                    userName.includes(
                        keyword
                    );

                const matchTeach =
                    teachSkills.some(
                        skill =>
                            getSkillName(
                                skill
                            )
                                .toLowerCase()
                                .includes(
                                    keyword
                                )
                    );

                const matchLearn =
                    learnSkills.some(
                        skill =>
                            getSkillName(
                                skill
                            )
                                .toLowerCase()
                                .includes(
                                    keyword
                                )
                    );

                const searchMatch =
                    keyword === "" ||
                    matchName ||
                    matchTeach ||
                    matchLearn;

                const categoryMatch =
                    selectedCategory === "all" ||
                    userMatchesCategory(
                        user,
                        selectedCategory
                    );

                return (
                    searchMatch &&
                    categoryMatch
                );

            }
        );

    sortUsers();

}

function userMatchesCategory(
    user,
    selectedCategory
) {

    const normalizedSelected =
        normalizeCategory(
            selectedCategory
        );

    const teachingCategory =
        normalizeCategory(
            user.category
        );

    const learningCategory =
        normalizeCategory(
            user.learnCategory
        );

    return (
        teachingCategory ===
        normalizedSelected ||
        learningCategory ===
        normalizedSelected
    );

}

function normalizeCategory(
    category
) {

    return String(
        category || ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        );

}

function sortUsers() {

    const sortFilter =
        document.getElementById(
            "sortFilter"
        );

    const sort =
        sortFilter
            ? sortFilter.value
            : "Name";

    if (
        sort === "Name"
    ) {

        filteredUsers.sort(
            (a, b) =>
                String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    )
                )
        );

    }

    else if (
        sort === "Highest Rated"
    ) {

        filteredUsers.sort(
            (a, b) =>
                Number(
                    b.rating || 0
                ) -
                Number(
                    a.rating || 0
                )
        );

    }

    else if (
        sort === "Most Skills"
    ) {

        filteredUsers.sort(
            (a, b) => {

                const bTeach =
                    Array.isArray(
                        b.teachSkills
                    )
                        ? b.teachSkills.length
                        : 0;

                const bLearn =
                    Array.isArray(
                        b.learnSkills
                    )
                        ? b.learnSkills.length
                        : 0;

                const aTeach =
                    Array.isArray(
                        a.teachSkills
                    )
                        ? a.teachSkills.length
                        : 0;

                const aLearn =
                    Array.isArray(
                        a.learnSkills
                    )
                        ? a.learnSkills.length
                        : 0;

                return (
                    bTeach +
                    bLearn
                ) -
                (
                    aTeach +
                    aLearn
                );

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

    teachSelect.innerHTML = "";

    learnSelect.innerHTML = "";

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

        if (
            Array.isArray(
                myProfile.teachSkills
            ) &&
            myProfile.teachSkills.length > 0
        ) {

            myProfile.teachSkills.forEach(
                skill => {

                    const skillName =
                        getSkillName(
                            skill
                        );

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        skillName;

                    option.textContent =
                        skillName;

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

        const receiver =
            allUsers.find(
                user =>
                    user._id === receiverId
            );

        if (
            receiver &&
            Array.isArray(
                receiver.teachSkills
            ) &&
            receiver.teachSkills.length > 0
        ) {

            receiver.teachSkills.forEach(
                skill => {

                    const skillName =
                        getSkillName(
                            skill
                        );

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        skillName;

                    option.textContent =
                        skillName;

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

    if (!selectedReceiver) {

        alert(
            "Please select a user."
        );

        return;

    }

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

        await loadUsers();

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

        const profileModal =
            document.getElementById(
                "profileModal"
            );

        if (profileModal) {

            profileModal.style.display =
                "flex";

        }

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

            const reviewList =
                Array.isArray(
                    reviews
                )
                    ? reviews
                    : [];

            let totalRating = 0;

            reviewList.forEach(
                review => {

                    totalRating +=
                        Number(
                            review.rating ||
                            0
                        );

                }
            );

            const averageRating =
                reviewList.length > 0
                    ? totalRating /
                        reviewList.length
                    : 0;

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
                    `(${reviewList.length} reviews)`;

            }

            if (
                reviewList.length === 0
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

            let reviewsHTML = "";

            reviewList.forEach(
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

function getSkillName(
    skill
) {

    if (
        skill === null ||
        skill === undefined
    ) {

        return "";

    }

    if (
        typeof skill === "string"
    ) {

        return skill;

    }

    if (
        typeof skill === "object"
    ) {

        return String(
            skill.name ||
            skill.title ||
            skill.skill ||
            skill.value ||
            ""
        );

    }

    return String(
        skill
    );

}

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(
            value
        );

    return div.innerHTML;

}

function escapeAttribute(
    value
) {

    return String(
        value || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /'/g,
            "&#39;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}
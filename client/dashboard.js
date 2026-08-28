const token =
    localStorage.getItem("token");

const API_BASE_URL =
    "https://skillhub-backend-cths.onrender.com/api";


// ======================================================
// AUTHENTICATION
// ======================================================

if (!token) {

    window.location.href =
        "index.html";

}


// ======================================================
// INITIALIZE DASHBOARD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupDashboardNavigation();

        const cachedUser =
            getCachedUser();

        if (cachedUser) {

            renderDashboardProfile(
                cachedUser
            );

        }

        loadDashboardData(
            cachedUser
        );

    }
);


// ======================================================
// GET CACHED USER
// ======================================================

function getCachedUser() {

    try {

        const cachedUser =
            localStorage.getItem(
                "skillhubUser"
            );

        if (!cachedUser) {

            return null;

        }

        return JSON.parse(
            cachedUser
        );

    } catch (error) {

        console.warn(
            "Unable to read cached user:",
            error
        );

        return null;

    }

}


// ======================================================
// LOAD DASHBOARD DATA
// ======================================================

async function loadDashboardData(
    cachedUser = null
) {

    try {

        let user =
            cachedUser;


        // ==================================================
        // RENDER CACHED DATA IMMEDIATELY
        // ==================================================

        if (user) {

            renderDashboardProfile(
                user
            );

        }


        // ==================================================
        // FETCH FRESH CURRENT USER PROFILE
        // ==================================================

        const response =
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


        // --------------------------------------
        // Authentication Error
        // --------------------------------------

        if (response.status === 401) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "skillhubUser"
            );

            window.location.href =
                "index.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Failed to load profile."
            );

        }


        user =
            await response.json();


        // ==================================================
        // SAVE FRESH USER DATA
        // ==================================================

        try {

            localStorage.setItem(
                "skillhubUser",
                JSON.stringify(user)
            );

        } catch (storageError) {

            console.warn(
                "Unable to cache user:",
                storageError
            );

        }


        // ==================================================
        // UPDATE DASHBOARD WITH FRESH DATA
        // ==================================================

        renderDashboardProfile(
            user
        );


        // ==================================================
        // FETCH SWAPS
        // ==================================================

        try {

            const swapRes =
                await fetch(
                    `${API_BASE_URL}/swaps/my-requests`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            if (swapRes.status === 401) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "skillhubUser"
                );

                window.location.href =
                    "index.html";

                return;

            }


            if (swapRes.ok) {

                const swaps =
                    await swapRes.json();


                // --------------------------------------
                // Active Swaps
                // --------------------------------------

                const activeEl =
                    document.getElementById(
                        "activeSwaps"
                    );


                if (activeEl) {

                    activeEl.textContent =
                        swaps.filter(
                            swap => {

                                const status =
                                    String(
                                        swap.status || ""
                                    )
                                        .trim()
                                        .toLowerCase();


                                return (
                                    status === "accepted" ||
                                    status === "active"
                                );

                            }
                        ).length;

                }


                // --------------------------------------
                // Pending Requests
                // --------------------------------------

                const pendingEl =
                    document.getElementById(
                        "pendingRequests"
                    );


                if (pendingEl) {

                    pendingEl.textContent =
                        swaps.filter(
                            swap => {

                                const status =
                                    String(
                                        swap.status || ""
                                    )
                                        .trim()
                                        .toLowerCase();


                                return (
                                    status === "pending"
                                );

                            }
                        ).length;

                }


                // --------------------------------------
                // Completed Swaps
                // --------------------------------------

                const completedEl =
                    document.getElementById(
                        "completedSwaps"
                    );


                if (completedEl) {

                    completedEl.textContent =
                        swaps.filter(
                            swap => {

                                const status =
                                    String(
                                        swap.status || ""
                                    )
                                        .trim()
                                        .toLowerCase();


                                return (
                                    status === "completed"
                                );

                            }
                        ).length;

                }


                // --------------------------------------
                // Recent Activity
                // --------------------------------------

                renderRecentActivity(
                    swaps
                );

            }

        } catch (error) {

            console.warn(
                "Metrics/Activity unavailable:",
                error
            );

        }


        // ==================================================
        // SUGGESTED MATCHES
        // ==================================================

        await loadSuggestedMatches(
            user
        );


    } catch (error) {

        console.error(
            "Dashboard Load Error:",
            error
        );


        // ==================================================
        // FALLBACK TO CACHED USER
        // ==================================================

        if (cachedUser) {

            renderDashboardProfile(
                cachedUser
            );

        }

    }

}


// ======================================================
// RENDER DASHBOARD PROFILE
// ======================================================

function renderDashboardProfile(
    user
) {

    if (!user) {

        return;

    }


    // ==================================================
    // DASHBOARD PROFILE INITIAL
    // ==================================================

    const profileAvatar =
        document.querySelector(
            ".profile-card .profile-avatar"
        );


    if (profileAvatar) {

        const userName =
            (user.name || "").trim();


        const initial =
            userName
                ? userName
                    .charAt(0)
                    .toUpperCase()
                : "U";


        profileAvatar.innerHTML = `
            <span class="profile-initial">
                ${escapeHtml(initial)}
            </span>
        `;

    }


    // ==================================================
    // WELCOME MESSAGE
    // ==================================================

    const welcomeTitle =
        document.getElementById(
            "welcomeTopbar"
        );


    if (welcomeTitle) {

        welcomeTitle.textContent =
            user.name
                ? `Welcome Back ${user.name}`
                : "Welcome Back";

    }


    // ==================================================
    // PROFILE INFORMATION
    // ==================================================

    const profileName =
        document.getElementById(
            "profileName"
        );

    const profileEmail =
        document.getElementById(
            "profileEmail"
        );

    const profileLocation =
        document.getElementById(
            "profileLocation"
        );

    const profileBio =
        document.getElementById(
            "profileBio"
        );


    if (profileName) {

        profileName.textContent =
            user.name || "User";

    }


    if (profileEmail) {

        profileEmail.textContent =
            user.email || "";

    }


    if (profileLocation) {

        profileLocation.textContent =
            user.location ||
            "Add Location";

    }


    if (profileBio) {

        profileBio.textContent =
            user.bio ||
            "Tell everyone about yourself...";

    }


    // ==================================================
    // RATING & REVIEW COUNT
    // ==================================================

    const userRating =
        document.getElementById(
            "userRating"
        );

    const reviewCount =
        document.getElementById(
            "reviewCount"
        );

    const ratingStars =
        document.getElementById(
            "ratingStars"
        );


    const rating =
        Number(user.rating) || 0;

    const totalReviews =
        Number(user.totalReviews) || 0;


    if (userRating) {

        userRating.textContent =
            rating.toFixed(1);

    }


    if (reviewCount) {

        reviewCount.textContent =
            totalReviews;

    }


    if (ratingStars) {

        const stars =
            ratingStars.querySelectorAll(
                "i"
            );


        stars.forEach(
            (star, index) => {

                star.classList.remove(
                    "fa-solid",
                    "fa-regular"
                );


                if (
                    index <
                    Math.round(rating)
                ) {

                    star.classList.add(
                        "fa-solid"
                    );

                } else {

                    star.classList.add(
                        "fa-regular"
                    );

                }

            }
        );

    }


    // ==================================================
    // RENDER TEACH SKILLS
    // ==================================================

    const teachContainer =
        document.getElementById(
            "teachSkills"
        );


    if (teachContainer) {

        teachContainer.innerHTML =
            "";


        if (
            !user.teachSkills ||
            user.teachSkills.length === 0
        ) {

            teachContainer.innerHTML = `
                <span class="skills-loading-text">
                    No Skills Added
                </span>
            `;

        } else {

            user.teachSkills.forEach(
                skill => {

                    const skillElement =
                        document.createElement(
                            "span"
                        );


                    skillElement.className =
                        "skill-tag";


                    skillElement.textContent =
                        skill;


                    teachContainer.appendChild(
                        skillElement
                    );

                }
            );

        }

    }


    // ==================================================
    // RENDER LEARN SKILLS
    // ==================================================

    const learnContainer =
        document.getElementById(
            "learnSkills"
        );


    if (learnContainer) {

        learnContainer.innerHTML =
            "";


        if (
            !user.learnSkills ||
            user.learnSkills.length === 0
        ) {

            learnContainer.innerHTML = `
                <span class="skills-loading-text">
                    No Skills Added
                </span>
            `;

        } else {

            user.learnSkills.forEach(
                skill => {

                    const skillElement =
                        document.createElement(
                            "span"
                        );


                    skillElement.className =
                        "skill-tag";


                    skillElement.textContent =
                        skill;


                    learnContainer.appendChild(
                        skillElement
                    );

                }
            );

        }

    }


    // ==================================================
    // PROFILE COMPLETION
    // ==================================================

    let completion = 0;


    if (user.name) {

        completion += 20;

    }


    if (user.email) {

        completion += 20;

    }


    if (user.location) {

        completion += 20;

    }


    if (user.bio) {

        completion += 20;

    }


    if (
        user.teachSkills &&
        user.learnSkills &&
        user.teachSkills.length > 0 &&
        user.learnSkills.length > 0
    ) {

        completion += 20;

    }


    const compText =
        document.getElementById(
            "profileCompletion"
        );

    const progBar =
        document.getElementById(
            "progressBar"
        );


    if (compText) {

        compText.textContent =
            completion + "%";

    }


    if (progBar) {

        progBar.style.width =
            completion + "%";

    }

}


// ======================================================
// DASHBOARD NAVIGATION
// ======================================================

function setupDashboardNavigation() {

    // ==================================================
    // ACTIVE SWAPS CARD
    // ==================================================

    const blueCard =
        document.querySelector(
            ".overview-card.blue"
        );


    if (blueCard) {

        blueCard.addEventListener(
            "click",
            () => {

                openRequests(
                    "accepted"
                );

            }
        );

    }


    // ==================================================
    // PENDING / RECEIVED REQUESTS CARD
    // ==================================================

    const orangeCard =
        document.querySelector(
            ".overview-card.orange"
        );


    if (orangeCard) {

        orangeCard.addEventListener(
            "click",
            () => {

                openRequests(
                    "received"
                );

            }
        );

    }


    // ==================================================
    // COMPLETED SWAPS CARD
    // ==================================================

    const greenCard =
        document.querySelector(
            ".overview-card.green"
        );


    if (greenCard) {

        greenCard.addEventListener(
            "click",
            () => {

                openRequests(
                    "completed"
                );

            }
        );

    }


    // ==================================================
    // EDIT PROFILE
    // ==================================================

    const editProfileBtn =
        document.getElementById(
            "editProfileBtn"
        );


    if (editProfileBtn) {

        editProfileBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "profile.html";

            }
        );

    }


    // ==================================================
    // ADD SKILLS
    // ==================================================

    const addSkillsBtn =
        document.getElementById(
            "addSkillsBtn"
        );


    if (addSkillsBtn) {

        addSkillsBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "add-skills.html";

            }
        );

    }

}


// ======================================================
// SUGGESTED MATCHES
// ======================================================

async function loadSuggestedMatches(
    currentUser
) {

    const container =
        document.getElementById(
            "matchesContainer"
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

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Failed to load users."
            );

        }


        const allUsers =
            await response.json();


        // ==================================================
        // CURRENT USER SKILLS
        // ==================================================

        const myTeachSkills =
            normalizeSkills(
                currentUser.teachSkills
            );


        const myLearnSkills =
            normalizeSkills(
                currentUser.learnSkills
            );


        // ==================================================
        // EXCLUDE CURRENT USER
        // ==================================================

        const otherUsers =
            allUsers.filter(
                user =>
                    String(user._id) !==
                    String(currentUser._id)
            );


        if (otherUsers.length === 0) {

            container.innerHTML = `
                <p style="
                    color: var(--text-muted);
                    padding: 10px;
                ">
                    No matches found yet.
                </p>
            `;

            return;

        }


        // ==================================================
        // CALCULATE MATCH SCORE
        // ==================================================

        const scoredUsers =
            otherUsers.map(
                user => {

                    const theirTeachSkills =
                        normalizeSkills(
                            user.teachSkills
                        );


                    const theirLearnSkills =
                        normalizeSkills(
                            user.learnSkills
                        );


                    const teachMatch =
                        getCommonSkills(
                            myLearnSkills,
                            theirTeachSkills
                        );


                    const learnMatch =
                        getCommonSkills(
                            myTeachSkills,
                            theirLearnSkills
                        );


                    let score = 0;


                    score +=
                        teachMatch.length * 2;


                    score +=
                        learnMatch.length * 2;


                    if (
                        teachMatch.length > 0 &&
                        learnMatch.length > 0
                    ) {

                        score += 3;

                    }


                    const rating =
                        Number(user.rating) || 0;


                    score +=
                        rating * 0.1;


                    return {
                        user,
                        score,
                        teachMatch,
                        learnMatch
                    };

                }
            );


        // ==================================================
        // SORT
        // ==================================================

        scoredUsers.sort(
            (a, b) =>
                b.score - a.score
        );


        // ==================================================
        // ACTUAL SKILL MATCHES
        // ==================================================

        const matchedUsers =
            scoredUsers.filter(
                item =>
                    item.teachMatch.length > 0 ||
                    item.learnMatch.length > 0
            );


        // ==================================================
        // SELECT USERS
        // ==================================================

        let selectedUsers;


        if (matchedUsers.length > 0) {

            selectedUsers =
                matchedUsers.slice(0, 3);

        } else {

            selectedUsers =
                scoredUsers.slice(0, 3);

        }


        // ==================================================
        // RENDER
        // ==================================================

        container.innerHTML =
            "";


        selectedUsers.forEach(
            item => {

                const user =
                    item.user;


                const initial =
                    user.name &&
                    user.name.trim()
                        ? user.name
                            .trim()
                            .charAt(0)
                            .toUpperCase()
                        : "?";


                const teachList =
                    (
                        user.teachSkills ||
                        []
                    )
                        .slice(0, 3)
                        .map(
                            skill =>
                                `
                                <span class="skill-tag">
                                    ${escapeHtml(skill)}
                                </span>
                                `
                        )
                        .join("");


                const rating =
                    Number(
                        user.rating
                    ) || 0;


                const reviews =
                    Number(
                        user.totalReviews
                    ) || 0;


                let matchLabel =
                    "Suggested for you";


                if (
                    item.teachMatch.length > 0 &&
                    item.learnMatch.length > 0
                ) {

                    matchLabel =
                        "Great skill match";

                } else if (
                    item.teachMatch.length > 0
                ) {

                    matchLabel =
                        "Can teach you";

                } else if (
                    item.learnMatch.length > 0
                ) {

                    matchLabel =
                        "Can learn from you";

                }


                let matchSkills = "";


                if (
                    item.teachMatch.length > 0
                ) {

                    matchSkills += `
                        <span style="
                            color:#60a5fa;
                            font-size:11px;
                            margin-right:8px;
                        ">
                            Learn:
                            ${item.teachMatch
                                .slice(0, 2)
                                .map(
                                    skill =>
                                        escapeHtml(skill)
                                )
                                .join(", ")}
                        </span>
                    `;

                }


                if (
                    item.learnMatch.length > 0
                ) {

                    matchSkills += `
                        <span style="
                            color:#c084fc;
                            font-size:11px;
                        ">
                            Teach:
                            ${item.learnMatch
                                .slice(0, 2)
                                .map(
                                    skill =>
                                        escapeHtml(skill)
                                )
                                .join(", ")}
                        </span>
                    `;

                }


                const matchItem =
                    document.createElement(
                        "div"
                    );


                matchItem.id =
                    `suggested-user-${user._id}`;


                matchItem.style.cssText = `
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:16px;
                    padding:16px 0;
                    border-bottom:
                        1px solid
                        var(--border-color, #1f2937);
                `;


                matchItem.innerHTML = `

                    <div style="
                        display:flex;
                        align-items:center;
                        gap:12px;
                        min-width:0;
                    ">

                        <div style="
                            width:48px;
                            height:48px;
                            min-width:48px;
                            border-radius:50%;
                            background:
                                linear-gradient(
                                    135deg,
                                    #6366f1,
                                    #3b82f6
                                );
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-weight:700;
                            font-size:18px;
                            color:#fff;
                        ">

                            ${escapeHtml(initial)}

                        </div>


                        <div style="
                            min-width:0;
                        ">

                            <h4 style="
                                margin:0;
                                font-size:15px;
                                color:
                                    var(--text-main,
                                    #ffffff);
                            ">

                                ${escapeHtml(
                                    user.name ||
                                    "SkillHub User"
                                )}

                            </h4>


                            <div style="
                                margin-top:3px;
                                font-size:11px;
                                font-weight:600;
                                color:#60a5fa;
                            ">

                                ${matchLabel}

                            </div>


                            <div style="
                                margin-top:5px;
                                display:flex;
                                flex-wrap:wrap;
                                gap:5px;
                            ">

                                ${
                                    teachList ||
                                    `
                                    <span style="
                                        font-size:12px;
                                        color:
                                            var(--text-muted);
                                    ">
                                        No skills listed
                                    </span>
                                    `
                                }

                            </div>


                            <div style="
                                margin-top:5px;
                            ">

                                ${matchSkills}

                            </div>


                            <div style="
                                margin-top:5px;
                                font-size:12px;
                                color:
                                    var(--text-muted);
                            ">

                                <i
                                    class="fa-solid fa-star"
                                    style="
                                        color:#fbbf24;
                                    "
                                ></i>

                                ${rating.toFixed(1)}

                                (${reviews} Reviews)

                            </div>

                        </div>

                    </div>


                    <button
                        type="button"
                        style="
                            padding:7px 15px;
                            border-radius:20px;
                            border:
                                1px solid #3b82f6;
                            background:transparent;
                            color:#60a5fa;
                            cursor:pointer;
                            font-size:13px;
                            flex-shrink:0;
                        "
                    >
                        View
                    </button>

                `;


                const viewButton =
                    matchItem.querySelector(
                        "button"
                    );


                if (viewButton) {

                    viewButton.addEventListener(
                        "click",
                        () => {

                            window.location.href =
                                `browse-skills.html?userId=${encodeURIComponent(
                                    user._id
                                )}`;

                        }
                    );

                }


                container.appendChild(
                    matchItem
                );

            }
        );


    } catch (error) {

        console.warn(
            "Suggested matches failed:",
            error
        );


        container.innerHTML = `
            <p style="
                color:var(--text-muted);
                padding:10px;
            ">
                Unable to load suggested matches.
            </p>
        `;

    }

}


// ======================================================
// NORMALIZE SKILLS
// ======================================================

function normalizeSkills(
    skills
) {

    if (!Array.isArray(skills)) {

        return [];

    }


    return skills
        .filter(
            skill =>
                typeof skill === "string" &&
                skill.trim() !== ""
        )
        .map(
            skill =>
                skill
                    .trim()
                    .toLowerCase()
        );

}


// ======================================================
// FIND COMMON SKILLS
// ======================================================

function getCommonSkills(
    firstList,
    secondList
) {

    const secondSet =
        new Set(
            secondList
        );


    return [
        ...new Set(
            firstList.filter(
                skill =>
                    secondSet.has(skill)
            )
        )
    ];

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================================
// RECENT ACTIVITY
// ======================================================

function renderRecentActivity(
    swaps
) {

    const container =
        document.getElementById(
            "activityContainer"
        );


    if (!container) {

        return;

    }


    if (
        !Array.isArray(swaps) ||
        swaps.length === 0
    ) {

        container.innerHTML = `
            <p style="
                color: var(--text-muted);
                padding:10px;
            ">
                No recent activity.
            </p>
        `;

        return;

    }


    container.innerHTML =
        "";


    swaps
        .slice(0, 4)
        .forEach(
            swap => {

                const partner =
                    swap.receiver &&
                    typeof swap.receiver ===
                        "object"
                        ? swap.receiver
                        : swap.sender;


                const partnerName =
                    partner
                        ? partner.name
                        : "a user";


                const status =
                    swap.status ||
                    "Pending";


                container.innerHTML += `

                    <div style="
                        display:flex;
                        align-items:center;
                        gap:12px;
                        padding:12px 0;
                        border-bottom:
                            1px solid
                            var(--border-color,
                            #1f2937);
                    ">

                        <i
                            class="
                                fa-solid
                                fa-clock-rotate-left
                            "
                            style="
                                color:#60a5fa;
                                font-size:16px;
                            "
                        ></i>


                        <div style="
                            font-size:14px;
                            color:
                                var(--text-muted,
                                #94a3b8);
                        ">

                            Swap request with

                            <strong style="
                                color:
                                    var(--text-main,
                                    #ffffff);
                            ">

                                ${escapeHtml(
                                    partnerName
                                )}

                            </strong>

                            is currently

                            <span style="
                                color:#60a5fa;
                                font-weight:600;
                            ">

                                ${escapeHtml(
                                    status
                                )}

                            </span>.

                        </div>

                    </div>

                `;

            }
        );

}


// ======================================================
// OPEN REQUESTS PAGE
// ======================================================

function openRequests(
    tab
) {

    window.location.href =
        `request.html?tab=${tab}`;

}
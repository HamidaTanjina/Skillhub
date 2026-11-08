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
// --------------------------------------
// Learning Progress
// --------------------------------------

await loadLearningProgress(swaps);
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
                `${API_BASE_URL}/user/recommendations`,
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


        const selectedUsers = await response.json();

        if (!selectedUsers.length) {
            container.innerHTML = `
                <p style="color: var(--text-muted); padding: 10px;">
                    No mutual skill matches found yet.
                </p>`;
            return;
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

                                ${matchLabel} · ${Number(item.score || 0).toFixed(0)}% match

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

/* ======================================================
   LEARNING PROGRESS — DASHBOARD
====================================================== */

async function loadLearningProgress(swaps) {
    const container = document.getElementById(
        "learningProgressContainer"
    );

    if (!container) return;

    const acceptedSwaps = (Array.isArray(swaps) ? swaps : [])
        .filter(swap =>
            String(swap.status || "").trim().toLowerCase() === "accepted"
        );

    if (!acceptedSwaps.length) {
        container.innerHTML = `
            <p class="learning-progress-empty">
                No accepted skill exchanges yet. Accept a request
                to start tracking your learning goals.
            </p>`;
        return;
    }

    container.innerHTML = `
        <p class="learning-progress-empty">
            Loading your learning progress...
        </p>`;

    const results = await Promise.allSettled(
        acceptedSwaps.map(async swap => {
            const response = await fetch(
                `${API_BASE_URL}/swaps/${encodeURIComponent(swap._id)}/progress`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Could not load progress for swap ${swap._id}`);
            }

            const data = await response.json();

            return {
                swap,
                progress: data.progress || data
            };
        })
    );

    const cards = results
        .filter(result => result.status === "fulfilled")
        .map(result => result.value);

    if (!cards.length) {
        container.innerHTML = `
            <p class="learning-progress-empty">
                Progress could not be loaded. Please refresh and try again.
            </p>`;
        return;
    }

    container.innerHTML = cards.map(({ swap, progress }) => {
        const currentUser = getCachedUser() || {};
        const currentUserId = String(
            currentUser._id || currentUser.id || ""
        );

        const senderId = String(
            swap.sender?._id || swap.sender || ""
        );

        const receiverId = String(
            swap.receiver?._id || swap.receiver || ""
        );

        const partner =
            senderId === currentUserId
                ? swap.receiver
                : swap.sender;

        const partnerName =
            typeof partner === "object"
                ? partner?.name || "SkillHub partner"
                : "SkillHub partner";

        const goals = Array.isArray(progress.goals)
            ? progress.goals
            : [];

        const logs = Array.isArray(progress.sessionLogs)
            ? progress.sessionLogs
            : [];

        const percentage = Math.max(
            0,
            Math.min(100, Number(progress.progressPercentage) || 0)
        );

        const completedGoals = goals.filter(goal => goal.completed).length;
        const completedLogs = logs.filter(log => log.completed).length;

        return `
            <article class="learning-progress-item"
                     data-progress-swap="${escapeHtml(swap._id)}">

                <div class="learning-progress-heading">
                    <div>
                        <h3>${escapeHtml(swap.teachSkill || "Skill exchange")}
                            ↔ ${escapeHtml(swap.learnSkill || "Learning")}</h3>
                        <p>Learning with ${escapeHtml(partnerName)}</p>
                    </div>

                    <strong>${percentage}%</strong>
                </div>

                <div class="learning-progress-track">
                    <div class="learning-progress-fill"
                         style="width:${percentage}%"></div>
                </div>

                <p class="learning-progress-summary">
                    Goals completed: ${completedGoals}/${goals.length}
                    <span>·</span>
                    Sessions completed: ${completedLogs}/${logs.length}
                </p>

                <div class="learning-progress-subsection">
                    <h4>Learning goals</h4>

                    ${goals.length ? goals.map(goal => `
                        <label class="learning-progress-goal">
                            <input type="checkbox"
                                   data-goal-toggle="${escapeHtml(goal._id)}"
                                   ${goal.completed ? "checked" : ""}>
                            <span>${escapeHtml(goal.title)}</span>
                        </label>
                        ${goal.description ? `
                            <p class="learning-progress-note">
                                ${escapeHtml(goal.description)}
                            </p>` : ""}
                    `).join("") : `
                        <p class="learning-progress-empty">
                            No goals added yet.
                        </p>`}

                    <form data-goal-form="${escapeHtml(swap._id)}"
                          class="learning-progress-form">
                        <input name="title"
                               type="text"
                               maxlength="150"
                               placeholder="New learning goal"
                               required>
                        <input name="description"
                               type="text"
                               maxlength="500"
                               placeholder="Description (optional)">
                        <button type="submit">Add goal</button>
                    </form>
                </div>

                <div class="learning-progress-subsection">
                    <h4>Session log</h4>

                    ${logs.length ? logs.map(log => `
                        <div class="learning-progress-log">
                            <label>
                                <input type="checkbox"
                                       data-log-toggle="${escapeHtml(log._id)}"
                                       ${log.completed ? "checked" : ""}>
                                <strong>${escapeHtml(log.title)}</strong>
                            </label>
                            ${log.notes ? `
                                <p class="learning-progress-note">
                                    ${escapeHtml(log.notes)}
                                </p>` : ""}
                        </div>
                    `).join("") : `
                        <p class="learning-progress-empty">
                            No practice sessions logged yet.
                        </p>`}

                    <form data-log-form="${escapeHtml(swap._id)}"
                          class="learning-progress-form">
                        <input name="title"
                               type="text"
                               maxlength="150"
                               placeholder="Session title"
                               required>
                        <input name="notes"
                               type="text"
                               maxlength="1000"
                               placeholder="What did you practise?">
                        <button type="submit">Add log</button>
                    </form>
                </div>
            </article>`;
    }).join("");

    // Show errors for individual swaps without hiding working cards.
    const failedCount = results.filter(
        result => result.status === "rejected"
    ).length;

    if (failedCount) {
        container.insertAdjacentHTML(
            "beforeend",
            `<p class="learning-progress-empty">
                Progress could not be loaded for ${failedCount}
                exchange(s). Check the browser console for details.
            </p>`
        );
    }

    setupLearningProgressActions();
}


/* ======================================================
   LEARNING PROGRESS — FORM AND CHECKBOX ACTIONS
====================================================== */

function setupLearningProgressActions() {
    const container = document.getElementById(
        "learningProgressContainer"
    );

    if (!container || container.dataset.actionsReady === "true") {
        return;
    }

    container.dataset.actionsReady = "true";

    container.addEventListener("submit", async event => {
        const form = event.target.closest(
            "[data-goal-form], [data-log-form]"
        );

        if (!form) return;

        event.preventDefault();

        const swapId =
            form.dataset.goalForm || form.dataset.logForm;

        const isGoal = form.hasAttribute("data-goal-form");
        const submitButton = form.querySelector(
            'button[type="submit"]'
        );

        const formData = new FormData(form);

        const body = isGoal
            ? {
                title: String(formData.get("title") || "").trim(),
                description: String(formData.get("description") || "").trim()
            }
            : {
                title: String(formData.get("title") || "").trim(),
                notes: String(formData.get("notes") || "").trim(),
                completed: false
            };

        if (!body.title) return;

        if (submitButton) submitButton.disabled = true;

        try {
            const response = await fetch(
                `${API_BASE_URL}/swaps/${encodeURIComponent(swapId)}/progress/${isGoal ? "goals" : "session-logs"}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(body)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || data.error || "Unable to save."
                );
            }

            await refreshLearningProgressCard(swapId);
        } catch (error) {
            alert(error.message || "Unable to save your changes.");
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });

    container.addEventListener("change", async event => {
        const checkbox = event.target;

        const goalId = checkbox.dataset.goalToggle;
        const logId = checkbox.dataset.logToggle;

        if (!goalId && !logId) return;

        const card = checkbox.closest("[data-progress-swap]");
        if (!card) return;

        const swapId = card.dataset.progressSwap;
        const isGoal = Boolean(goalId);
        const itemId = goalId || logId;
        const completed = checkbox.checked;

        checkbox.disabled = true;

        try {
            const response = await fetch(
                `${API_BASE_URL}/swaps/${encodeURIComponent(swapId)}/progress/${isGoal ? "goals" : "session-logs"}/${encodeURIComponent(itemId)}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ completed })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || data.error || "Unable to update."
                );
            }

            await refreshLearningProgressCard(swapId);
        } catch (error) {
            checkbox.checked = !completed;
            alert(error.message || "Unable to update progress.");
        } finally {
            checkbox.disabled = false;
        }
    });
}


/* ======================================================
   REFRESH AFTER A GOAL OR LOG CHANGE
====================================================== */

async function refreshLearningProgressCard(swapId) {
    const response = await fetch(
        `${API_BASE_URL}/swaps/${encodeURIComponent(swapId)}/progress`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Saved, but progress could not be refreshed.");
    }

    const updatedProgress = await response.json();
    const container = document.getElementById(
        "learningProgressContainer"
    );

    if (!container) return;

    // Reload accepted swaps and render the latest saved values.
    const swapsResponse = await fetch(
        `${API_BASE_URL}/swaps/my-requests`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!swapsResponse.ok) {
        throw new Error("Could not reload your skill exchanges.");
    }

    const swaps = await swapsResponse.json();

    await loadLearningProgress(swaps);
}

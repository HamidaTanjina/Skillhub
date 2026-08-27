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

        loadDashboardData();

        setupDashboardNavigation();

    }
);


// ======================================================
// LOAD DASHBOARD DATA
// ======================================================

async function loadDashboardData() {

    try {

        // ==================================================
        // FETCH CURRENT USER PROFILE
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

            localStorage.removeItem("token");

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


        const user =
            await response.json();


        // ==================================================
        // WELCOME MESSAGE
        // ==================================================
        // HTML uses:
        // id="welcomeTopbar"
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
        // DASHBOARD PROFILE INFORMATION
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
        //
        // The backend /user/profile now returns:
        //
        // rating
        // totalReviews
        //
        // Example:
        //
        // {
        //     rating: 4.5,
        //     totalReviews: 6
        // }
        //
        // No need to call /user/all here because
        // /user/all intentionally excludes the current user.
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


        // --------------------------------------------------
        // DISPLAY RATING NUMBER
        // --------------------------------------------------

        if (userRating) {

            userRating.textContent =
                rating.toFixed(1);

        }


        // --------------------------------------------------
        // DISPLAY REVIEW COUNT
        // --------------------------------------------------

        if (reviewCount) {

            reviewCount.textContent =
                totalReviews;

        }


        // --------------------------------------------------
        // DISPLAY RATING STARS
        // --------------------------------------------------

        if (ratingStars) {

            const stars =
                ratingStars.querySelectorAll("i");


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
        // RENDER SKILLS I CAN TEACH
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
        // RENDER SKILLS I WANT TO LEARN
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
                            swap =>
                                swap.status ===
                                    "Accepted" ||
                                swap.status ===
                                    "Active"
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
                            swap =>
                                swap.status ===
                                "Pending"
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
                            swap =>
                                swap.status ===
                                "Completed"
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

            return;

        }


        const allUsers =
            await response.json();


        // --------------------------------------
        // Exclude Current User
        // --------------------------------------

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


        // --------------------------------------
        // Display Maximum 3 Users
        // --------------------------------------

        container.innerHTML =
            "";


        otherUsers
            .slice(0, 3)
            .forEach(
                user => {

                    const initial =
                        user.name
                            ? user.name
                                .charAt(0)
                                .toUpperCase()
                            : "?";


                    const teachList =
                        (user.teachSkills || [])
                            .slice(0, 3)
                            .map(
                                skill =>
                                    `<span class="skill-tag">
                                        ${skill}
                                    </span>`
                            )
                            .join(" ");


                    // --------------------------------------
                    // Rating
                    // --------------------------------------

                    const rating =
                        Number(
                            user.rating
                        ) || 0;


                    const reviews =
                        Number(
                            user.totalReviews
                        ) || 0;


                    container.innerHTML += `

                        <div style="
                            display:flex;
                            align-items:center;
                            justify-content:space-between;
                            padding:12px 0;
                            border-bottom:
                                1px solid
                                var(--border-color, #1f2937);
                        ">

                            <div style="
                                display:flex;
                                align-items:center;
                                gap:12px;
                            ">

                                <div style="
                                    width:42px;
                                    height:42px;
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
                                    font-weight:bold;
                                    color:#fff;
                                ">
                                    ${initial}
                                </div>


                                <div>

                                    <h4 style="
                                        margin:0;
                                        font-size:15px;
                                        color:
                                            var(--text-main,
                                            #ffffff);
                                    ">
                                        ${user.name ||
                                            "SkillHub User"}
                                    </h4>


                                    <div style="
                                        margin-top:4px;
                                    ">

                                        ${
                                            teachList ||
                                            `<span style="
                                                font-size:12px;
                                                color:
                                                    var(--text-muted);
                                            ">
                                                No skills listed
                                            </span>`
                                        }

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
                                onclick="
                                    window.location.href=
                                    'browse-skills.html'
                                "
                                style="
                                    padding:6px 14px;
                                    border-radius:20px;
                                    border:
                                        1px solid #3b82f6;
                                    background:transparent;
                                    color:#60a5fa;
                                    cursor:pointer;
                                    font-size:13px;
                                "
                            >
                                View
                            </button>

                        </div>

                    `;

                }
            );


    } catch (error) {

        console.warn(
            "Suggested matches failed:",
            error
        );

    }

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
                                ${partnerName}
                            </strong>

                            is currently

                            <span style="
                                color:#60a5fa;
                                font-weight:600;
                            ">
                                ${status}
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
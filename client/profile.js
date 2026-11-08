

const API_BASE_URL =
    "https://skillhub-backend-cths.onrender.com/api";
// ==========================================================
// GLOBAL USER
// ==========================================================

let token = null;
let currentUser = null;
let skillVerifications = [];

// ==========================================================
// HANDLE UNAUTHORIZED
// ==========================================================

function handleUnauthorized() {

    localStorage.removeItem("token");

    localStorage.removeItem("skillhubUser");

    window.location.href = "index.html";
}


// ==========================================================
// UPDATE PROFILE AVATAR INITIAL
// ==========================================================

function updateProfileAvatar(user) {

    const name =
        (user?.name || "").trim();

    const initial =
        name.charAt(0).toUpperCase();

    const profileAvatar =
        document.getElementById("profileAvatar");

    if (profileAvatar) {

        profileAvatar.innerHTML = "";

        if (initial) {

            profileAvatar.textContent =
                initial;

        } else {

            profileAvatar.textContent =
                "U";

        }

    }

}


// ==========================================================
// LOAD CACHED PROFILE IMMEDIATELY
// ==========================================================

function loadCachedProfile() {

    try {

        const cachedUser =
            localStorage.getItem(
                "skillhubUser"
            );

        if (!cachedUser) {

            return false;

        }

        const user =
            JSON.parse(cachedUser);

        if (!user || typeof user !== "object") {

            return false;

        }

        currentUser =
            user;

        updateProfileAvatar(user);

        updateProfileForm(user);

        updateProfileDisplay(user);

        return true;

    } catch (error) {

        console.warn(
            "Cached profile unavailable:",
            error
        );

        return false;

    }

}


function renderSkillOverview(user) {
    const container = document.getElementById("skillOverviewContainer");
    if (!container) return;

    container.replaceChildren();

    const levels = user.skillLevels || {};
    const teachingSkills = new Set(
    (Array.isArray(user.teachSkills) ? user.teachSkills : [])
        .map(skill => skill.trim().toLowerCase())
);

const verifiedSkills = new Set(
    skillVerifications
        .filter(item => item.status === "verified")
        .map(item => item.skillName.trim().toLowerCase())
);
   const skills = Array.isArray(user.teachSkills)
    ? user.teachSkills
    : [];
    const uniqueSkills = [
        ...new Map(
            skills
                .filter(skill => typeof skill === "string" && skill.trim())
                .map(skill => [skill.trim().toLowerCase(), skill.trim()])
        ).values()
    ];

    const profileSkillCount = document.getElementById("profileSkillCount");
    if (profileSkillCount) {
        profileSkillCount.textContent = uniqueSkills.length;
    }

    const profileExperience = document.getElementById("profileExperience");
    if (profileExperience) {
        profileExperience.textContent = Number(user.yearsExperience) || 0;
    }

    if (!uniqueSkills.length) {
        const message = document.createElement("p");
        message.className = "no-reviews";
        message.textContent = "Add teach or learn skills to see your skill overview.";
        container.appendChild(message);
        return;
    }

    uniqueSkills.slice(0, 8).forEach(skill => {
        const key = skill.toLowerCase();
        const saved = Number(levels[key]);
        const level = Number.isInteger(saved) && saved >= 1 && saved <= 3
            ? saved
            : saved >= 4 ? 3 : 2;

        const labels = {
            1: "Beginner",
            2: "Intermediate",
            3: "Advanced"
        };

        const row = document.createElement("div");
        row.className = "skill-overview-item";

        const top = document.createElement("div");
        top.className = "skill-overview-top";

      
const name = document.createElement("span");
name.className = "skill-overview-name";
name.textContent = skill;

const isVerified =
    teachingSkills.has(key) && verifiedSkills.has(key);

if (isVerified) {
    const verifiedBadge = document.createElement("span");

    verifiedBadge.className = "skill-verification-badge";
    verifiedBadge.textContent = "✓ Verified";
    verifiedBadge.title = "This teaching skill has been verified";

    verifiedBadge.style.cssText = `
        display: inline-flex;
        align-items: center;
        padding: 3px 8px;
        border-radius: 12px;
        background: #dcfce7;
        color: #166534;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
    `;

    top.append(name, verifiedBadge);
} else {
    top.appendChild(name);
}

const badge = document.createElement("span");
badge.className = `skill-level-badge ${labels[level].toLowerCase()}`;
badge.textContent = labels[level];

top.appendChild(badge);

        const progress = document.createElement("div");
        progress.className = "skill-progress";

        const fill = document.createElement("div");
        fill.className = "skill-progress-fill";
        fill.style.width = `${level / 3 * 100}%`;

        progress.appendChild(fill);
        row.append(top, progress);
        container.appendChild(row);
    });
}

// ==========================================================
// UPDATE PROFILE FORM
// ==========================================================


function renderSkillLevelInputs(user) {
    const container = document.getElementById("skillLevelsContainer");
    if (!container) return;

    container.replaceChildren();

    const skillLevels = user.skillLevels || {};

    // Only show skills that the user can teach.
    const teachingSkills = [
        ...new Map(
            (Array.isArray(user.teachSkills) ? user.teachSkills : [])
                .filter(skill => typeof skill === "string" && skill.trim())
                .map(skill => [skill.trim().toLowerCase(), skill.trim()])
        ).values()
    ];

    if (teachingSkills.length === 0) {
        const message = document.createElement("p");
        message.textContent = "Add teaching skills first to set your skill levels.";
        container.appendChild(message);
        return;
    }

    teachingSkills.forEach(skill => {
        const key = skill.toLowerCase();

        const row = document.createElement("div");
        row.className = "form-group skill-level-row";

        const label = document.createElement("label");
        label.textContent = skill;
        label.htmlFor = `skillLevel-${key}`;

        const select = document.createElement("select");
        select.id = `skillLevel-${key}`;
        select.dataset.skill = key;

        [
            ["1", "1 - Beginner"],
            ["2", "2 - Intermediate"],
            ["3", "3 - Advanced"]
        ].forEach(([value, text]) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = text;
            select.appendChild(option);
        });

        const savedLevel = Number(skillLevels[key]);

        select.value =
            Number.isInteger(savedLevel) && savedLevel >= 1 && savedLevel <= 3
                ? String(savedLevel)
                : "2";

        row.append(label, select);
        container.appendChild(row);
    });
}

function parseCommaSeparatedValues(value) {
    return [...new Set(
        value
            .split(",")
            .map(item => item.trim().toLowerCase())
            .filter(Boolean)
    )];
}
// ==========================================================
// UPDATE PROFILE FORM
// ==========================================================

function updateProfileForm(user) {
    const editName = document.getElementById("editName");
    const editEmail = document.getElementById("editEmail");
    const editLocation = document.getElementById("editLocation");
    const editBio = document.getElementById("editBio");

    if (editName) editName.value = user.name || "";
    if (editEmail) editEmail.value = user.email || "";
    if (editLocation) editLocation.value = user.location || "";
    if (editBio) editBio.value = user.bio || "";

    // Render skill levels using the latest profile data
    renderSkillLevelInputs(user);
   
    const experienceInput =
        document.getElementById("yearsExperience");

    if (experienceInput) {
        experienceInput.value =
            user.yearsExperience ?? "";
    }

    const availabilityInput =
        document.getElementById("availability");

    if (availabilityInput) {
        availabilityInput.value =
            Array.isArray(user.availability)
                ? user.availability.join(", ")
                : "";
    }

    const preferencesInput =
        document.getElementById("matchingPreferences");

    if (preferencesInput) {
        preferencesInput.value =
            Array.isArray(user.matchingPreferences)
                ? user.matchingPreferences.join(", ")
                : "";
    }

    console.log("Profile form populated:", {
        email: user.email,
        skillLevels: user.skillLevels,
        yearsExperience: user.yearsExperience,
        availability: user.availability,
        matchingPreferences: user.matchingPreferences
    });
}

// ==========================================================
// CACHE USER
// ==========================================================

function cacheUser(user) {

    try {

        localStorage.setItem(
            "skillhubUser",
            JSON.stringify(user)
        );

    } catch (error) {

        console.warn(
            "Unable to cache profile:",
            error
        );

    }

}


async function loadSkillVerifications() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/user/skills/verification`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to load skill verifications.");
        }

        const data = await response.json();

        skillVerifications = Array.isArray(data.verifications)
            ? data.verifications
            : [];

        // Refresh the skill overview with the latest statuses.
        if (currentUser) {
            renderSkillOverview(currentUser);
        }

    } catch (error) {
        console.error("Skill verification loading error:", error);
    }
}

// ==========================================================
// LOAD PROFILE
// ==========================================================

async function loadProfile() {

    try {

        const response = await fetch(
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

            handleUnauthorized();

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Failed to load profile."
            );

        }


        const user =
            await response.json();


        console.log(
            "Profile loaded:",
            user
        );


        currentUser =
            user;


        // ==================================================
        // CACHE LATEST USER
        // ==================================================

        cacheUser(user);


        // ==================================================
        // UPDATE PROFILE AVATAR
        // ==================================================

        updateProfileAvatar(user);


        // ==================================================
        // UPDATE FORM
        // ==================================================

        updateProfileForm(user);


        // ==================================================
        // UPDATE PROFILE DISPLAY
        // ==================================================

        updateProfileDisplay(user);


        // ==================================================
        // LOAD REVIEWS
        // ==================================================

        if (user._id) {

            await loadUserReviews(
                user._id
            );

        } else {

            renderReviews([]);

        }

    }


    catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        // Do not immediately replace the
        // already visible cached profile.

        if (!currentUser) {

            showProfileError(
                "Unable to load profile. Please try again."
            );

        }

    }

}


// ==========================================================
// UPDATE PROFILE DISPLAY
// ==========================================================

function updateProfileDisplay(user) {

    const name =
        user.name || "SkillHub User";


    const email =
        user.email || "No email";


    const location =
        user.location || "Add Location";


    const bio =
        user.bio ||
        "Tell everyone about yourself...";


    // ======================================================
    // PROFILE SUMMARY
    // ======================================================

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


    if (profileName) {

        profileName.textContent =
            name;

    }


    if (profileEmail) {

        profileEmail.textContent =
            email;

    }


    if (profileLocation) {

        profileLocation.textContent =
            location;

    }


    // ======================================================
    // ABOUT
    // ======================================================

    const aboutName =
        document.getElementById(
            "aboutName"
        );


    const aboutEmail =
        document.getElementById(
            "aboutEmail"
        );


    const aboutLocation =
        document.getElementById(
            "aboutLocation"
        );


    const aboutBio =
        document.getElementById(
            "aboutBio"
        );


    if (aboutName) {

        aboutName.textContent =
            name;

    }


    if (aboutEmail) {

        aboutEmail.textContent =
            email;

    }


    if (aboutLocation) {

        aboutLocation.textContent =
            location;

    }


    if (aboutBio) {

        aboutBio.textContent =
            bio;

    }


    // ======================================================
    // RATING
    // ======================================================

    updateRatingDisplay(
        user.rating || 0,
        user.totalReviews || 0
    );
    renderSkillOverview(user);

}


// ==========================================================
// UPDATE RATING
// ==========================================================

function updateRatingDisplay(
    rating,
    totalReviews
) {

    const numericRating =
        Number(rating) || 0;


    const numericReviews =
        Number(totalReviews) || 0;


    // ======================================================
    // RATING NUMBER
    // ======================================================

    const userRating =
        document.getElementById(
            "userRating"
        );


    if (userRating) {

        userRating.textContent =
            numericRating.toFixed(1);

    }


    // ======================================================
    // REVIEW COUNT
    // ======================================================

    const reviewCount =
        document.getElementById(
            "reviewCount"
        );


    if (reviewCount) {

        reviewCount.textContent =
            numericReviews;

    }


    // ======================================================
    // REVIEW SUMMARY
    // ======================================================

    const reviewSummary =
        document.getElementById(
            "reviewSummary"
        );


    if (reviewSummary) {

        reviewSummary.textContent =
            `${numericRating.toFixed(1)} · ${numericReviews} Reviews`;

    }


    // ======================================================
    // STARS
    // ======================================================

    renderStars(
        "ratingStars",
        numericRating
    );

}


// ==========================================================
// RENDER STARS
// ==========================================================

function renderStars(
    containerId,
    rating
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const numericRating =
        Number(rating) || 0;


    const roundedRating =
        Math.round(numericRating);


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        const star =
            document.createElement(
                "i"
            );


        if (
            i <= roundedRating
        ) {

            star.className =
                "fa-solid fa-star";

        } else {

            star.className =
                "fa-regular fa-star";

        }


        container.appendChild(
            star
        );

    }

}


// ==========================================================
// LOAD USER REVIEWS
// ==========================================================

async function loadUserReviews(
    userId
) {

    const container =
        document.getElementById(
            "reviewsContainer"
        );


    if (!container) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/reviews/user/${userId}`,
                {
                    method: "GET"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load reviews."
            );

        }


        const reviews =
            await response.json();


        console.log(
            "Reviews loaded:",
            reviews
        );


        renderReviews(
            reviews
        );


        // ==================================================
        // CALCULATE RATING FROM REVIEWS
        // ==================================================

        if (
            Array.isArray(reviews) &&
            reviews.length > 0
        ) {

            const total =
                reviews.reduce(
                    (sum, review) => {

                        return (
                            sum +
                            (
                                Number(
                                    review.rating
                                ) || 0
                            )
                        );

                    },
                    0
                );


            const average =
                total /
                reviews.length;


            updateRatingDisplay(
                average,
                reviews.length
            );

        }

    }


    catch (error) {

        console.error(
            "Review loading error:",
            error
        );


        container.innerHTML = `

            <div class="no-reviews">

                <i class="fa-solid fa-circle-exclamation"></i>

                <div>
                    Unable to load reviews.
                </div>

            </div>

        `;

    }

}


// ==========================================================
// RENDER REVIEWS
// ==========================================================

function renderReviews(
    reviews
) {

    const container =
        document.getElementById(
            "reviewsContainer"
        );


    if (!container) {

        return;

    }


    if (
        !Array.isArray(reviews) ||
        reviews.length === 0
    ) {

        container.innerHTML = `

            <div class="no-reviews">

                <i class="fa-regular fa-star"></i>

                <div>
                    No reviews yet.
                </div>

                <small>
                    Reviews will appear here after
                    completed skill exchanges.
                </small>

            </div>

        `;

        return;

    }


    container.innerHTML =
        "";


    reviews.forEach(
        review => {

            const reviewerName =
                review.reviewer &&
                review.reviewer.name
                    ? review.reviewer.name
                    : "SkillHub User";


            const initial =
                reviewerName
                    .charAt(0)
                    .toUpperCase();


            const rating =
                Number(
                    review.rating
                ) || 0;


            const comment =
                review.comment ||
                "No comment provided.";


            const date =
                formatReviewDate(
                    review.createdAt
                );


            const reviewItem =
                document.createElement(
                    "div"
                );


            reviewItem.className =
                "review-item";


            // ==================================================
            // STARS
            // ==================================================

            let starsHTML =
                "";


            for (
                let i = 1;
                i <= 5;
                i++
            ) {

                if (
                    i <= Math.round(
                        rating
                    )
                ) {

                    starsHTML += `
                        <i class="fa-solid fa-star"></i>
                    `;

                } else {

                    starsHTML += `
                        <i class="fa-regular fa-star"></i>
                    `;

                }

            }


            // ==================================================
            // RECOMMENDATION
            // ==================================================

            let recommendHTML =
                "";


            if (
                review.recommend === true
            ) {

                recommendHTML = `

                    <span class="recommend-badge">

                        <i class="fa-solid fa-thumbs-up"></i>

                        Recommends this user

                    </span>

                `;

            }


            // ==================================================
            // REVIEW HTML
            // ==================================================

            reviewItem.innerHTML = `

                <div class="review-top">

                    <div class="reviewer-info">

                        <div class="reviewer-avatar">

                            ${escapeHTML(
                                initial
                            )}

                        </div>


                        <div>

                            <div class="reviewer-name">

                                ${escapeHTML(
                                    reviewerName
                                )}

                            </div>


                            <span class="review-date">

                                ${escapeHTML(
                                    date
                                )}

                            </span>

                        </div>

                    </div>


                    <div class="review-rating">

                        ${starsHTML}

                        <span>

                            ${rating.toFixed(1)}

                        </span>

                    </div>

                </div>


                <p class="review-comment">

                    ${escapeHTML(
                        comment
                    )}

                </p>


                ${recommendHTML}

            `;


            container.appendChild(
                reviewItem
            );

        }
    );

}


// ==========================================================
// FORMAT REVIEW DATE
// ==========================================================

function formatReviewDate(
    date
) {

    if (!date) {

        return "";

    }


    const reviewDate =
        new Date(date);


    if (
        Number.isNaN(
            reviewDate.getTime()
        )
    ) {

        return "";

    }


    return reviewDate.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


// ==========================================================
// PROFILE ERROR
// ==========================================================

function showProfileError(
    message
) {

    const container =
        document.getElementById(
            "reviewsContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="no-reviews">

            <i class="fa-solid fa-circle-exclamation"></i>

            <div>

                ${escapeHTML(
                    message
                )}

            </div>

        </div>

    `;

}


// ==========================================================
// SAVE PROFILE
// ==========================================================

async function saveProfile() {

    const saveProfileBtn =
        document.getElementById(
            "saveProfileBtn"
        );


    const editName =
        document.getElementById(
            "editName"
        );


    const editLocation =
        document.getElementById(
            "editLocation"
        );


    const editBio =
        document.getElementById(
            "editBio"
        );


    const name =
        editName
            ? editName.value.trim()
            : "";


    const location =
        editLocation
            ? editLocation.value.trim()
            : "";


    const bio =
        editBio
            ? editBio.value.trim()
            : "";

const yearsExperienceInput = document.getElementById("yearsExperience");
const availabilityInput = document.getElementById("availability");
const preferencesInput = document.getElementById("matchingPreferences");

const yearsExperience = Number(yearsExperienceInput?.value ?? 0);

const skillLevels = {};
document.querySelectorAll("#skillLevelsContainer select[data-skill]")
    .forEach(select => {
        skillLevels[select.dataset.skill] = Number(select.value);
    });

const availability = parseCommaSeparatedValues(
    availabilityInput?.value || ""
);

const matchingPreferences = parseCommaSeparatedValues(
    preferencesInput?.value || ""
);


    // ======================================================
    // VALIDATION
    // ======================================================

    if (!name) {

        alert(
            "Name is required."
        );


        if (editName) {

            editName.focus();

        }


        return;

    }


if (
    !Number.isInteger(yearsExperience) ||
    yearsExperience < 0 ||
    yearsExperience > 80
) {
    alert("Years of experience must be a whole number between 0 and 80.");
    yearsExperienceInput?.focus();
    return;
}

    try {

        if (saveProfileBtn) {

            saveProfileBtn.disabled =
                true;


            saveProfileBtn.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

                Saving...

            `;

        }


        const response =
            await fetch(
                `${API_BASE_URL}/user/profile`,
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                   body: JSON.stringify({
    name,
    location,
    bio,
    skillLevels,
    yearsExperience,
    availability,
    matchingPreferences
})

                }
            );


        // ==================================================
        // AUTHENTICATION ERROR
        // ==================================================

        if (
            response.status === 401
        ) {

            handleUnauthorized();

            return;

        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update profile."
            );

        }


        console.log(
            "Profile updated:",
            data
        );


        currentUser =
            data;


        // ==================================================
        // IMPORTANT:
        // UPDATE CACHE IMMEDIATELY
        // ==================================================

        cacheUser(data);


        // ==================================================
        // UPDATE MAIN PROFILE AVATAR
        // ==================================================

        updateProfileAvatar(
            data
        );


        // ==================================================
        // UPDATE PROFILE PAGE
        // ==================================================

        updateProfileDisplay(
            data
        );


        // ==================================================
        // UPDATE FORM
        // ==================================================

        updateProfileForm(
            data
        );


        // ==================================================
        // REFRESH OTHER PAGE DATA
        // ==================================================

        if (
            typeof window.refreshHeader ===
            "function"
        ) {

            await window.refreshHeader();

        }


        alert(
            "Profile Updated Successfully!"
        );

    }


    catch (error) {

        console.error(
            "Profile update error:",
            error
        );


        alert(
            error.message ||
            "Something went wrong while updating your profile."
        );

    }


    finally {

        if (saveProfileBtn) {

            saveProfileBtn.disabled =
                false;


            saveProfileBtn.innerHTML = `

                <i class="fa-solid fa-floppy-disk"></i>

                Save Changes

            `;

        }

    }

}


// ==========================================================
// START PROFILE PAGE
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // -----------------------------------------------
        // AUTHENTICATION
        // -----------------------------------------------

        token =
            localStorage.getItem(
                "token"
            );


        if (!token) {

            window.location.href =
                "index.html";

            return;

        }


        // ==================================================
        // SHOW CACHED DATA FIRST
        // ==================================================

        loadCachedProfile();


        // ==================================================
        // SAVE BUTTON
        // ==================================================

        const saveProfileBtn =
            document.getElementById(
                "saveProfileBtn"
            );


        if (saveProfileBtn) {

            saveProfileBtn.addEventListener(
                "click",
                saveProfile
            );

        }


        // ==================================================
        // LOAD FRESH DATA IN BACKGROUND
        // ==================================================

       loadProfile();
loadSkillVerifications();
    }
);
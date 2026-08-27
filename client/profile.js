// ==========================================================
// SKILLHUB PROFILE PAGE
// ==========================================================


// ==========================================================
// API
// ==========================================================

const API_BASE_URL =
    "https://skillhub-backend-cths.onrender.com/api";


// ==========================================================
// GLOBAL USER
// ==========================================================

let token = null;
let currentUser = null;


// ==========================================================
// HANDLE UNAUTHORIZED
// ==========================================================

function handleUnauthorized() {

    localStorage.removeItem("token");

    window.location.href = "index.html";
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
                    Authorization: `Bearer ${token}`
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


        const user = await response.json();


        console.log(
            "Profile loaded:",
            user
        );


        currentUser = user;


        // ==================================================
        // EDIT FORM
        // ==================================================

        const editName =
            document.getElementById("editName");

        const editEmail =
            document.getElementById("editEmail");

        const editLocation =
            document.getElementById("editLocation");

        const editBio =
            document.getElementById("editBio");


        if (editName) {

            editName.value =
                user.name || "";
        }


        if (editEmail) {

            editEmail.value =
                user.email || "";
        }


        if (editLocation) {

            editLocation.value =
                user.location || "";
        }


        if (editBio) {

            editBio.value =
                user.bio || "";
        }


        // ==================================================
        // DISPLAY PROFILE
        // ==================================================

        updateProfileDisplay(user);


        // ==================================================
        // LOAD REVIEWS
        // ==================================================

        if (user._id) {

            await loadUserReviews(user._id);

        } else {

            renderReviews([]);
        }

    }

    catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        showProfileError(
            "Unable to load profile. Please try again."
        );
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


    container.innerHTML = "";


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
            document.createElement("i");


        if (i <= roundedRating) {

            star.className =
                "fa-solid fa-star";

        } else {

            star.className =
                "fa-regular fa-star";
        }


        container.appendChild(star);
    }
}


// ==========================================================
// LOAD USER REVIEWS
// ==========================================================

async function loadUserReviews(userId) {

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


        renderReviews(reviews);


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
                total / reviews.length;


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

function renderReviews(reviews) {

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


    container.innerHTML = "";


    reviews.forEach(review => {

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
            Number(review.rating) || 0;


        const comment =
            review.comment ||
            "No comment provided.";


        const date =
            formatReviewDate(
                review.createdAt
            );


        const reviewItem =
            document.createElement("div");


        reviewItem.className =
            "review-item";


        // ==================================================
        // STARS
        // ==================================================

        let starsHTML = "";


        for (
            let i = 1;
            i <= 5;
            i++
        ) {

            if (
                i <= Math.round(rating)
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

        let recommendHTML = "";


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

                        ${escapeHTML(initial)}

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

                ${escapeHTML(comment)}

            </p>


            ${recommendHTML}

        `;


        container.appendChild(
            reviewItem
        );

    });
}


// ==========================================================
// FORMAT REVIEW DATE
// ==========================================================

function formatReviewDate(date) {

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

function escapeHTML(value) {

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

function showProfileError(message) {

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

                ${escapeHTML(message)}

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


    try {

        if (saveProfileBtn) {

            saveProfileBtn.disabled = true;

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

                    body:
                        JSON.stringify({
                            name,
                            location,
                            bio
                        })
                }
            );


        // ==================================================
        // AUTHENTICATION ERROR
        // ==================================================

        if (response.status === 401) {

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
        // UPDATE PROFILE PAGE
        // ==================================================

        updateProfileDisplay(
            data
        );


        // ==================================================
        // UPDATE FORM
        // ==================================================

        if (editName) {

            editName.value =
                data.name || "";
        }


        if (editLocation) {

            editLocation.value =
                data.location || "";
        }


        if (editBio) {

            editBio.value =
                data.bio || "";
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

            saveProfileBtn.disabled = false;


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
            localStorage.getItem("token");


        if (!token) {

            window.location.href =
                "index.html";

            return;
        }


        // -----------------------------------------------
        // SAVE BUTTON
        // -----------------------------------------------

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


        // -----------------------------------------------
        // LOAD PROFILE
        // -----------------------------------------------

        loadProfile();

    }
);
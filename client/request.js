
// ======================================================
// API
// ======================================================

const API_BASE_URL =
   "https://skillhub-backend-cths.onrender.com/api";

// ======================================================
// AUTHENTICATION
// ======================================================


const token =
    localStorage.getItem("token");


// ======================================================
// REQUEST STATE
// ======================================================

let requestsData = [];

let currentReviewSwap = "";

let selectedRating = 0;


// ======================================================
// CURRENT TAB
// ======================================================

const params =
    new URLSearchParams(
        window.location.search
    );

let currentFilter =
    params.get("tab") || "sent";


// ======================================================
// PAGE INITIALIZATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupTabListeners();

        setupReviewStars();

        fetchRequests();

    }
);


// ======================================================
// AUTHORIZATION HEADER
// ======================================================

function getAuthHeaders(
    includeContentType = false
) {

    const headers = {
        Authorization: `Bearer ${token}`
    };


    if (includeContentType) {

        headers["Content-Type"] =
            "application/json";

    }


    return headers;

}


// ======================================================
// HANDLE UNAUTHORIZED REQUEST
// ======================================================


function handleRequestUnauthorized() {

    localStorage.removeItem("token");

    localStorage.removeItem(
        "skillhubUser"
    );

    window.location.href =
        "index.html";

}


// ======================================================
// Decode JWT
// ======================================================

function parseJwt(jwtToken) {

    try {

        if (!jwtToken) {
            return null;
        }


        const base64Url =
            jwtToken.split(".")[1];


        if (!base64Url) {
            return null;
        }


        const base64 =
            base64Url
                .replace(/-/g, "+")
                .replace(/_/g, "/");


        return JSON.parse(
            atob(base64)
        );

    }

    catch (error) {

        console.error(
            "JWT parsing error:",
            error
        );

        return null;

    }

}


// ======================================================
// FETCH ALL REQUESTS
// ======================================================

async function fetchRequests() {

    const container =
        document.getElementById(
            "requestContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <h2>
                Loading Requests...
            </h2>

        </div>

    `;


    try {

        // ----------------------------------------------
        // Check token
        // ----------------------------------------------

        if (!token) {

            handleRequestUnauthorized();

            return;

        }


        // ----------------------------------------------
        // API request
        // ----------------------------------------------

        const response =
            await fetch(
                `${API_BASE_URL}/swaps/my`,
                {
                    method: "GET",

                    headers:
                        getAuthHeaders()
                }
            );


        // ----------------------------------------------
        // Unauthorized
        // ----------------------------------------------

        if (
            response.status === 401
        ) {

            handleRequestUnauthorized();

            return;

        }


        // ----------------------------------------------
        // Parse response
        // ----------------------------------------------

        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load requests."
            );

        }


        // ----------------------------------------------
        // Current user from JWT
        // ----------------------------------------------

        const user =
            parseJwt(token);


        if (!user) {

            handleRequestUnauthorized();

            return;

        }


        const currentUserId =
            (
                user.id ||
                user._id ||
                ""
            ).toString();


        // ----------------------------------------------
        // Convert API data
        // ----------------------------------------------

        requestsData =
            Array.isArray(data)
                ? data.map(
                    item => {

                        const senderId =
                            (
                                item.sender?._id ||
                                item.sender ||
                                ""
                            ).toString();


                        const receiverId =
                            (
                                item.receiver?._id ||
                                item.receiver ||
                                ""
                            ).toString();


                        const isSender =
                            senderId ===
                            currentUserId;


                        const partner =
                            isSender
                                ? item.receiver
                                : item.sender;


                        return {

                            id:
                                item._id,

                            partnerName:
                                partner?.name ||
                                "Unknown User",

                            location:
                                partner?.location ||
                                "Location not added",

                            teachSkill:
                                item.teachSkill ||
                                "Not specified",

                            learnSkill:
                                item.learnSkill ||
                                "Not specified",

                            status:
                                item.status ||
                                "Pending",

                            isSender,

                            senderId,

                            receiverId,

                            senderCompleted:
                                Boolean(
                                    item.senderCompleted
                                ),

                            receiverCompleted:
                                Boolean(
                                    item.receiverCompleted
                                )

                        };

                    }
                )
                : [];


        // ----------------------------------------------
        // Render
        // ----------------------------------------------

        renderRequests(
            currentFilter
        );

    }

    catch (error) {

        console.error(
            "Request loading error:",
            error
        );


        container.innerHTML = `

            <div class="empty">

                <i class="fa-solid fa-circle-exclamation"></i>

                <h2>
                    Unable to load requests
                </h2>

                <p>
                    ${escapeHTML(
                        error.message ||
                        "Please try again later."
                    )}
                </p>

                <button
                    type="button"
                    onclick="refreshRequests()"
                >
                    <i class="fa-solid fa-rotate-right"></i>
                    Try Again
                </button>

            </div>

        `;

    }

}


// ======================================================
// RENDER REQUESTS
// ======================================================

function renderRequests(
    filter = "sent"
) {

    const container =
        document.getElementById(
            "requestContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    let filtered = [];


    // ==================================================
    // SENT
    // ==================================================

    if (filter === "sent") {

        filtered =
            requestsData.filter(
                request =>
                    request.isSender &&
                    request.status ===
                        "Pending"
            );

    }


    // ==================================================
    // RECEIVED
    // ==================================================

    else if (
        filter === "received"
    ) {

        filtered =
            requestsData.filter(
                request =>
                    !request.isSender &&
                    request.status ===
                        "Pending"
            );

    }


    // ==================================================
    // ACCEPTED
    // ==================================================

    else if (
        filter === "accepted"
    ) {

        filtered =
            requestsData.filter(
                request =>
                    request.status ===
                        "Accepted" ||
                    request.status ===
                        "Pending Confirmation"
            );

    }


    // ==================================================
    // COMPLETED
    // ==================================================

    else if (
        filter === "completed"
    ) {

        filtered =
            requestsData.filter(
                request =>
                    request.status ===
                    "Completed"
            );

    }


    // ==================================================
    // NO RESULTS
    // ==================================================

    if (filtered.length === 0) {

        container.innerHTML = `

            <div class="empty">

                <i class="fa-regular fa-folder-open"></i>

                <h2>
                    No Requests Found
                </h2>

                <p>
                    You don't have any requests
                    in this section yet.
                </p>

            </div>

        `;

        return;

    }


    // ==================================================
    // RENDER EACH REQUEST
    // ==================================================

    filtered.forEach(
        request => {

            let statusClass = "";

            let buttons = "";


            // ==================================================
            // PENDING
            // ==================================================

            if (
                request.status ===
                "Pending"
            ) {

                statusClass =
                    "pending";


                // ------------------------------------------
                // Sender
                // ------------------------------------------

                if (
                    request.isSender
                ) {

                    buttons = `

                        <button
                            class="pending-btn"
                            disabled
                        >

                            <i class="fa-solid fa-clock"></i>

                            Waiting...

                        </button>

                    `;

                }


                // ------------------------------------------
                // Receiver
                // ------------------------------------------

                else {

                    buttons = `

                        <button
                            class="accept-btn"
                            onclick="updateRequestStatus(
                                '${escapeAttribute(request.id)}',
                                'accept'
                            )"
                        >

                            <i class="fa-solid fa-check"></i>

                            Accept

                        </button>


                        <button
                            class="reject-btn"
                            onclick="updateRequestStatus(
                                '${escapeAttribute(request.id)}',
                                'reject'
                            )"
                        >

                            <i class="fa-solid fa-xmark"></i>

                            Reject

                        </button>

                    `;

                }

            }


            // ==================================================
            // ACCEPTED
            // ==================================================

            else if (
                request.status ===
                "Accepted"
            ) {

                statusClass =
                    "accepted";


             
buttons = `
  <button class="chat-btn" onclick="openChat('${escapeAttribute(request.id)}')">
    <i class="fa-solid fa-comments"></i> Chat
  </button>

  <button class="schedule-session-btn" onclick="openScheduleSession('${escapeAttribute(request.id)}')">
    <i class="fa-solid fa-calendar-plus"></i> Schedule Session
  </button>

  <button class="complete-btn" onclick="openReview('${escapeAttribute(request.id)}')">
    <i class="fa-solid fa-circle-check"></i> Complete Swap
  </button>
`;


            }


            // ==================================================
            // PENDING CONFIRMATION
            // ==================================================

            else if (
                request.status ===
                "Pending Confirmation"
            ) {

                statusClass =
                    "pending";


                buttons = `

                    <button
                        class="chat-btn"
                        onclick="openChat(
                            '${escapeAttribute(request.id)}'
                        )"
                    >

                        <i class="fa-solid fa-comments"></i>

                        Chat

                    </button>

                `;


                // ------------------------------------------
                // Check whether current user completed
                // ------------------------------------------

                const currentUserAlreadyReviewed =
                    request.isSender
                        ? request.senderCompleted
                        : request.receiverCompleted;


                // ------------------------------------------
                // Already submitted
                // ------------------------------------------

                if (
                    currentUserAlreadyReviewed
                ) {

                    buttons += `

                        <button
                            class="pending-btn"
                            disabled
                        >

                            <i class="fa-solid fa-clock"></i>

                            Waiting for partner confirmation

                        </button>

                    `;

                }


                // ------------------------------------------
                // Not submitted
                // ------------------------------------------

                else {

                    buttons += `

                        <button
                            class="complete-btn"
                            onclick="openReview(
                                '${escapeAttribute(request.id)}'
                            )"
                        >

                            <i class="fa-solid fa-circle-check"></i>

                            Complete Swap

                        </button>

                    `;

                }

            }


            // ==================================================
            // COMPLETED
            // ==================================================

            else if (
                request.status ===
                "Completed"
            ) {

                statusClass =
                    "completed";


                buttons = `

                    <button
                        class="completed-btn"
                        disabled
                    >

                        <i class="fa-solid fa-check-double"></i>

                        Swap Completed

                    </button>

                `;

            }


            // ==================================================
            // REJECTED / OTHER
            // ==================================================

            else {

                statusClass =
                    "rejected";


                buttons = `

                    <button
                        class="rejected-btn"
                        disabled
                    >

                        <i class="fa-solid fa-ban"></i>

                        Request Rejected

                    </button>

                `;

            }


            // ==================================================
            // AVATAR
            // ==================================================

            const partnerName =
                request.partnerName ||
                "SkillHub User";


            const avatar =
                partnerName
                    .charAt(0)
                    .toUpperCase();


            // ==================================================
            // REQUEST TYPE
            // ==================================================

            const requestType =
                request.isSender
                    ? "Sent To"
                    : "Received From";


            // ==================================================
            // CREATE CARD
            // ==================================================

            const requestCard =
                document.createElement(
                    "div"
                );


            requestCard.className =
                "request-card";


            requestCard.innerHTML = `

                <div class="request-header">

                    <div class="user-info">

                        <div class="avatar">
                            ${escapeHTML(
                                avatar
                            )}
                        </div>


                        <div>

                            <p class="request-type">
                                ${escapeHTML(
                                    requestType
                                )}
                            </p>


                            <h3>
                                ${escapeHTML(
                                    partnerName
                                )}
                            </h3>


                            <p class="location">

                                <i class="fa-solid fa-location-dot"></i>

                                ${escapeHTML(
                                    request.location ||
                                    "Location not added"
                                )}

                            </p>

                        </div>

                    </div>


                    <div
                        class="status ${statusClass}"
                    >

                        <i class="fa-solid fa-circle"></i>

                        ${escapeHTML(
                            request.status
                        )}

                    </div>

                </div>


                <hr>


                <div class="skill-row">


                    <div class="skill-item">

                        <span class="label">
                            Teaching
                        </span>


                        <span class="skill">

                            <i class="fa-solid fa-graduation-cap"></i>

                            ${escapeHTML(
                                request.teachSkill
                            )}

                        </span>

                    </div>


                    <i
                        class="fa-solid fa-arrow-right-arrow-left swap-icon"
                    ></i>


                    <div class="skill-item">

                        <span class="label">
                            Learning
                        </span>


                        <span class="skill learn">

                            <i class="fa-solid fa-lightbulb"></i>

                            ${escapeHTML(
                                request.learnSkill
                            )}

                        </span>

                    </div>

                </div>


                <div class="request-actions">

                    ${buttons}

                </div>

            `;


            container.appendChild(
                requestCard
            );

        }
    );

}


// ======================================================
// UPDATE REQUEST STATUS
// ======================================================

async function updateRequestStatus(
    id,
    action
) {

    if (!id) {

        alert(
            "Invalid request."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/swaps/${encodeURIComponent(id)}/${action}`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders()
                }
            );


        if (
            response.status === 401
        ) {

            handleRequestUnauthorized();

            return;

        }


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to update request."
            );

            return;

        }


        // ----------------------------------------------
        // Refresh request list
        // ----------------------------------------------

        await fetchRequests();


        // ----------------------------------------------
        // IMPORTANT:
        // Refresh shared header
        // ----------------------------------------------
        // Accept/reject can create notifications.
        // This makes notification badge/dropdown update
        // immediately.
        // ----------------------------------------------

        if (
            typeof window.refreshHeader ===
            "function"
        ) {

            await window.refreshHeader();

        }


        alert(
            data.message ||
            "Request updated successfully."
        );

    }

    catch (error) {

        console.error(
            "Request status update error:",
            error
        );


        alert(
            "Something went wrong."
        );

    }

}


// ======================================================
// TAB NAVIGATION
// ======================================================

function setupTabListeners() {

    const tabs =
        document.querySelectorAll(
            ".tab-btn"
        );


    tabs.forEach(
        tab => {

            if (
                tab.dataset.tab ===
                currentFilter
            ) {

                tab.classList.add(
                    "active"
                );

            }

            else {

                tab.classList.remove(
                    "active"
                );

            }

        }
    );


    tabs.forEach(
        tab => {

            tab.addEventListener(
                "click",
                () => {

                    tabs.forEach(
                        button =>
                            button.classList.remove(
                                "active"
                            )
                    );


                    tab.classList.add(
                        "active"
                    );


                    currentFilter =
                        tab.dataset.tab ||
                        "sent";


                    const url =
                        new URL(
                            window.location.href
                        );


                    url.searchParams.set(
                        "tab",
                        currentFilter
                    );


                    window.history.replaceState(
                        {},
                        "",
                        url
                    );


                    renderRequests(
                        currentFilter
                    );

                }
            );

        }
    );

}


// ======================================================
// REFRESH REQUESTS
// ======================================================

function refreshRequests() {

    fetchRequests();

}


// ======================================================
// GET STATUS CLASS
// ======================================================

function getStatusClass(
    status
) {

    switch (status) {

        case "Pending":
            return "pending";

        case "Accepted":
            return "accepted";

        case "Pending Confirmation":
            return "pending";

        case "Completed":
            return "completed";

        case "Rejected":
            return "rejected";

        default:
            return "";

    }

}


// ======================================================
// OPEN CHAT
// ======================================================

function openChat(
    swapId
) {

    if (!swapId) {

        alert(
            "Invalid swap."
        );

        return;

    }


    window.location.href =
        `chat.html?swapId=${encodeURIComponent(
            swapId
        )}`;

}


// ======================================================
// REVIEW MODAL
// ======================================================

function openReview(
    swapId
) {

    if (!swapId) {

        alert(
            "Invalid swap."
        );

        return;

    }


    currentReviewSwap =
        swapId;


    selectedRating =
        0;


    // ----------------------------------------------
    // Reset stars
    // ----------------------------------------------

    document
        .querySelectorAll(
            ".star-rating i"
        )
        .forEach(
            star => {

                star.classList.remove(
                    "active"
                );

            }
        );


    // ----------------------------------------------
    // Reset comment
    // ----------------------------------------------

    const commentInput =
        document.getElementById(
            "reviewComment"
        );


    if (commentInput) {

        commentInput.value =
            "";

    }


    // ----------------------------------------------
    // Reset recommendation
    // ----------------------------------------------

    const recommendInput =
        document.getElementById(
            "recommendUser"
        );


    if (recommendInput) {

        recommendInput.checked =
            false;

    }


    // ----------------------------------------------
    // Show modal
    // ----------------------------------------------

    const modal =
        document.getElementById(
            "reviewModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}


// ======================================================
// CLOSE REVIEW MODAL
// ======================================================

function closeReviewModal() {

    const modal =
        document.getElementById(
            "reviewModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    currentReviewSwap =
        "";

    selectedRating =
        0;

}


// ======================================================
// REVIEW STAR SETUP
// ======================================================

function setupReviewStars() {

    const stars =
        document.querySelectorAll(
            ".star-rating i"
        );


    stars.forEach(
        star => {

            star.addEventListener(
                "click",
                () => {

                    selectedRating =
                        Number(
                            star.dataset.value
                        );


                    stars.forEach(
                        currentStar => {

                            if (
                                Number(
                                    currentStar.dataset.value
                                ) <=
                                selectedRating
                            ) {

                                currentStar.classList.add(
                                    "active"
                                );

                            }

                            else {

                                currentStar.classList.remove(
                                    "active"
                                );

                            }

                        }
                    );

                }
            );

        }
    );

}


// ======================================================
// SUBMIT REVIEW
// ======================================================

async function submitReview() {

    // ----------------------------------------------
    // Validate swap
    // ----------------------------------------------

    if (!currentReviewSwap) {

        alert(
            "Invalid swap."
        );

        return;

    }


    // ----------------------------------------------
    // Validate rating
    // ----------------------------------------------

    if (
        selectedRating === 0
    ) {

        alert(
            "Please select a rating."
        );

        return;

    }


    // ----------------------------------------------
    // Comment
    // ----------------------------------------------

    const commentInput =
        document.getElementById(
            "reviewComment"
        );


    const comment =
        commentInput
            ? commentInput.value.trim()
            : "";


    if (!comment) {

        alert(
            "Please write your review."
        );

        if (commentInput) {

            commentInput.focus();

        }

        return;

    }


    // ----------------------------------------------
    // Recommendation
    // ----------------------------------------------

    const recommendInput =
        document.getElementById(
            "recommendUser"
        );


    const recommend =
        recommendInput
            ? recommendInput.checked
            : false;


    // ----------------------------------------------
    // Submit button
    // ----------------------------------------------

    const submitButton =
        document.querySelector(
            ".submit-review"
        );


    try {

        // ------------------------------------------
        // Prevent double click
        // ------------------------------------------

        if (submitButton) {

            submitButton.disabled =
                true;


            submitButton.innerHTML = `

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                Submitting...

            `;

        }


        // ------------------------------------------
        // API request
        // ------------------------------------------

        const response =
            await fetch(
                `${API_BASE_URL}/reviews`,
                {
                    method: "POST",

                    headers:
                        getAuthHeaders(true),

                    body:
                        JSON.stringify({

                            swapId:
                                currentReviewSwap,

                            rating:
                                selectedRating,

                            comment:
                                comment,

                            recommend:
                                recommend,

                            categoryRatings: {
                                clarity: document.getElementById("reviewClarity")?.value || null,
                                expertise: document.getElementById("reviewExpertise")?.value || null,
                                punctuality: document.getElementById("reviewPunctuality")?.value || null
                            }

                        })

                }
            );


        // ------------------------------------------
        // Unauthorized
        // ------------------------------------------

        if (
            response.status === 401
        ) {

            handleRequestUnauthorized();

            return;

        }


        // ------------------------------------------
        // Parse response
        // ------------------------------------------

        const data =
            await response.json();


        console.log(
            "Review response:",
            data
        );


        // ------------------------------------------
        // Error
        // ------------------------------------------

        if (!response.ok) {

            alert(
                data.message ||
                "Unable to submit review."
            );

            return;

        }


        // ------------------------------------------
        // Save swap ID before reset
        // ------------------------------------------

        const completedSwapId =
            currentReviewSwap;


        // ------------------------------------------
        // Close modal
        // ------------------------------------------

        closeReviewModal();


        // ------------------------------------------
        // Reset form
        // ------------------------------------------

        if (commentInput) {

            commentInput.value =
                "";

        }


        if (recommendInput) {

            recommendInput.checked =
                false;

        }


        document
            .querySelectorAll(
                ".star-rating i"
            )
            .forEach(
                star =>
                    star.classList.remove(
                        "active"
                    )
            );


        // ------------------------------------------
        // Refresh requests
        // ------------------------------------------

        await fetchRequests();


        // ------------------------------------------
        // IMPORTANT:
        // Refresh shared header
        // ------------------------------------------
        // Completing a swap may generate a
        // notification for the other user.
        // ------------------------------------------

        if (
            typeof window.refreshHeader ===
            "function"
        ) {

            await window.refreshHeader();

        }


        console.log(
            "Review submitted for swap:",
            completedSwapId
        );


        // ------------------------------------------
        // Backend message
        // ------------------------------------------

        alert(
            data.message ||
            "Review submitted successfully."
        );

    }

    catch (error) {

        console.error(
            "Review submission error:",
            error
        );


        alert(
            "Unable to submit review."
        );

    }

    finally {

        if (submitButton) {

            submitButton.disabled =
                false;


            submitButton.innerHTML = `

                Submit Review

            `;

        }

    }

}


// ======================================================
// ESCAPE HTML
// ======================================================

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


// ======================================================
// ESCAPE ATTRIBUTE
// ======================================================

function escapeAttribute(
    value
) {

    return String(
        value ?? ""
    )
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}


// ======================================================
// OPTIONAL:
// REFRESH SHARED HEADER
// ======================================================
// You normally do NOT need to call this manually.
// request.js already calls it after actions that may
// change notifications.
// ======================================================

async function refreshSharedHeader() {

    if (
        typeof window.refreshHeader ===
        "function"
    ) {

        await window.refreshHeader();

    }

}


// ======================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ======================================================

document.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById(
                "reviewModal"
            );


        if (!modal) {
            return;
        }


        if (
            event.target === modal
        ) {

            closeReviewModal();

        }

    }
);


// ======================================================
// ESC KEY CLOSES REVIEW MODAL
// ======================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {

            return;

        }


        const modal =
            document.getElementById(
                "reviewModal"
            );


        if (
            modal &&
            modal.style.display === "flex"
        ) {

            closeReviewModal();

        }

    }
);

// ======================================================
// SCHEDULE SESSION MODAL
// ======================================================

let currentScheduleSwapId = null;


// ======================================================
// OPEN MODAL
// ======================================================

function openScheduleSession(swapId) {
    if (!swapId) {
        alert("Invalid swap.");
        return;
    }

    const modal = document.getElementById("scheduleSessionModal");
    const form = document.getElementById("scheduleSessionForm");
    const errorBox = document.getElementById("scheduleSessionError");
    const submitButton = document.getElementById("submitScheduleSession");

    if (!modal || !form) {
        console.error("Schedule session modal was not found in request.html.");
        alert("The scheduling form could not be opened. Please check request.html.");
        return;
    }

    currentScheduleSwapId = swapId;

    form.reset();

    if (errorBox) {
        errorBox.textContent = "";
        errorBox.classList.remove("visible");
    }

    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML =
            '<i class="fa-regular fa-calendar-check"></i> Schedule Session';
    }

    // Set the earliest selectable start time to now.
    const now = new Date();
    now.setSeconds(0, 0);

    const localDateTime = date => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset)
            .toISOString()
            .slice(0, 16);
    };

    const startInput = document.getElementById("sessionStart");
    const endInput = document.getElementById("sessionEnd");

    if (startInput) {
        startInput.min = localDateTime(now);
    }

    if (endInput) {
        endInput.min = localDateTime(now);
    }

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    document.getElementById("sessionTitle")?.focus();
}


// ======================================================
// CLOSE MODAL
// ======================================================

function closeScheduleSessionModal() {
    const modal = document.getElementById("scheduleSessionModal");

    if (modal) {
        modal.style.display = "none";
    }

    document.body.style.overflow = "";

    currentScheduleSwapId = null;
}


// ======================================================
// SHOW VALIDATION ERROR
// ======================================================

function showScheduleSessionError(message) {
    const errorBox = document.getElementById("scheduleSessionError");

    if (!errorBox) {
        alert(message);
        return;
    }

    errorBox.textContent = message;
    errorBox.classList.add("visible");
}


// ======================================================
// SUBMIT SESSION FORM
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("scheduleSessionForm");

    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (!currentScheduleSwapId) {
            showScheduleSessionError("Invalid swap. Please close the form and try again.");
            return;
        }

        const title = document.getElementById("sessionTitle").value.trim();
        const description = document.getElementById("sessionDescription").value.trim();
        const startInput = document.getElementById("sessionStart").value;
        const endInput = document.getElementById("sessionEnd").value;

        if (!title) {
            showScheduleSessionError("Please enter a session title.");
            document.getElementById("sessionTitle").focus();
            return;
        }

        if (!startInput || !endInput) {
            showScheduleSessionError("Please select both the start and end date and time.");
            return;
        }

        const startTime = new Date(startInput);
        const endTime = new Date(endInput);
        const now = new Date();

        if (
            Number.isNaN(startTime.getTime()) ||
            Number.isNaN(endTime.getTime())
        ) {
            showScheduleSessionError("Please enter valid dates and times.");
            return;
        }

        if (startTime <= now) {
            showScheduleSessionError("The session must start in the future.");
            return;
        }

        if (endTime <= startTime) {
            showScheduleSessionError("The end time must be after the start time.");
            return;
        }

        if (endTime - startTime > 8 * 60 * 60 * 1000) {
            showScheduleSessionError("A session cannot be longer than 8 hours.");
            return;
        }

        await createSwapSession(currentScheduleSwapId, {
            title,
            description,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
        });
    });
});


// ======================================================
// CREATE SESSION API
// ======================================================

async function createSwapSession(swapId, sessionData) {
    const submitButton = document.getElementById("submitScheduleSession");
    const errorBox = document.getElementById("scheduleSessionError");

    try {
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Scheduling...';
        }

        if (errorBox) {
            errorBox.textContent = "";
            errorBox.classList.remove("visible");
        }

        const response = await fetch(
            `${API_BASE_URL}/swaps/${encodeURIComponent(swapId)}/sessions`,
            {
                method: "POST",
                headers: getAuthHeaders(true),
                body: JSON.stringify(sessionData)
            }
        );

        const result = await response.json();

        if (response.status === 401) {
            handleRequestUnauthorized();
            return;
        }

        if (!response.ok) {
            showScheduleSessionError(
                result.message ||
                result.error ||
                "Could not schedule the session. Please try another time."
            );
            return;
        }

        closeScheduleSessionModal();

        alert("Session scheduled successfully!");

    } catch (error) {
        console.error("Schedule session error:", error);

        showScheduleSessionError(
            "Could not connect to the server. Please make sure the backend is running."
        );

    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML =
                '<i class="fa-regular fa-calendar-check"></i> Schedule Session';
        }
    }
}


// ======================================================
// CLOSE SCHEDULING MODAL WITH ESCAPE
// ======================================================

document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    const modal = document.getElementById("scheduleSessionModal");

    if (modal && modal.style.display === "flex") {
        closeScheduleSessionModal();
    }
});

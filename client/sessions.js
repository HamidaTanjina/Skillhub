
const API_BASE_URL = "http://localhost:5000/api";

let allSessions = [];
let currentSessionFilter = "upcoming";

document.addEventListener("DOMContentLoaded", () => {
    setupSessionTabs();

    const refreshButton = document.getElementById("refreshSessionsBtn");

    if (refreshButton) {
        refreshButton.addEventListener("click", fetchMySessions);
    }

    fetchMySessions();
});

function getSessionAuthHeaders() {
    const token = localStorage.getItem("token");

    return token
        ? { Authorization: `Bearer ${token}` }
        : {};
}

function setupSessionTabs() {
    document.querySelectorAll(".session-tab").forEach(button => {
        button.addEventListener("click", () => {
            currentSessionFilter = button.dataset.filter;

            document.querySelectorAll(".session-tab").forEach(tab => {
                tab.classList.toggle("active", tab === button);
            });

            renderMySessions();
        });
    });
}

async function fetchMySessions() {
    const container = document.getElementById("sessionsContainer");

    if (!container) return;

    container.innerHTML = `
        <p class="sessions-empty">Loading your sessions...</p>
    `;

    try {
        const response = await fetch(`${API_BASE_URL}/swaps/sessions/my`, {
            method: "GET",
            headers: getSessionAuthHeaders()
        });

        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                alert("Your session has expired. Please log in again.");
                window.location.href = "login.html";
                return;
            }

            throw new Error(
                result.message ||
                result.error ||
                "Unable to load sessions."
            );
        }

        allSessions = Array.isArray(result)
            ? result
            : Array.isArray(result.sessions)
                ? result.sessions
                : [];

        updateSessionCounts();
        renderMySessions();
    } catch (error) {
        console.error("Fetch sessions error:", error);

        container.innerHTML = `
            <p class="sessions-error">
                Could not load sessions. Check your connection and try again.
            </p>
        `;
    }
}

function getSessionCategory(session) {
    if (session.status === "Cancelled") {
        return "cancelled";
    }

    const endTime = new Date(session.endTime);

    if (session.status === "Completed" || endTime <= new Date()) {
        return "past";
    }

    return "upcoming";
}

function updateSessionCounts() {
    const counts = {
        upcoming: 0,
        past: 0,
        cancelled: 0
    };

    allSessions.forEach(session => {
        const category = getSessionCategory(session);
        counts[category]++;
    });

    document.getElementById("upcomingCount").textContent = counts.upcoming;
    document.getElementById("pastCount").textContent = counts.past;
    document.getElementById("cancelledCount").textContent = counts.cancelled;
}


/* =========================================
   CALENDAR EXPORT HELPERS
========================================= */

function getSessionForCalendar(sessionId) {
    return allSessions.find(session =>
        String(session._id || session.id || "") === String(sessionId)
    );
}

function formatCalendarDate(date) {
    return new Date(date).toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
}

function escapeICS(value) {
    return String(value || "")
        .replace(/\\/g, "\\\\")
        .replace(/\r\n|\r|\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
}

function addSessionToGoogleCalendar(sessionId) {
    const session = getSessionForCalendar(sessionId);

    if (!session) {
        alert("Session not found. Please refresh the page.");
        return;
    }

    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end <= start
    ) {
        alert("This session has invalid date or time information.");
        return;
    }

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: session.title || "SkillHub Session",
        dates: `${formatCalendarDate(start)}/${formatCalendarDate(end)}`,
        details: session.description || "Skill exchange session on SkillHub."
    });

    window.open(
        `https://calendar.google.com/calendar/render?${params.toString()}`,
        "_blank",
        "noopener,noreferrer"
    );
}

function downloadSessionCalendar(sessionId) {
    const session = getSessionForCalendar(sessionId);

    if (!session) {
        alert("Session not found. Please refresh the page.");
        return;
    }

    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end <= start
    ) {
        alert("This session has invalid date or time information.");
        return;
    }

    const title = escapeICS(session.title || "SkillHub Session");
    const description = escapeICS(
        session.description || "Skill exchange session on SkillHub."
    );

    const uid = `${String(session._id || session.id)}@skillhub`;

    const calendarContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//SkillHub//Session Calendar//EN",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:${escapeICS(uid)}`,
        `DTSTAMP:${formatCalendarDate(new Date())}`,
        `DTSTART:${formatCalendarDate(start)}`,
        `DTEND:${formatCalendarDate(end)}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n") + "\r\n";

    const blob = new Blob(
        [calendarContent],
        { type: "text/calendar;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `skillhub-session-${String(session._id || session.id)}.ics`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderMySessions() {
    const container = document.getElementById("sessionsContainer");
    const resultCount = document.getElementById("sessionResultCount");

    if (!container) return;

    const filteredSessions = allSessions
        .filter(session => getSessionCategory(session) === currentSessionFilter)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    if (resultCount) {
        resultCount.textContent =
            `${filteredSessions.length} session${filteredSessions.length === 1 ? "" : "s"}`;
    }

    if (!filteredSessions.length) {
        const messages = {
            upcoming: "You have no upcoming sessions.",
            past: "You have no past sessions yet.",
            cancelled: "You have no cancelled sessions."
        };

        container.innerHTML = `
            <div class="sessions-empty">
                <i class="fa-regular fa-calendar"></i>
                <p>${messages[currentSessionFilter]}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredSessions.map(session => {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        const category = getSessionCategory(session);
        const status = session.status || "Scheduled";

        const participants = Array.isArray(session.participants)
            ? session.participants
            : [];

        const currentUserId = getCurrentUserId();

        const partner = participants.find(person => {
            const participantId =
                typeof person === "string" ? person : person?._id;

            return participantId &&
                currentUserId &&
                String(participantId) !== String(currentUserId);
        });

        const partnerName =
            partner && typeof partner === "object"
                ? partner.name
                : "";

        const formatTime = date => date.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });

        const formatDate = date => date.toLocaleDateString([], {
            year: "numeric",
            month: "short",
            day: "numeric"
        });

        const validStart = !Number.isNaN(start.getTime());
        const validEnd = !Number.isNaN(end.getTime());

        const month = validStart
            ? start.toLocaleDateString([], { month: "short" })
            : "N/A";

        const day = validStart
            ? start.getDate()
            : "—";

        const timeText = validStart && validEnd
            ? `${formatTime(start)} – ${formatTime(end)}`
            : "Time unavailable";

        const statusClass = category === "cancelled"
            ? "status-cancelled"
            : status === "Completed"
                ? "status-completed"
                : "";

        const sessionId = String(session._id || session.id || "");

        return `
            <article class="session-card">
                <div class="session-date">
                    <span class="session-date-month">
                        ${escapeSessionHTML(month)}
                    </span>
                    <span class="session-date-day">
                        ${escapeSessionHTML(day)}
                    </span>
                </div>

                <div class="session-details">
                    <h3>${escapeSessionHTML(session.title || "Skill Exchange Session")}</h3>

                    <div class="session-meta">
                        <span>
                            <i class="fa-regular fa-calendar"></i>
                            ${escapeSessionHTML(validStart ? formatDate(start) : "Date unavailable")}
                        </span>
                        <span>
                            <i class="fa-regular fa-clock"></i>
                            ${escapeSessionHTML(timeText)}
                        </span>
                    </div>

                    ${partnerName ? `
                        <div class="session-meta">
                            <span>
                                <i class="fa-regular fa-user"></i>
                                Partner: ${escapeSessionHTML(partnerName)}
                            </span>
                        </div>
                    ` : ""}

                    ${session.description ? `
                        <p class="session-description">
                            ${escapeSessionHTML(session.description)}
                        </p>
                    ` : ""}

                    ${category === "cancelled" && session.cancellationReason ? `
                        <p class="session-description">
                            Cancellation reason:
                            ${escapeSessionHTML(session.cancellationReason)}
                        </p>
                    ` : ""}

                    <span class="session-status ${statusClass}">
                        ${escapeSessionHTML(status)}
                    </span>
                </div>

                
<div class="session-actions">
    ${category !== "cancelled" && validStart && validEnd ? `
        <button
            type="button"
            class="calendar-google-btn"
            onclick="addSessionToGoogleCalendar('${escapeSessionHTML(sessionId)}')"
        >
            <i class="fa-brands fa-google"></i>
            Add to Google Calendar
        </button>

        <button
            type="button"
            class="calendar-download-btn"
            onclick="downloadSessionCalendar('${escapeSessionHTML(sessionId)}')"
        >
            <i class="fa-solid fa-download"></i>
            Download .ics
        </button>
    ` : ""}

    ${category === "upcoming" && status === "Scheduled" && /^[a-f\d]{24}$/i.test(sessionId) ? `
        <button
            type="button"
            class="cancel-session-btn"
            onclick="cancelSwapSession('${sessionId}')"
        >
            <i class="fa-regular fa-calendar-xmark"></i>
            Cancel
        </button>
    ` : ""}
</div>

            </article>
        `;
    }).join("");
}

function escapeSessionHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getCurrentUserId() {
    try {
        const savedUser = JSON.parse(localStorage.getItem("skillhubUser") || "null");

        if (savedUser?._id) return savedUser._id;
        if (savedUser?.id) return savedUser.id;

        const token = localStorage.getItem("token");

        if (!token) return null;

        const payload = JSON.parse(
            atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );

        return payload.id || payload._id || payload.userId || null;
    } catch {
        return null;
    }
}

async function cancelSwapSession(sessionId) {
    if (!confirm("Are you sure you want to cancel this session?")) {
        return;
    }

    const reason = prompt("Cancellation reason (optional):");

    if (reason === null) return;

    if (reason.length > 500) {
        alert("The cancellation reason cannot exceed 500 characters.");
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/swaps/sessions/${encodeURIComponent(sessionId)}/cancel`,
            {
                method: "PATCH",
                headers: {
                    ...getSessionAuthHeaders(),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ reason: reason.trim() })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                alert("Your session has expired. Please log in again.");
                window.location.href = "login.html";
                return;
            }

            alert(
                result.message ||
                result.error ||
                "Could not cancel this session."
            );
            return;
        }

        alert("Session cancelled successfully.");
        await fetchMySessions();
    } catch (error) {
        console.error("Cancel session error:", error);
        alert("Could not connect to the server.");
    }
}

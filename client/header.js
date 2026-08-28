
(function () {

    "use strict";

    const API_BASE_URL =
        "https://skillhub-backend-cths.onrender.com/api";

    const token =
        localStorage.getItem("token");

    if (!token) {

        window.location.href = "index.html";

        return;
    }

    let notificationBtn;
    let notificationDropdown;
    let notificationList;
    let notificationBadge;
    let markAllReadBtn;

    let profileMenu;
    let topLogoutBtn;
    let sidebarLogoutBtn;

    let userName;
    let profileIcon;

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            cacheElements();

            setupProfileDropdown();

            setupNotificationDropdown();

            setupLogout();

            loadCachedUser();

            loadCurrentUser();

            loadNotifications();

        }
    );

    function cacheElements() {

        notificationBtn =
            document.getElementById(
                "notificationBtn"
            );

        notificationDropdown =
            document.getElementById(
                "notificationDropdown"
            );

        notificationList =
            document.getElementById(
                "notificationList"
            );

        notificationBadge =
            document.getElementById(
                "notificationBadge"
            );

        markAllReadBtn =
            document.getElementById(
                "markAllReadBtn"
            );

        profileMenu =
            document.getElementById(
                "profileMenu"
            );

        topLogoutBtn =
            document.getElementById(
                "topLogoutBtn"
            );

        sidebarLogoutBtn =
            document.getElementById(
                "logoutBtn"
            );

        userName =
            document.getElementById(
                "userName"
            );

        profileIcon =
            document.getElementById(
                "headerProfileIcon"
            );

        if (!profileIcon) {

            profileIcon =
                document.querySelector(
                    ".profile-icon"
                );

        }

    }

    async function loadCurrentUser() {

        try {

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

            if (response.status === 401) {

                logoutUser(false);

                return;
            }

            if (!response.ok) {

                throw new Error(
                    "Failed to load user profile."
                );

            }

            const user =
                await response.json();

            updateHeaderName(user);

            updateHeaderProfilePicture(user);

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

        } catch (error) {

            console.error(
                "Header User Load Error:",
                error
            );

        }

    }

    function updateHeaderName(user) {

        if (!userName) {

            return;
        }

        userName.textContent =
            user.name || "User";

    }

    function updateHeaderProfilePicture(user) {

        if (!profileIcon) {

            return;
        }

        const profilePicture =
            user.profilePicture;

        if (
            !profilePicture ||
            profilePicture.trim() === ""
        ) {

            showProfileInitial(user);

            return;
        }

        profileIcon.innerHTML = "";

        const image =
            document.createElement("img");

        image.src =
            profilePicture;

        image.alt =
            user.name
                ? `${user.name}'s profile picture`
                : "Profile picture";

        image.className =
            "header-profile-image";

        image.onerror =
            () => {

                showProfileInitial(user);

            };

        profileIcon.appendChild(
            image
        );

    }

    function showProfileInitial(user) {

        if (!profileIcon) {

            return;
        }

        const name =
            user && user.name
                ? user.name.trim()
                : "User";

        const initial =
            name.charAt(0).toUpperCase() || "U";

        profileIcon.innerHTML = `

            <span class="header-profile-initial">
                ${initial}
            </span>

        `;

    }

    function loadCachedUser() {

        try {

            const cachedUser =
                localStorage.getItem(
                    "skillhubUser"
                );

            if (!cachedUser) {

                return;
            }

            const user =
                JSON.parse(cachedUser);

            updateHeaderName(user);

            updateHeaderProfilePicture(user);

        } catch (error) {

            console.warn(
                "Cached user unavailable:",
                error
            );

        }

    }

    function setupProfileDropdown() {

        if (!profileMenu) {

            return;
        }

        profileMenu.addEventListener(
            "click",
            event => {

                const dropdown =
                    profileMenu.querySelector(
                        ".profile-dropdown"
                    );

                if (
                    dropdown &&
                    dropdown.contains(
                        event.target
                    )
                ) {

                    return;
                }

                profileMenu.classList.toggle(
                    "active"
                );

            }
        );

        document.addEventListener(
            "click",
            event => {

                if (
                    !profileMenu.contains(
                        event.target
                    )
                ) {

                    profileMenu.classList.remove(
                        "active"
                    );

                }

            }
        );

    }

    function setupLogout() {

        if (topLogoutBtn) {

            topLogoutBtn.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    logoutUser(true);

                }
            );

        }

        if (sidebarLogoutBtn) {

            sidebarLogoutBtn.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    logoutUser(true);

                }
            );

        }

    }

    async function logoutUser(
        showConfirmation = true
    ) {

        if (showConfirmation) {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );

            if (!confirmed) {

                return;
            }

        }

        try {

            await fetch(
                `${API_BASE_URL}/auth/logout`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        } catch (error) {

            console.warn(
                "Logout request failed:",
                error
            );

        }

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "skillhubUser"
        );

        window.location.href =
            "index.html";

    }

    function setupNotificationDropdown() {

        if (notificationBtn) {

            notificationBtn.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    if (!notificationDropdown) {

                        return;
                    }

                    notificationDropdown.classList.toggle(
                        "show"
                    );

                }
            );

        }

        if (notificationDropdown) {

            notificationDropdown.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                }
            );

        }

        document.addEventListener(
            "click",
            event => {

                if (
                    notificationDropdown &&
                    notificationBtn &&
                    !notificationDropdown.contains(
                        event.target
                    ) &&
                    !notificationBtn.contains(
                        event.target
                    )
                ) {

                    notificationDropdown.classList.remove(
                        "show"
                    );

                }

            }
        );

        if (markAllReadBtn) {

            markAllReadBtn.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();

                    await markAllNotificationsAsRead();

                }
            );

        }

    }

    async function loadNotifications() {

        if (!notificationList) {

            return;
        }

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/notifications`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            if (response.status === 401) {

                logoutUser(false);

                return;
            }

            if (!response.ok) {

                throw new Error(
                    "Failed to load notifications."
                );

            }

            const notifications =
                await response.json();

            renderNotifications(
                notifications
            );

        } catch (error) {

            console.error(
                "Notification Load Error:",
                error
            );

            notificationList.innerHTML = `

                <div class="notification-empty">

                    Unable to load notifications

                </div>

            `;

            updateNotificationBadge(0);

        }

    }

    function renderNotifications(
        notifications
    ) {

        if (!notificationList) {

            return;
        }

        if (
            !Array.isArray(notifications) ||
            notifications.length === 0
        ) {

            notificationList.innerHTML = `

                <div class="notification-empty">

                    No notifications

                </div>

            `;

            updateNotificationBadge(0);

            return;
        }

        const unreadCount =
            notifications.filter(
                notification =>
                    !notification.isRead
            ).length;

        updateNotificationBadge(
            unreadCount
        );

        notificationList.innerHTML = "";

        notifications.forEach(
            notification => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "notification-item";

                if (!notification.isRead) {

                    item.classList.add(
                        "unread"
                    );

                }

                const icon =
                    getNotificationIcon(
                        notification.type
                    );

                item.innerHTML = `

                    <div class="notification-icon">

                        <i class="${icon}"></i>

                    </div>

                    <div class="notification-content">

                        <p class="notification-message">

                            ${escapeHTML(
                                notification.message ||
                                "You have a new notification."
                            )}

                        </p>

                        <span class="notification-time">

                            ${formatNotificationTime(
                                notification.createdAt
                            )}

                        </span>

                    </div>

                `;

                item.addEventListener(
                    "click",
                    async () => {

                        if (
                            !notification.isRead
                        ) {

                            await markNotificationAsRead(
                                notification._id
                            );

                        }

                    }
                );

                notificationList.appendChild(
                    item
                );

            }
        );

    }

    function getNotificationIcon(type) {

        switch (type) {

            case "swap_request":

                return "fa-solid fa-handshake";

            case "swap_accepted":

                return "fa-solid fa-check";

            case "swap_rejected":

                return "fa-solid fa-xmark";

            case "new_message":

                return "fa-solid fa-comment";

            default:

                return "fa-solid fa-bell";

        }

    }

    function updateNotificationBadge(
        count
    ) {

        if (!notificationBadge) {

            return;
        }

        if (count > 0) {

            notificationBadge.textContent =
                count > 9
                    ? "9+"
                    : count;

            notificationBadge.classList.remove(
                "hidden"
            );

        } else {

            notificationBadge.textContent =
                "0";

            notificationBadge.classList.add(
                "hidden"
            );

        }

    }

    async function markNotificationAsRead(
        id
    ) {

        if (!id) {

            return;
        }

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/notifications/${id}/read`,
                    {
                        method: "PUT",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            if (!response.ok) {

                throw new Error(
                    "Unable to mark notification as read."
                );

            }

            await loadNotifications();

        } catch (error) {

            console.error(
                "Mark Notification Error:",
                error
            );

        }

    }

    async function markAllNotificationsAsRead() {

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/notifications/read-all`,
                    {
                        method: "PUT",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            if (!response.ok) {

                throw new Error(
                    "Unable to mark all notifications as read."
                );

            }

            await loadNotifications();

        } catch (error) {

            console.error(
                "Mark All Notifications Error:",
                error
            );

        }

    }

    function formatNotificationTime(
        date
    ) {

        if (!date) {

            return "";

        }

        const notificationDate =
            new Date(date);

        if (
            Number.isNaN(
                notificationDate.getTime()
            )
        ) {

            return "";

        }

        const now =
            new Date();

        const difference =
            Math.floor(
                (
                    now -
                    notificationDate
                ) / 1000
            );

        if (difference < 0) {

            return "Just now";

        }

        if (difference < 60) {

            return "Just now";

        }

        if (difference < 3600) {

            return `${Math.floor(
                difference / 60
            )} min ago`;

        }

        if (difference < 86400) {

            return `${Math.floor(
                difference / 3600
            )} hr ago`;

        }

        if (difference < 604800) {

            return `${Math.floor(
                difference / 86400
            )} day${
                Math.floor(
                    difference / 86400
                ) === 1
                    ? ""
                    : "s"
            } ago`;

        }

        return notificationDate.toLocaleDateString();

    }

    function escapeHTML(value) {

        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            String(value);

        return div.innerHTML;

    }

    window.refreshHeader =
        async function () {

            await loadCurrentUser();

            await loadNotifications();

        };

    window.skillHubLogout =
        function () {

            logoutUser(true);

        };

})();
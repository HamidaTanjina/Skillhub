

(function () {

    "use strict";


    // ==================================================
    // CONFIGURATION
    // ==================================================

    const API_BASE_URL =
        "https://skillhub-backend-cths.onrender.com/api"; 
 
    const token = 
        localStorage.getItem("token"); 
 
 
    // ================================================== 
    // AUTHENTICATION 
    // ================================================== 
 
    if (!token) { 
 
        window.location.href = "index.html"; 
 
        return; 
    } 
 
 
    // ================================================== 
    // DOM ELEMENTS 
    // ================================================== 
 
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
 
 
    // ================================================== 
    // INITIALIZE HEADER 
    // ================================================== 
 
    document.addEventListener( 
        "DOMContentLoaded", 
        () => { 
 
            cacheElements(); 
 
            setupProfileDropdown(); 
 
            setupNotificationDropdown(); 
 
            setupLogout(); 
 
            loadCurrentUser(); 
 
            loadNotifications(); 
 
        } 
    ); 
 
 
    // ================================================== 
    // CACHE HEADER ELEMENTS 
    // ================================================== 
 
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
 
 
        // ---------------------------------------------- 
        // Fallback for current HTML 
        // ---------------------------------------------- 
        // Your current HTML does not yet have 
        // id="headerProfileIcon". 
        // 
        // This fallback finds .profile-icon automatically. 
 
        if (!profileIcon) { 
 
            profileIcon = 
                document.querySelector( 
                    ".profile-icon" 
                ); 
 
        } 
 
    } 
 
 
    // ================================================== 
    // LOAD CURRENT USER 
    // ================================================== 
 
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
 
 
            // ------------------------------------------ 
            // Authentication expired 
            // ------------------------------------------ 
 
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
 
 
            // ------------------------------------------ 
            // Update Header Name 
            // ------------------------------------------ 
 
            updateHeaderName(user); 
 
 
            // ------------------------------------------ 
            // Update Header Profile Picture 
            // ------------------------------------------ 
 
            updateHeaderProfilePicture(user); 
 
 
            // ------------------------------------------ 
            // Store latest user data 
            // ------------------------------------------ 
 
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
 
 
            // ------------------------------------------ 
            // Try cached user 
            // ------------------------------------------ 
 
            loadCachedUser(); 
 
        } 
 
    } 
 
 
    // ================================================== 
    // UPDATE HEADER USER NAME 
    // ================================================== 
 
    function updateHeaderName(user) { 
 
        if (!userName) { 
 
            return; 
        } 
 
 
        userName.textContent = 
            user.name || "User"; 
 
    } 
 
 
    // ================================================== 
    // UPDATE HEADER PROFILE PICTURE 
    // ================================================== 
 
    function updateHeaderProfilePicture(user) { 
 
        if (!profileIcon) { 
 
            return; 
        } 
 
 
        const profilePicture = 
            user.profilePicture; 
 
 
        // ---------------------------------------------- 
        // No profile picture 
        // ---------------------------------------------- 
 
        if ( 
            !profilePicture || 
            profilePicture.trim() === "" 
        ) { 
 
            showProfileInitial(user); 
 
            return; 
        } 
 
 
        // ---------------------------------------------- 
        // Profile picture exists 
        // ---------------------------------------------- 
 
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
 
 
    // ================================================== 
    // SHOW PROFILE INITIAL 
    // ================================================== 
 
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
 
 
    // ================================================== 
    // LOAD CACHED USER 
    // ================================================== 
 
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
 
 
    // ================================================== 
    // PROFILE DROPDOWN 
    // ================================================== 
 
    function setupProfileDropdown() { 
 
        if (!profileMenu) { 
 
            return; 
        } 
 
 
        profileMenu.addEventListener( 
            "click", 
            event => { 
 
                // -------------------------------------- 
                // Do not toggle when clicking dropdown 
                // items themselves. 
                // -------------------------------------- 
 
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
 
 
        // -------------------------------------------- 
        // Close when clicking outside 
        // -------------------------------------------- 
 
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
 
 
    // ================================================== 
    // LOGOUT SETUP 
    // ================================================== 
 
    function setupLogout() { 
 
 
        // ---------------------------------------------- 
        // Top profile dropdown logout 
        // ---------------------------------------------- 
 
        if (topLogoutBtn) { 
 
            topLogoutBtn.addEventListener( 
                "click", 
                event => { 
 
                    event.stopPropagation(); 
 
                    logoutUser(true); 
 
                } 
            ); 
 
        } 
 
 
        // ---------------------------------------------- 
        // Sidebar logout 
        // ---------------------------------------------- 
 
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
 
 
    // ================================================== 
    // LOGOUT USER 
    // ================================================== 
 
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
 
 
        // ---------------------------------------------- 
        // Clear local authentication 
        // ---------------------------------------------- 
 
        localStorage.removeItem( 
            "token" 
        ); 
 
 
        localStorage.removeItem( 
            "skillhubUser" 
        ); 
 
 
        // ---------------------------------------------- 
        // Redirect 
        // ---------------------------------------------- 
 
        window.location.href = 
            "index.html"; 
 
    } 
 
 
    // ================================================== 
    // NOTIFICATION SETUP 
    // ================================================== 
 
    function setupNotificationDropdown() { 
 
        // ---------------------------------------------- 
        // Notification button 
        // ---------------------------------------------- 
 
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
 
 
        // ---------------------------------------------- 
        // Prevent dropdown click from closing itself 
        // ---------------------------------------------- 
 
        if (notificationDropdown) { 
 
            notificationDropdown.addEventListener( 
                "click", 
                event => { 
 
                    event.stopPropagation(); 
 
                } 
            ); 
 
        } 
 
 
        // ---------------------------------------------- 
        // Close notification dropdown outside click 
        // ---------------------------------------------- 
 
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
 
 
        // ---------------------------------------------- 
        // Mark all as read 
        // ---------------------------------------------- 
 
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
 
 
    // ================================================== 
    // LOAD NOTIFICATIONS 
    // ================================================== 
 
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
 
 
            // ------------------------------------------ 
            // Authentication expired 
            // ------------------------------------------ 
 
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
 
 
    // ================================================== 
    // RENDER NOTIFICATIONS 
    // ================================================== 
 
    function renderNotifications( 
        notifications 
    ) { 
 
        if (!notificationList) { 
 
            return; 
        } 
 
 
        // ---------------------------------------------- 
        // No notifications 
        // ---------------------------------------------- 
 
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
 
 
        // ---------------------------------------------- 
        // Count unread notifications 
        // ---------------------------------------------- 
 
        const unreadCount = 
            notifications.filter( 
                notification => 
                    !notification.isRead 
            ).length; 
 
 
        updateNotificationBadge( 
            unreadCount 
        ); 
 
 
        // ---------------------------------------------- 
        // Clear existing list 
        // ---------------------------------------------- 
 
        notificationList.innerHTML = ""; 
 
 
        // ---------------------------------------------- 
        // Render each notification 
        // ---------------------------------------------- 
 
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
 
 
                // -------------------------------------- 
                // Notification click 
                // -------------------------------------- 
 
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
 
 
    // ================================================== 
    // NOTIFICATION ICON 
    // ================================================== 
 
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
 
 
    // ================================================== 
    // UPDATE NOTIFICATION BADGE 
    // ================================================== 
 
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
 
 
    // ================================================== 
    // MARK SINGLE NOTIFICATION AS READ 
    // ================================================== 
 
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
 
 
    // ================================================== 
    // MARK ALL NOTIFICATIONS AS READ 
    // ================================================== 
 
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
 
 
    // ================================================== 
    // NOTIFICATION TIME FORMAT 
    // ================================================== 
 
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
 
 
    // ================================================== 
    // BASIC HTML ESCAPING 
    // ================================================== 
 
    function escapeHTML(value) { 
 
        const div = 
            document.createElement( 
                "div" 
            ); 
 
 
        div.textContent = 
            String(value); 
 
 
        return div.innerHTML; 
 
    } 
 
 
    // ================================================== 
    // OPTIONAL GLOBAL REFRESH 
    // ================================================== 
    // Other page scripts can call: 
    // 
    // window.refreshHeader() 
    // 
    // if they make a change that should immediately 
    // refresh the shared header. 
 
    window.refreshHeader = 
        async function () { 
 
            await loadCurrentUser(); 
 
            await loadNotifications(); 
 
        }; 
 
 
    // ================================================== 
    // OPTIONAL GLOBAL LOGOUT 
    // ================================================== 
 
    window.skillHubLogout = 
        function () { 
 
            logoutUser(true); 
 
        }; 
 
 
})(); 
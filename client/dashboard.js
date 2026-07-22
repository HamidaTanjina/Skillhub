const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";

async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "index.html";
                return;
            }
            throw new Error("Failed to load profile.");
        }

        const user = await response.json();

        const welcomeTitle = document.getElementById("welcomeTitle");
        const userName = document.getElementById("userName");
        const profileName = document.getElementById("profileName");
        const profileEmail = document.getElementById("profileEmail");
        const profileLocation = document.getElementById("profileLocation");
        const profileBio = document.getElementById("profileBio");

        if (welcomeTitle) welcomeTitle.textContent = `Welcome Back ${user.name || ''}`;
        if (userName) userName.textContent = user.name || 'User';
        if (profileName) profileName.textContent = user.name || 'User';
        if (profileEmail) profileEmail.textContent = user.email || '';
        if (profileLocation) profileLocation.textContent = user.location || "Add your location";
        if (profileBio) profileBio.textContent = user.bio || "Tell everyone about yourself...";

        const teachContainer = document.getElementById("teachSkills");
        if (teachContainer) {
            teachContainer.innerHTML = "";
            if (!user.teachSkills || user.teachSkills.length === 0) {
                teachContainer.innerHTML = "<span class='skills-loading-text'>No Skills Added</span>";
            } else {
                user.teachSkills.forEach(skill => {
                    teachContainer.innerHTML += `<span class="skill-tag">${skill}</span>`;
                });
            }
        }

        const learnContainer = document.getElementById("learnSkills");
        if (learnContainer) {
            learnContainer.innerHTML = "";
            if (!user.learnSkills || user.learnSkills.length === 0) {
                learnContainer.innerHTML = "<span class='skills-loading-text'>No Skills Added</span>";
            } else {
                user.learnSkills.forEach(skill => {
                    learnContainer.innerHTML += `<span class="skill-tag">${skill}</span>`;
                });
            }
        }

        let completion = 0;
        if (user.name) completion += 20;
        if (user.email) completion += 20;
        if (user.location) completion += 20;
        if (user.bio) completion += 20;
        if (user.teachSkills && user.learnSkills && user.teachSkills.length > 0 && user.learnSkills.length > 0) completion += 20;

        const compText = document.getElementById("profileCompletion");
        const progBar = document.getElementById("progressBar");
        if (compText) compText.textContent = completion + "%";
        if (progBar) progBar.style.width = completion + "%";

        try {
            const swapRes = await fetch(`${API_BASE_URL}/swaps/my-requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (swapRes.ok) {
                const swaps = await swapRes.json();
                const activeEl = document.getElementById("activeSwaps");
                const pendingEl = document.getElementById("pendingRequests");
                const completedEl = document.getElementById("completedSwaps");

                if (activeEl) activeEl.textContent = swaps.filter(s => s.status === "Accepted" || s.status === "Active").length;
                if (pendingEl) pendingEl.textContent = swaps.filter(s => s.status === "Pending").length;
                if (completedEl) completedEl.textContent = swaps.filter(s => s.status === "Completed").length;
            }
        } catch (e) {
            console.warn("Metrics unavailable:", e);
        }

    } catch (error) {
        console.error("Dashboard Load Error:", error);
    }
}

loadDashboardData();

const editProfileBtn = document.getElementById("editProfileBtn");
if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
        window.location.href = "profile.html";
    });
}

const addSkillsBtn = document.getElementById("addSkillsBtn");
if (addSkillsBtn) {
    addSkillsBtn.addEventListener("click", () => {
        window.location.href = "add-skills.html";
    });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Logout Error:", error);
        }
        localStorage.removeItem("token");
        window.location.href = "index.html";
    });
}
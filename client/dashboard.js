const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "index.html";
}

const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";

async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
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

        document.getElementById("welcomeTitle").textContent = `Welcome Back ${user.name || ''}`;
        document.getElementById("userName").textContent = user.name || 'User';
        document.getElementById("profileName").textContent = user.name || 'User';
        document.getElementById("profileEmail").textContent = user.email || '';
        document.getElementById("profileLocation").textContent = user.location || "Add your location";
        document.getElementById("profileBio").textContent = user.bio || "Tell everyone about yourself.";

        const teachContainer = document.getElementById("teachSkills");
        teachContainer.innerHTML = "";
        if (!user.teachSkills || user.teachSkills.length === 0) {
            teachContainer.innerHTML = "<span class='skill-tag'>No Skills Added</span>";
        } else {
            user.teachSkills.forEach(skill => {
                teachContainer.innerHTML += `<span class="skill-tag">${skill}</span>`;
            });
        }

        const learnContainer = document.getElementById("learnSkills");
        learnContainer.innerHTML = "";
        if (!user.learnSkills || user.learnSkills.length === 0) {
            learnContainer.innerHTML = "<span class='skill-tag'>No Skills Added</span>";
        } else {
            user.learnSkills.forEach(skill => {
                learnContainer.innerHTML += `<span class="skill-tag">${skill}</span>`;
            });
        }

        let completion = 0;
        if (user.name) completion += 20;
        if (user.email) completion += 20;
        if (user.location) completion += 20;
        if (user.bio) completion += 20;
        if (user.teachSkills && user.learnSkills && user.teachSkills.length > 0 && user.learnSkills.length > 0) completion += 20;

        document.getElementById("profileCompletion").textContent = completion + "%";
        document.getElementById("progressBar").style.width = completion + "%";

        // Fetch Swaps Summary Metrics
        try {
            const swapRes = await fetch(`${API_BASE_URL}/swaps/my-requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (swapRes.ok) {
                const swaps = await swapRes.json();
                document.getElementById("activeSwaps").textContent = swaps.filter(s => s.status === "Accepted").length;
                document.getElementById("pendingRequests").textContent = swaps.filter(s => s.status === "Pending").length;
                document.getElementById("completedSwaps").textContent = swaps.filter(s => s.status === "Completed").length;
            }
        } catch (e) {
            console.warn("Metrics unavailable");
        }

    } catch (error) {
        console.error("Dashboard Load Error:", error);
    }
}

loadDashboardData();

document.getElementById("editProfileBtn")?.addEventListener("click", () => {
    window.location.href = "profile.html";
});

document.getElementById("addSkillsBtn")?.addEventListener("click", () => {
    window.location.href = "add-skills.html";
});

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
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
const token = localStorage.getItem("token");

async function loadProfile() {

    try {

        const response = await fetch(
            "https://skillhub-backend-cths.onrender.com/api/user/profile",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const user = await response.json();

        // =========================
        // Welcome & Top Navbar
        // =========================

        document.getElementById("welcomeTitle").textContent =
            `Welcome Back ${user.name}`;

        document.getElementById("userName").textContent =
            user.name;

        // =========================
        // Profile Card
        // =========================

        document.getElementById("profileName").textContent =
            user.name;

        document.getElementById("profileEmail").textContent =
            user.email;

        document.getElementById("profileLocation").textContent =
            user.location || "Add your location";

        document.getElementById("profileBio").textContent =
            user.bio || "Tell everyone about yourself.";

        // =========================
        // Teach Skills
        // =========================

        const teachContainer =
            document.getElementById("teachSkills");

        teachContainer.innerHTML = "";

        if (!user.teachSkills || user.teachSkills.length === 0) {

            teachContainer.innerHTML =
                "<span class='skill-tag'>No Skills Added</span>";

        } else {

            user.teachSkills.forEach(skill => {

                teachContainer.innerHTML +=
                    `<span class="skill-tag">${skill}</span>`;

            });

        }

        // =========================
        // Learn Skills
        // =========================

        const learnContainer =
            document.getElementById("learnSkills");

        learnContainer.innerHTML = "";

        if (!user.learnSkills || user.learnSkills.length === 0) {

            learnContainer.innerHTML =
                "<span class='skill-tag'>No Skills Added</span>";

        } else {

            user.learnSkills.forEach(skill => {

                learnContainer.innerHTML +=
                    `<span class="skill-tag">${skill}</span>`;

            });

        }

        // =========================
        // Profile Completion
        // =========================

        let completion = 0;

        if (user.name && user.name.trim() !== "")
            completion += 20;

        if (user.email && user.email.trim() !== "")
            completion += 20;

        if (user.location && user.location.trim() !== "")
            completion += 20;

        if (user.bio && user.bio.trim() !== "")
            completion += 20;

        if (
            user.teachSkills &&
            user.learnSkills &&
            user.teachSkills.length > 0 &&
            user.learnSkills.length > 0
        ) {
            completion += 20;
        }

        document.getElementById("profileCompletion").textContent =
            completion + "%";

        document.getElementById("progressBar").style.width =
            completion + "%";

        // =========================
        // Temporary Dashboard Stats
        // (Replace with backend values later)
        // =========================

        document.getElementById("activeSwaps").textContent = "0";

        document.getElementById("pendingRequests").textContent = "0";

        document.getElementById("completedSwaps").textContent = "0";

        document.getElementById("userRating").textContent = "0.0";

        document.getElementById("reviewCount").textContent = "0";

    }

    catch (error) {

        console.error("Error loading profile:", error);

    }

}

loadProfile();

// =========================
// Buttons
// =========================

document.getElementById("editProfileBtn").addEventListener("click", () => {

    window.location.href = "profile.html";

});

document.getElementById("addSkillsBtn").addEventListener("click", () => {

    window.location.href = "add-skills.html";

});
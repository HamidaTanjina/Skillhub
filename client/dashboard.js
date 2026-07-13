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
        document.getElementById("welcomeTitle").textContent =
    `Welcome Back  ${user.name} `;

        // Top Navbar
        document.getElementById("userName").textContent = user.name;

        // Profile Card
        document.getElementById("profileName").textContent = user.name;

        document.getElementById("profileEmail").textContent = user.email;

        document.getElementById("profileLocation").textContent =
            user.location || "Add your location";

        document.getElementById("profileBio").textContent =
            user.bio || "Tell everyone about yourself.";

        // Teach Skills
        const teachContainer = document.getElementById("teachSkills");

        teachContainer.innerHTML = "";

        if (user.teachSkills.length === 0) {

            teachContainer.innerHTML =
                "<span class='skill-tag'>No Skills Added</span>";

        } else {

            user.teachSkills.forEach(skill => {

                teachContainer.innerHTML +=
                    `<span class="skill-tag">${skill}</span>`;

            });

        }
document.getElementById("editProfileBtn").addEventListener("click", () => {
    window.location.href = "profile.html";
});
document.getElementById("addSkillsBtn").addEventListener("click", () => {

    window.location.href = "add-skills.html";

});
        // Learn Skills
        const learnContainer = document.getElementById("learnSkills");

        learnContainer.innerHTML = "";

        if (user.learnSkills.length === 0) {

            learnContainer.innerHTML =
                "<span class='skill-tag'>No Skills Added</span>";

        } else {

            user.learnSkills.forEach(skill => {

                learnContainer.innerHTML +=
                    `<span class="skill-tag">${skill}</span>`;

            });

        }

        // Profile Completion
        let completion = 0;

        if (user.name) completion += 20;
        if (user.email) completion += 20;
        if (user.location) completion += 20;
        if (user.bio) completion += 20;
        if (
            user.teachSkills.length > 0 ||
            user.learnSkills.length > 0
        ) completion += 20;

        document.getElementById("profileCompletion").textContent =
            completion + "%";

    }

    catch (error) {

        console.log(error);

    }

}

loadProfile();
const token = localStorage.getItem("token");

let teachSkills = [];
let learnSkills = [];

// =========================
// Skill Categories
// =========================

const categories = {

    Technology: [
        "HTML", "CSS", "JavaScript", "React", "Node.js",
        "Python", "Java", "C++", "MongoDB", "SQL"
    ],

    Design: [
        "Figma", "Photoshop", "Illustrator",
        "UI Design", "UX Design", "Canva"
    ],

    Business: [
        "Marketing",
        "Accounting",
        "Finance",
        "Entrepreneurship"
    ],

    Language: [
        "English",
        "Bangla",
        "Arabic",
        "Japanese"
    ],

    Cooking: [
        "Cooking",
        "Baking",
        "Dessert",
        "BBQ"
    ]

};

// =========================
// Load Existing Skills
// =========================

async function loadSkills() {

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

        teachSkills = user.teachSkills || [];

        learnSkills = user.learnSkills || [];

        // Load saved category

        if (user.category) {

            document.getElementById("teachCategory").value =
                user.category;

            showSkills(
                user.category,
                "teachSuggestions",
                true
            );

        }

        renderTeach();

        renderLearn();

    }

    catch (error) {

        console.log(error);

    }

}

loadSkills();

// =========================
// Category Change
// =========================

document.getElementById("teachCategory")

.addEventListener("change", function () {

    showSkills(

        this.value,

        "teachSuggestions",

        true

    );

});

// =========================
// Show Skills
// =========================

function showSkills(category, containerId, isTeach) {

    const container =
        document.getElementById(containerId);

    container.innerHTML = "";

    if (!categories[category]) return;

    categories[category].forEach(skill => {

        const btn =
            document.createElement("button");

        btn.className = "skill-btn";

        btn.textContent = skill;

        btn.onclick = () => {

            if (isTeach) {

                addTeachSkill(skill);

            }

        };

        container.appendChild(btn);

    });

}

// =========================
// Add Teach Skill
// =========================

function addTeachSkill(skill) {

    skill = skill.trim();

    if (!skill) return;

    if (teachSkills.includes(skill)) return;

    if (teachSkills.length >= 10) {

        alert("Maximum 10 teach skills allowed.");

        return;

    }

    teachSkills.push(skill);

    renderTeach();

}

// =========================
// Add Learn Skill
// =========================

function addLearnSkill(skill) {

    skill = skill.trim();

    if (!skill) return;

    if (learnSkills.includes(skill)) return;

    if (learnSkills.length >= 10) {

        alert("Maximum 10 learn skills allowed.");

        return;

    }

    learnSkills.push(skill);

    renderLearn();

}

// =========================
// Render Teach Skills
// =========================

function renderTeach() {

    const container =
        document.getElementById("teachSelected");

    container.innerHTML = "";

    teachSkills.forEach((skill, index) => {

        container.innerHTML += `

        <span class="skill-tag">

            ${skill}

            <i class="fa-solid fa-xmark"
               onclick="removeTeach(${index})"></i>

        </span>

        `;

    });

}

// =========================
// Render Learn Skills
// =========================

function renderLearn() {

    const container =
        document.getElementById("learnSelected");

    container.innerHTML = "";

    learnSkills.forEach((skill, index) => {

        container.innerHTML += `

        <span class="skill-tag">

            ${skill}

            <i class="fa-solid fa-xmark"
               onclick="removeLearn(${index})"></i>

        </span>

        `;

    });

}

// =========================
// Remove Skills
// =========================

function removeTeach(index) {

    teachSkills.splice(index, 1);

    renderTeach();

}

function removeLearn(index) {

    learnSkills.splice(index, 1);

    renderLearn();

}

// =========================
// Custom Teach Skill
// =========================

document.getElementById("teachInput")

.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        e.preventDefault();

        addTeachSkill(this.value);

        this.value = "";

    }

});

// =========================
// Custom Learn Skill
// =========================

document.getElementById("learnInput")

.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        e.preventDefault();

        addLearnSkill(this.value);

        this.value = "";

    }

});

// =========================
// Save Skills
// =========================

document.getElementById("saveSkillsBtn")

.addEventListener("click", async () => {

    try {

        const category =
            document.getElementById("teachCategory").value;

        if (!category) {

            alert("Please select a category.");

            return;

        }

        const response = await fetch(

            "https://skillhub-backend-cths.onrender.com/api/user/skills",

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify({

                    category,

                    teachSkills,

                    learnSkills

                })

            }

        );

        if (!response.ok) {

            throw new Error("Failed to save skills.");

        }

        alert("Skills updated successfully!");

        window.location.href = "dashboard.html";

    }

    catch (error) {

        console.log(error);

        alert("Unable to save skills.");

    }

});
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";

let teachSkills = [];
let learnSkills = [];

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
        "Marketing", "Accounting", "Finance", "Entrepreneurship"
    ],
    Language: [
        "English", "Bangla", "Arabic", "Japanese"
    ],
    Cooking: [
        "Cooking", "Baking", "Dessert", "BBQ"
    ]
};

async function loadSkills() {
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
            throw new Error("Failed to load user profile");
        }

        const user = await response.json();

        teachSkills = Array.isArray(user.teachSkills) ? user.teachSkills : [];
        learnSkills = Array.isArray(user.learnSkills) ? user.learnSkills : [];

        if (user.category) {
            const teachCatEl = document.getElementById("teachCategory");
            if (teachCatEl) teachCatEl.value = user.category;
            showSkills(user.category, "teachSuggestions", true);
        }

        if (user.learnCategory) {
            const learnCatEl = document.getElementById("learnCategory");
            if (learnCatEl) learnCatEl.value = user.learnCategory;
            showSkills(user.learnCategory, "learnSuggestions", false);
        }

        renderTeach();
        renderLearn();

    } catch (error) {
        console.error("Error loading skills:", error);
    }
}

loadSkills();

const teachCategoryEl = document.getElementById("teachCategory");
if (teachCategoryEl) {
    teachCategoryEl.addEventListener("change", function () {
        showSkills(this.value, "teachSuggestions", true);
    });
}

const learnCategoryEl = document.getElementById("learnCategory");
if (learnCategoryEl) {
    learnCategoryEl.addEventListener("change", function () {
        showSkills(this.value, "learnSuggestions", false);
    });
}

function showSkills(category, containerId, isTeach) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";
    if (!categories[category]) return;

    categories[category].forEach(skill => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "skill-btn";
        btn.textContent = skill;

        btn.onclick = () => {
            if (isTeach) {
                addTeachSkill(skill);
            } else {
                addLearnSkill(skill);
            }
        };

        container.appendChild(btn);
    });
}

function addTeachSkill(skill) {
    if (!skill) return;
    const trimmed = skill.trim();
    if (!trimmed || teachSkills.includes(trimmed)) return;

    if (teachSkills.length >= 10) {
        alert("Maximum 10 teach skills allowed.");
        return;
    }

    teachSkills.push(trimmed);
    renderTeach();
}

function addLearnSkill(skill) {
    if (!skill) return;
    const trimmed = skill.trim();
    if (!trimmed || learnSkills.includes(trimmed)) return;

    if (learnSkills.length >= 10) {
        alert("Maximum 10 learn skills allowed.");
        return;
    }

    learnSkills.push(trimmed);
    renderLearn();
}

function renderTeach() {
    const container = document.getElementById("teachSelected");
    if (!container) return;

    container.innerHTML = "";
    teachSkills.forEach((skill, index) => {
        container.innerHTML += `
            <span class="skill-tag">
                ${skill}
                <i class="fa-solid fa-xmark" onclick="removeTeach(${index})"></i>
            </span>
        `;
    });
}

function renderLearn() {
    const container = document.getElementById("learnSelected");
    if (!container) return;

    container.innerHTML = "";
    learnSkills.forEach((skill, index) => {
        container.innerHTML += `
            <span class="skill-tag">
                ${skill}
                <i class="fa-solid fa-xmark" onclick="removeLearn(${index})"></i>
            </span>
        `;
    });
}

window.removeTeach = function(index) {
    teachSkills.splice(index, 1);
    renderTeach();
};

window.removeLearn = function(index) {
    learnSkills.splice(index, 1);
    renderLearn();
};

const teachInputEl = document.getElementById("teachInput");
if (teachInputEl) {
    teachInputEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            addTeachSkill(this.value);
            this.value = "";
        }
    });
}

const learnInputEl = document.getElementById("learnInput");
if (learnInputEl) {
    learnInputEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            addLearnSkill(this.value);
            this.value = "";
        }
    });
}

const saveSkillsBtn = document.getElementById("saveSkillsBtn");
if (saveSkillsBtn) {
    saveSkillsBtn.addEventListener("click", async () => {
        const category = document.getElementById("teachCategory")?.value || "";
        const learnCategory = document.getElementById("learnCategory")?.value || "";

        if (!category || !learnCategory) {
            alert("Please select both categories.");
            return;
        }

        try {
            saveSkillsBtn.disabled = true;
            saveSkillsBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

            const response = await fetch(`${API_BASE_URL}/user/skills`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    category,
                    learnCategory,
                    teachSkills,
                    learnSkills
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Failed to save skills.");
            }

            alert("Skills updated successfully!");
            window.location.href = "dashboard.html";

        } catch (error) {
            console.error("Save error:", error);
            alert(error.message || "Unable to save skills.");
        } finally {
            saveSkillsBtn.disabled = false;
            saveSkillsBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save Skills`;
        }
    });
}
const token = localStorage.getItem("token");
if (!token) window.location.href = "index.html";

const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";

let teachSkills = [];
let learnSkills = [];

const categories = {
    Technology: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Python", "Java", "C++", "MongoDB", "SQL"],
    Design: ["Figma", "Photoshop", "Illustrator", "UI Design", "UX Design", "Canva"],
    Business: ["Marketing", "Accounting", "Finance", "Entrepreneurship"],
    Language: ["English", "Bangla", "Arabic", "Japanese"],
    Cooking: ["Cooking", "Baking", "Dessert", "BBQ"]
};

async function loadSkills() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const user = await response.json();

        teachSkills = user.teachSkills || [];
        learnSkills = user.learnSkills || [];

        renderTeach();
        renderLearn();
    } catch (e) {
        console.error(e);
    }
}
loadSkills();

document.getElementById("teachCategory")?.addEventListener("change", function () {
    showSkills(this.value, "teachSuggestions", true);
});

document.getElementById("learnCategory")?.addEventListener("change", function () {
    showSkills(this.value, "learnSuggestions", false);
});

function showSkills(category, containerId, isTeach) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    if (!categories[category]) return;

    categories[category].forEach(skill => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "skill-btn";
        btn.textContent = skill;
        btn.onclick = () => isTeach ? addTeachSkill(skill) : addLearnSkill(skill);
        container.appendChild(btn);
    });
}

function addTeachSkill(skill) {
    skill = skill.trim();
    if (!skill || teachSkills.includes(skill)) return;
    teachSkills.push(skill);
    renderTeach();
}

function addLearnSkill(skill) {
    skill = skill.trim();
    if (!skill || learnSkills.includes(skill)) return;
    learnSkills.push(skill);
    renderLearn();
}

function renderTeach() {
    const container = document.getElementById("teachSelected");
    container.innerHTML = teachSkills.map((s, i) => `
        <span class="skill-tag">${s} <i class="fa-solid fa-xmark" onclick="removeTeach(${i})"></i></span>
    `).join("");
}

function renderLearn() {
    const container = document.getElementById("learnSelected");
    container.innerHTML = learnSkills.map((s, i) => `
        <span class="skill-tag">${s} <i class="fa-solid fa-xmark" onclick="removeLearn(${i})"></i></span>
    `).join("");
}

window.removeTeach = function(i) { teachSkills.splice(i, 1); renderTeach(); };
window.removeLearn = function(i) { learnSkills.splice(i, 1); renderLearn(); };

document.getElementById("teachInput")?.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); addTeachSkill(this.value); this.value = ""; }
});

document.getElementById("learnInput")?.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); addLearnSkill(this.value); this.value = ""; }
});

document.getElementById("saveSkillsBtn")?.addEventListener("click", async () => {
    const category = document.getElementById("teachCategory")?.value || "Technology";
    const learnCategory = document.getElementById("learnCategory")?.value || "Technology";

    try {
        const response = await fetch(`${API_BASE_URL}/user/skills`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ category, learnCategory, teachSkills, learnSkills })
        });

        if (response.ok) {
            alert("Skills updated successfully!");
            window.location.href = "dashboard.html";
        } else {
            alert("Unable to save skills.");
        }
    } catch (e) {
        alert("Server error.");
    }
});
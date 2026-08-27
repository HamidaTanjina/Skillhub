const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

const API_BASE_URL =
    "https://skillhub-backend-cths.onrender.com/api";

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
        "Marketing", "Accounting", "Finance",
        "Entrepreneurship"
    ],

    Language: [
        "English", "Bangla", "Arabic", "Japanese"
    ],

    Cooking: [
        "Cooking", "Baking", "Dessert", "BBQ"
    ]
};


// ======================================================
// Normalize Skill
// ======================================================
// Makes HTML, html, Html and hTmL the same skill
// ======================================================

function normalizeSkill(skill) {

    return skill
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

}


// ======================================================
// Get Canonical Skill Name
// ======================================================
// Example:
// html -> HTML
// javascript -> JavaScript
// ui design -> UI Design
// ======================================================

function getCanonicalSkill(skill) {

    const normalized =
        normalizeSkill(skill);

    for (const category in categories) {

        const matchedSkill =
            categories[category].find(
                existingSkill =>
                    normalizeSkill(existingSkill) === normalized
            );

        if (matchedSkill) {

            return matchedSkill;

        }

    }

    return skill.trim();

}


// ======================================================
// Check Duplicate
// ======================================================

function skillExists(skill, skillArray) {

    const normalized =
        normalizeSkill(skill);

    return skillArray.some(
        existingSkill =>
            normalizeSkill(existingSkill) === normalized
    );

}


// ======================================================
// Load Existing Skills
// ======================================================

async function loadSkills() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/user/profile`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            if (response.status === 401) {

                localStorage.removeItem("token");

                window.location.href =
                    "index.html";

                return;

            }

            throw new Error(
                "Failed to load user profile"
            );

        }


        const user =
            await response.json();


        teachSkills =
            Array.isArray(user.teachSkills)
                ? user.teachSkills
                : [];


        learnSkills =
            Array.isArray(user.learnSkills)
                ? user.learnSkills
                : [];


        // IMPORTANT:
        // Do NOT automatically select saved categories.
        //
        // The dropdowns will remain:
        // "Select Category"


        // Clear suggestions initially

        const teachSuggestions =
            document.getElementById(
                "teachSuggestions"
            );

        const learnSuggestions =
            document.getElementById(
                "learnSuggestions"
            );


        if (teachSuggestions) {

            teachSuggestions.innerHTML = "";

        }


        if (learnSuggestions) {

            learnSuggestions.innerHTML = "";

        }


        renderTeach();

        renderLearn();

    }

    catch (error) {

        console.error(
            "Error loading skills:",
            error
        );

    }

}


loadSkills();


// ======================================================
// Category Events
// ======================================================

const teachCategoryEl =
    document.getElementById(
        "teachCategory"
    );


if (teachCategoryEl) {

    teachCategoryEl.addEventListener(
        "change",
        function () {

            showSkills(
                this.value,
                "teachSuggestions",
                true
            );

        }
    );

}


const learnCategoryEl =
    document.getElementById(
        "learnCategory"
    );


if (learnCategoryEl) {

    learnCategoryEl.addEventListener(
        "change",
        function () {

            showSkills(
                this.value,
                "learnSuggestions",
                false
            );

        }
    );

}


// ======================================================
// Show Category Skills
// ======================================================

function showSkills(
    category,
    containerId,
    isTeach
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) return;


    container.innerHTML = "";


    if (!categories[category]) {

        return;

    }


    categories[category].forEach(
        skill => {

            const btn =
                document.createElement(
                    "button"
                );


            btn.type = "button";

            btn.className =
                "skill-btn";

            btn.textContent =
                skill;


            // Show selected state
            const selected =
                isTeach
                    ? teachSkills
                    : learnSkills;


            if (
                skillExists(
                    skill,
                    selected
                )
            ) {

                btn.classList.add(
                    "selected"
                );

            }


            btn.onclick = () => {

                if (isTeach) {

                    addTeachSkill(skill);

                } else {

                    addLearnSkill(skill);

                }

            };


            container.appendChild(btn);

        }
    );

}


// ======================================================
// Add Teach Skill
// ======================================================

function addTeachSkill(skill) {

    if (!skill) return;


    const cleaned =
        skill.trim();


    if (!cleaned) return;


    // Convert predefined skills to correct format
    // html -> HTML
    // javascript -> JavaScript
    // ui design -> UI Design

    const finalSkill =
        getCanonicalSkill(cleaned);


    // Case-insensitive duplicate check

    if (
        skillExists(
            finalSkill,
            teachSkills
        )
    ) {

        alert(
            `"${finalSkill}" is already added.`
        );

        return;

    }


    if (teachSkills.length >= 10) {

        alert(
            "Maximum 10 teach skills allowed."
        );

        return;

    }


    teachSkills.push(
        finalSkill
    );


    renderTeach();


    // Refresh category buttons

    const category =
        teachCategoryEl?.value;


    if (category) {

        showSkills(
            category,
            "teachSuggestions",
            true
        );

    }

}


// ======================================================
// Add Learn Skill
// ======================================================

function addLearnSkill(skill) {

    if (!skill) return;


    const cleaned =
        skill.trim();


    if (!cleaned) return;


    // Convert predefined skills to correct format

    const finalSkill =
        getCanonicalSkill(cleaned);


    // Case-insensitive duplicate check

    if (
        skillExists(
            finalSkill,
            learnSkills
        )
    ) {

        alert(
            `"${finalSkill}" is already added.`
        );

        return;

    }


    if (learnSkills.length >= 10) {

        alert(
            "Maximum 10 learn skills allowed."
        );

        return;

    }


    learnSkills.push(
        finalSkill
    );


    renderLearn();


    // Refresh category buttons

    const category =
        learnCategoryEl?.value;


    if (category) {

        showSkills(
            category,
            "learnSuggestions",
            false
        );

    }

}


// ======================================================
// Render Teach Skills
// ======================================================

function renderTeach() {

    const container =
        document.getElementById(
            "teachSelected"
        );


    if (!container) return;


    container.innerHTML = "";


    teachSkills.forEach(
        (skill, index) => {

            const tag =
                document.createElement(
                    "span"
                );


            tag.className =
                "skill-tag";


            tag.innerHTML = `

                ${skill}

                <i
                    class="fa-solid fa-xmark"
                    onclick="removeTeach(${index})"
                ></i>

            `;


            container.appendChild(tag);

        }
    );

}


// ======================================================
// Render Learn Skills
// ======================================================

function renderLearn() {

    const container =
        document.getElementById(
            "learnSelected"
        );


    if (!container) return;


    container.innerHTML = "";


    learnSkills.forEach(
        (skill, index) => {

            const tag =
                document.createElement(
                    "span"
                );


            tag.className =
                "skill-tag";


            tag.innerHTML = `

                ${skill}

                <i
                    class="fa-solid fa-xmark"
                    onclick="removeLearn(${index})"
                ></i>

            `;


            container.appendChild(tag);

        }
    );

}


// ======================================================
// Remove Skills
// ======================================================

window.removeTeach =
    function(index) {

        teachSkills.splice(
            index,
            1
        );


        renderTeach();


        const category =
            teachCategoryEl?.value;


        if (category) {

            showSkills(
                category,
                "teachSuggestions",
                true
            );

        }

    };


window.removeLearn =
    function(index) {

        learnSkills.splice(
            index,
            1
        );


        renderLearn();


        const category =
            learnCategoryEl?.value;


        if (category) {

            showSkills(
                category,
                "learnSuggestions",
                false
            );

        }

    };


// ======================================================
// Teach Input
// ======================================================

const teachInputEl =
    document.getElementById(
        "teachInput"
    );


if (teachInputEl) {

    teachInputEl.addEventListener(
        "keydown",
        function(e) {

            if (e.key !== "Enter") {
                return;
            }


            e.preventDefault();


            addTeachSkill(
                this.value
            );


            this.value = "";

        }
    );

}


// ======================================================
// Learn Input
// ======================================================

const learnInputEl =
    document.getElementById(
        "learnInput"
    );


if (learnInputEl) {

    learnInputEl.addEventListener(
        "keydown",
        function(e) {

            if (e.key !== "Enter") {
                return;
            }


            e.preventDefault();


            addLearnSkill(
                this.value
            );


            this.value = "";

        }
    );

}


// ======================================================
// Save Skills
// ======================================================

const saveSkillsBtn =
    document.getElementById(
        "saveSkillsBtn"
    );


if (saveSkillsBtn) {

    saveSkillsBtn.addEventListener(
        "click",
        async () => {

            const category =
                document.getElementById(
                    "teachCategory"
                )?.value || "";


            const learnCategory =
                document.getElementById(
                    "learnCategory"
                )?.value || "";


            if (
                !category ||
                !learnCategory
            ) {

                alert(
                    "Please select both categories."
                );

                return;

            }


            try {

                saveSkillsBtn.disabled =
                    true;


                saveSkillsBtn.innerHTML = `

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Saving...

                `;


                const response =
                    await fetch(
                        `${API_BASE_URL}/user/skills`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({

                                category,

                                learnCategory,

                                teachSkills,

                                learnSkills

                            })

                        }
                    );


                if (!response.ok) {

                    const errData =
                        await response.json();


                    throw new Error(
                        errData.message ||
                        "Failed to save skills."
                    );

                }


                alert(
                    "Skills updated successfully!"
                );


                window.location.href =
                    "dashboard.html";

            }

            catch (error) {

                console.error(
                    "Save error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to save skills."
                );

            }

            finally {

                saveSkillsBtn.disabled =
                    false;


                saveSkillsBtn.innerHTML = `

                    <i class="fa-solid fa-floppy-disk"></i>

                    Save Skills

                `;

            }

        }
    );

}
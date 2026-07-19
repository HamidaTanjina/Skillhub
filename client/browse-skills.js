const token = localStorage.getItem("token");

let allUsers = [];
let filteredUsers = [];

// ============================
// Load Users
// ============================

async function loadUsers() {

    try {

        const response = await fetch(
            "https://skillhub-backend-cths.onrender.com/api/user/all",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        allUsers = await response.json();

        filteredUsers = [...allUsers];

        renderUsers(filteredUsers);

    }

    catch (error) {

        console.log(error);

    }

}

loadUsers();


// ============================
// Render Users
// ============================

function renderUsers(users) {

    const container = document.getElementById("usersContainer");

    container.innerHTML = "";

    document.getElementById("totalUsers").textContent =
        `${users.length} Users Found`;

    if (users.length === 0) {

        container.innerHTML =

        `<h2>No users found.</h2>`;

        return;

    }

    users.forEach(user => {

        const firstLetter = user.name.charAt(0).toUpperCase();

        const teachSkills =
            user.teachSkills.length === 0

            ?

            "<span class='teach-tag'>No Skills</span>"

            :

            user.teachSkills.map(skill =>

                `<span class="teach-tag">

                    <i class="fa-solid fa-code"></i>

                    ${skill}

                </span>`

            ).join("");

        const learnSkills =
            user.learnSkills.length === 0

            ?

            "<span class='learn-tag'>No Skills</span>"

            :

            user.learnSkills.map(skill =>

                `<span class="learn-tag">

                    <i class="fa-solid fa-book-open"></i>

                    ${skill}

                </span>`

            ).join("");

        container.innerHTML +=

`
<div class="user-card">

   <div class="user-header">

    <div class="user-info">

        <div class="avatar">

            ${firstLetter}

        </div>

        <div>

            <h3 class="user-name">

                ${user.name}

            </h3>

            <p class="location">

                <i class="fa-solid fa-location-dot"></i>

                ${user.location || "Location not added"}

            </p>

        </div>

    </div>

    <span class="badge">

        ${user.isOnline ? "🟢 Active" : "⚪ Offline"}

    </span>

</div>

<div class="section-title">

    SKILLS THEY TEACH

</div>

<div class="skill-list">

    ${teachSkills}

</div>

<div class="section-title">

    WANTS TO LEARN

</div>

<div class="skill-list">

    ${learnSkills}

</div>

<div class="card-footer">

    <div class="rating">

        ⭐ ${user.rating ?? 0}

    </div>

    <div class="online">

        ${user.isOnline ? "🟢 Online" : "⚪ Offline"}

    </div>

</div>

    </div>

    <div class="card-buttons">

        <button
            class="request-btn">

            Send Request

        </button>

        <button
            class="favorite-btn">

            <i class="fa-regular fa-heart"></i>

        </button>

    </div>

</div>

`;

    });

}



// ============================
// Search
// ============================

document.getElementById("searchInput")

.addEventListener("input", filterUsers);



document.getElementById("categoryFilter")

.addEventListener("change", filterUsers);



document.getElementById("sortFilter")

.addEventListener("change", filterUsers);



// ============================
// Filter
// ============================

function filterUsers() {

    const keyword =
        document.getElementById("searchInput")

        .value

        .toLowerCase();

    const category =
        document.getElementById("categoryFilter")

        .value;

    filteredUsers = allUsers.filter(user => {

        const matchName =
            user.name.toLowerCase().includes(keyword);

        const matchTeach =
            user.teachSkills.some(skill =>
                skill.toLowerCase().includes(keyword));

        const matchLearn =
            user.learnSkills.some(skill =>
                skill.toLowerCase().includes(keyword));

        const searchMatch =
            matchName || matchTeach || matchLearn;

        if (category === "All") {

            return searchMatch;

        }

        return searchMatch &&
            user.category === category;

    });

    sortUsers();

}



// ============================
// Sort
// ============================

function sortUsers() {

    const sort =
        document.getElementById("sortFilter")

        .value;

    if (sort === "Name") {

        filteredUsers.sort((a, b) =>

            a.name.localeCompare(b.name)

        );

    }

    if (sort === "Most Skills") {

        filteredUsers.sort((a, b) =>

            (b.teachSkills.length + b.learnSkills.length)

            -

            (a.teachSkills.length + a.learnSkills.length)

        );

    }

    renderUsers(filteredUsers);

}


const token = localStorage.getItem("token");
if (!token) window.location.href = "index.html";

const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";

async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const user = await response.json();

        document.getElementById("editName").value = user.name || "";
        document.getElementById("editEmail").value = user.email || "";
        document.getElementById("editLocation").value = user.location || "";
        document.getElementById("editBio").value = user.bio || "";
    } catch (e) {
        console.error(e);
    }
}

loadProfile();

document.getElementById("saveProfileBtn").onclick = async () => {
    const name = document.getElementById("editName").value.trim();
    const location = document.getElementById("editLocation").value.trim();
    const bio = document.getElementById("editBio").value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name, location, bio })
        });

        if (response.ok) {
            alert("Profile Updated Successfully!");
            window.location.href = "dashboard.html";
        } else {
            alert("Failed to update profile.");
        }
    } catch (e) {
        alert("Server error.");
    }
};
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";

async function loadProfile() {
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

        const editName = document.getElementById("editName");
        const editEmail = document.getElementById("editEmail");
        const editLocation = document.getElementById("editLocation");
        const editBio = document.getElementById("editBio");

        if (editName) editName.value = user.name || "";
        if (editEmail) editEmail.value = user.email || "";
        if (editLocation) editLocation.value = user.location || "";
        if (editBio) editBio.value = user.bio || "";

    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

loadProfile();

const saveProfileBtn = document.getElementById("saveProfileBtn");

if (saveProfileBtn) {
    saveProfileBtn.onclick = async () => {
        const editName = document.getElementById("editName");
        const editLocation = document.getElementById("editLocation");
        const editBio = document.getElementById("editBio");

        const profile = {
            name: editName ? editName.value.trim() : "",
            location: editLocation ? editLocation.value.trim() : "",
            bio: editBio ? editBio.value.trim() : ""
        };

        if (!profile.name) {
            alert("Name is required.");
            return;
        }

        try {
            saveProfileBtn.disabled = true;
            saveProfileBtn.textContent = "Saving...";

            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(profile)
            });

            if (response.ok) {
                alert("Profile Updated Successfully!");
                window.location.href = "dashboard.html";
            } else {
                const data = await response.json();
                alert(`Failed to update profile: ${data.message || "Unknown error"}`);
            }

        } catch (error) {
            console.error("Update error:", error);
            alert("Something went wrong while connecting to the server.");
        } finally {
            saveProfileBtn.disabled = false;
            saveProfileBtn.textContent = "Save Changes";
        }
    };
}
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

        // Fill Form

        document.getElementById("editName").value =
            user.name;

        document.getElementById("editEmail").value =
            user.email;

        document.getElementById("editLocation").value =
            user.location || "";

        document.getElementById("editBio").value =
            user.bio || "";

 

    } catch (error) {

        console.log(error);

    }

}

loadProfile();

document.getElementById("saveProfileBtn").onclick = async () => {

    const profile = {

        name:
            document.getElementById("editName").value,

        location:
            document.getElementById("editLocation").value,

        bio:
            document.getElementById("editBio").value,

    

    };

    try {

        const response = await fetch(
            "https://skillhub-backend-cths.onrender.com/api/user/profile",
            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify(profile)

            }
        );

        if (response.ok) {

            alert("Profile Updated Successfully!");

            window.location.href = "dashboard.html";

        } else {

            alert("Failed to update profile.");

        }

    } catch (error) {

        console.log(error);

        alert("Something went wrong.");

    }

};
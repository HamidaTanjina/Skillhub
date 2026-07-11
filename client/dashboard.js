const token = localStorage.getItem("token");

async function loadProfile() {

    try {

        const response = await fetch("http://localhost:5000/api/user/profile", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const user = await response.json();

        document.getElementById("userName").innerText = user.name;
        document.getElementById("welcomeName").innerText = user.name;
        document.getElementById("userEmail").innerText = user.email;

        if(user.profilePicture){
            document.getElementById("profileImage").src = user.profilePicture;
        }

    } catch(error){
        console.log(error);
    }

}

loadProfile();
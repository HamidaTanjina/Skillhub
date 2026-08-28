/* =========================================================
   SKILLHUB LANDING PAGE
   ========================================================= */

const API_BASE_URL =
    "https://skillhub-backend-cths.onrender.com/api";


/* =========================================================
   ELEMENTS
   ========================================================= */

const navbar =
    document.querySelector(".navbar");

const menuBtn =
    document.getElementById("menuBtn");

const navLinks =
    document.getElementById("navLinks");

const mainNav =
    document.getElementById("mainNav");

const navItems =
    document.querySelectorAll(".nav-links a");

const sections =
    document.querySelectorAll("main section");


const modal =
    document.getElementById("loginModal");

const closeModal =
    document.getElementById("closeModal");

const loginButtons =
    document.querySelectorAll(".login-btn");

const signupButtons =
    document.querySelectorAll(".signup-link");


const authForm =
    document.getElementById("authForm");

const authModeText =
    document.getElementById("authModeText");

const authSubtitleText =
    document.getElementById("authSubtitleText");

const authSubmit =
    document.getElementById("authSubmit");

const authSwitch =
    document.getElementById("authSwitch");


const nameInputWrapper =
    document.getElementById("nameInputWrapper");

const confirmPasswordWrapper =
    document.getElementById(
        "confirmPasswordWrapper"
    );


const nameInput =
    document.getElementById("nameInput");

const emailInput =
    document.getElementById("emailInput");

const passwordInput =
    document.getElementById("passwordInput");

const confirmPasswordInput =
    document.getElementById(
        "confirmPasswordInput"
    );

const forgotLink =
    document.getElementById("forgotLink");


const togglePassword =
    document.getElementById(
        "togglePassword"
    );

const toggleConfirmPassword =
    document.getElementById(
        "toggleConfirmPassword"
    );


let authMode = "signin";


/* =========================================================
   PLATFORM STATISTICS
   ========================================================= */

async function loadPlatformStats() {

    const studentsStat =
        document.getElementById(
            "studentsStat"
        );

    const skillsStat =
        document.getElementById(
            "skillsStat"
        );

    const matchesStat =
        document.getElementById(
            "matchesStat"
        );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/stats`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to fetch statistics"
            );

        }


        const data =
            await response.json();


        if (
            !data.success ||
            !data.stats
        ) {

            throw new Error(
                "Invalid statistics response"
            );

        }


        const {
            students,
            skills,
            matches
        } = data.stats;


        const formattedStudents =
            Number(students || 0)
                .toLocaleString();

        const formattedSkills =
            Number(skills || 0)
                .toLocaleString();

        const formattedMatches =
            Number(matches || 0)
                .toLocaleString();


        if (studentsStat) {

            studentsStat.textContent =
                formattedStudents;

        }


        if (skillsStat) {

            skillsStat.textContent =
                formattedSkills;

        }


        if (matchesStat) {

            matchesStat.textContent =
                formattedMatches;

        }

    } catch (error) {

        console.error(
            "Statistics Error:",
            error
        );


        if (studentsStat) {

            studentsStat.textContent =
                "0";

        }


        if (skillsStat) {

            skillsStat.textContent =
                "0";

        }


        if (matchesStat) {

            matchesStat.textContent =
                "0";

        }

    }

}


/* =========================================================
   NAVBAR SCROLL STATE
   ========================================================= */

function evaluateNavbarAndLinks() {

    const scrollPos =
        window.scrollY;


    if (navbar) {

        navbar.classList.toggle(
            "scrolled",
            scrollPos > 40
        );

    }


    let currentSectionId = "";


    sections.forEach(section => {

        const top =
            section.offsetTop - 180;


        if (scrollPos >= top) {

            currentSectionId =
                section.getAttribute("id");

        }

    });


    navItems.forEach(link => {

        const href =
            link.getAttribute("href");


        const isSectionLink =
            href &&
            href.startsWith("#");


        const isActive =
            isSectionLink &&
            currentSectionId &&
            href ===
                `#${currentSectionId}`;


        link.classList.toggle(
            "active-link",
            !!isActive
        );

    });

}


window.addEventListener(
    "scroll",
    evaluateNavbarAndLinks,
    {
        passive: true
    }
);


window.addEventListener(
    "load",
    evaluateNavbarAndLinks
);


/* =========================================================
   MOBILE MENU
   ========================================================= */

function closeMobileMenu() {

    if (mainNav) {

        mainNav.classList.remove(
            "active"
        );

    }


    if (menuBtn) {

        menuBtn.innerHTML =
            '<i class="fa-solid fa-bars"></i>';

        menuBtn.setAttribute(
            "aria-label",
            "Open menu"
        );

    }

}


if (menuBtn && mainNav) {

    menuBtn.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            mainNav.classList.toggle(
                "active"
            );


            const isOpen =
                mainNav.classList.contains(
                    "active"
                );


            menuBtn.innerHTML =
                isOpen
                    ? '<i class="fa-solid fa-xmark"></i>'
                    : '<i class="fa-solid fa-bars"></i>';


            menuBtn.setAttribute(
                "aria-label",
                isOpen
                    ? "Close menu"
                    : "Open menu"
            );

        }
    );

}


/* CLOSE MOBILE MENU AFTER NAVIGATION */

navItems.forEach(link => {

    link.addEventListener(
        "click",
        () => {

            closeMobileMenu();

        }
    );

});


/* CLOSE MENU WHEN CLICKING OUTSIDE */

document.addEventListener(
    "click",
    event => {

        if (
            mainNav &&
            menuBtn &&
            mainNav.classList.contains(
                "active"
            ) &&
            !mainNav.contains(event.target) &&
            !menuBtn.contains(event.target)
        ) {

            closeMobileMenu();

        }

    }
);


/* CLOSE MENU WHEN SCREEN BECOMES DESKTOP */

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth > 900
        ) {

            closeMobileMenu();

        }

    }
);


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        showToast.timeout
    );


    showToast.timeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            4000
        );

}


/* =========================================================
   AUTH MODE
   ========================================================= */

function setAuthMode(mode) {

    authMode =
        mode;


    const isSignup =
        mode === "signup";


    if (authModeText) {

        authModeText.textContent =
            isSignup
                ? "Welcome to SkillHub!"
                : "Welcome Back!";

    }


    if (authSubtitleText) {

        authSubtitleText.textContent =
            isSignup
                ? "Create Account"
                : "Sign In";

    }


    const btnText =
        authSubmit
            ? authSubmit.querySelector(
                ".btn-text"
            )
            : null;


    if (btnText) {

        btnText.textContent =
            isSignup
                ? "Sign Up"
                : "Sign In";

    }


    if (authSwitch) {

        authSwitch.textContent =
            isSignup
                ? "Back to Sign In"
                : "Create Account";

    }


    if (nameInputWrapper) {

        nameInputWrapper.style.display =
            isSignup
                ? "block"
                : "none";

    }


    if (confirmPasswordWrapper) {

        confirmPasswordWrapper.style.display =
            isSignup
                ? "block"
                : "none";

    }


    if (nameInput) {

        nameInput.required =
            isSignup;

    }


    if (confirmPasswordInput) {

        confirmPasswordInput.required =
            isSignup;

    }


    if (forgotLink) {

        forgotLink.style.display =
            isSignup
                ? "none"
                : "block";

    }

}


/* =========================================================
   OPEN AUTH MODAL
   ========================================================= */

function openAuthMode(mode) {

    setAuthMode(mode);


    if (authForm) {

        authForm.reset();

    }


    if (modal) {

        modal.classList.add(
            "active"
        );

        document.body.style.overflow =
            "hidden";

    }

}


/* =========================================================
   CLOSE AUTH MODAL
   ========================================================= */

function closeAuthModal() {

    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   LOGIN BUTTONS
   ========================================================= */

loginButtons.forEach(button => {

    button.addEventListener(
        "click",
        event => {

            event.preventDefault();

            openAuthMode(
                "signin"
            );

        }
    );

});


/* =========================================================
   SIGNUP BUTTONS
   ========================================================= */

signupButtons.forEach(button => {

    button.addEventListener(
        "click",
        event => {

            event.preventDefault();

            openAuthMode(
                "signup"
            );

        }
    );

});


/* =========================================================
   CLOSE BUTTON
   ========================================================= */

if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeAuthModal
    );

}


/* =========================================================
   CLICK OUTSIDE MODAL
   ========================================================= */

window.addEventListener(
    "click",
    event => {

        if (
            modal &&
            event.target === modal
        ) {

            closeAuthModal();

        }

    }
);


/* =========================================================
   ESCAPE KEY
   ========================================================= */

window.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            modal &&
            modal.classList.contains(
                "active"
            )
        ) {

            closeAuthModal();

        }

    }
);


/* =========================================================
   SWITCH SIGN IN / SIGN UP
   ========================================================= */

if (authSwitch) {

    authSwitch.addEventListener(
        "click",
        event => {

            event.preventDefault();


            setAuthMode(
                authMode === "signin"
                    ? "signup"
                    : "signin"
            );

        }
    );

}


/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

function setupPasswordToggle(
    toggleElement,
    inputElement
) {

    if (
        !toggleElement ||
        !inputElement
    ) {

        return;

    }


    toggleElement.addEventListener(
        "click",
        event => {

            event.preventDefault();


            const isHidden =
                inputElement.type ===
                "password";


            inputElement.type =
                isHidden
                    ? "text"
                    : "password";


            toggleElement.classList.toggle(
                "fa-eye-slash",
                isHidden
            );


            toggleElement.classList.toggle(
                "fa-eye",
                !isHidden
            );

        }
    );

}


setupPasswordToggle(
    togglePassword,
    passwordInput
);


setupPasswordToggle(
    toggleConfirmPassword,
    confirmPasswordInput
);


/* =========================================================
   AUTH FORM
   ========================================================= */

if (authForm) {

    authForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            if (authSubmit) {

                authSubmit.disabled =
                    true;

            }


            /* =========================
               SIGN UP
               ========================= */

            if (
                authMode === "signup"
            ) {

                const confirmPassword =
                    confirmPasswordInput
                        ? confirmPasswordInput.value
                        : "";


                if (
                    password !==
                    confirmPassword
                ) {

                    showToast(
                        "⚠️ Passwords do not match!"
                    );


                    if (authSubmit) {

                        authSubmit.disabled =
                            false;

                    }

                    return;

                }


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/auth/register`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        name,
                                        email,
                                        password
                                    })
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        showToast(
                            "🎉 Registration successful!"
                        );


                        const userToken =
                            data.token ||
                            (
                                data.user &&
                                data.user.token
                            );


                        if (userToken) {

                            localStorage.setItem(
                                "token",
                                userToken
                            );

                        }


                        setTimeout(
                            () => {

                                window.location.href =
                                    "dashboard.html";

                            },
                            1000
                        );

                    } else {

                        showToast(
                            `❌ ${
                                data.message ||
                                "Registration failed."
                            }`
                        );

                    }

                } catch (error) {

                    console.error(
                        "Registration error:",
                        error
                    );


                    showToast(
                        "⚡ Network error. Please try again."
                    );

                } finally {

                    if (authSubmit) {

                        authSubmit.disabled =
                            false;

                    }

                }


                return;

            }


            /* =========================
               SIGN IN
               ========================= */

            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email,
                                    password
                                })
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    showToast(
                        "Login Successful!"
                    );


                    const userToken =
                        data.token ||
                        (
                            data.user &&
                            data.user.token
                        );


                    if (userToken) {

                        localStorage.setItem(
                            "token",
                            userToken
                        );

                    }


                    setTimeout(
                        () => {

                            window.location.href =
                                "dashboard.html";

                        },
                        1000
                    );

                } else {

                    showToast(
                        `❌ ${
                            data.message ||
                            "Invalid credentials."
                        }`
                    );

                }

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showToast(
                    "⚡ Server connection error."
                );

            } finally {

                if (authSubmit) {

                    authSubmit.disabled =
                        false;

                }

            }

        }
    );

}


/* =========================================================
   INITIAL AUTH STATE
   ========================================================= */

setAuthMode(
    "signin"
);


/* =========================================================
   LOAD REAL PLATFORM STATISTICS
   ========================================================= */

loadPlatformStats();
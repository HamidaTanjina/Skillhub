
/* =========================================================
   SKILLHUB LANDING PAGE
   ========================================================= */

const API_BASE_URL =
    "https://skillhub-backend-cths.onrender.com/api";


/* =========================================================
   ELEMENTS
   ========================================================= */

const navbar = document.querySelector(".navbar");
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const mainNav = document.getElementById("mainNav");
const navItems = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section");

const modal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");

const loginButtons = document.querySelectorAll(".login-btn");
const signupButtons = document.querySelectorAll(".signup-link");

const authForm = document.getElementById("authForm");
const authModeText = document.getElementById("authModeText");
const authSubtitleText = document.getElementById("authSubtitleText");
const authSubmit = document.getElementById("authSubmit");
const authSwitch = document.getElementById("authSwitch");
const authMessage = document.getElementById("authMessage");

const nameInputWrapper = document.getElementById("nameInputWrapper");
const confirmPasswordWrapper =
    document.getElementById("confirmPasswordWrapper");

const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const confirmPasswordInput =
    document.getElementById("confirmPasswordInput");

const forgotLink = document.getElementById("forgotLink");

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

let authMode = "signin";


/* =========================================================
   PLATFORM STATISTICS
   ========================================================= */

async function loadPlatformStats() {
    const studentsStat = document.getElementById("studentsStat");
    const skillsStat = document.getElementById("skillsStat");
    const matchesStat = document.getElementById("matchesStat");

    try {
        const response = await fetch(`${API_BASE_URL}/stats`);

        if (!response.ok) {
            throw new Error("Failed to fetch statistics");
        }

        const data = await response.json();

        if (!data.success || !data.stats) {
            throw new Error("Invalid statistics response");
        }

        const { students, skills, matches } = data.stats;

        if (studentsStat) {
            studentsStat.textContent =
                Number(students || 0).toLocaleString();
        }

        if (skillsStat) {
            skillsStat.textContent =
                Number(skills || 0).toLocaleString();
        }

        if (matchesStat) {
            matchesStat.textContent =
                Number(matches || 0).toLocaleString();
        }
    } catch (error) {
        console.error("Statistics Error:", error);

        if (studentsStat) studentsStat.textContent = "0";
        if (skillsStat) skillsStat.textContent = "0";
        if (matchesStat) matchesStat.textContent = "0";
    }
}


/* =========================================================
   NAVBAR SCROLL STATE
   ========================================================= */

function evaluateNavbarAndLinks() {
    if (navbar) {
        navbar.classList.toggle("scrolled", window.scrollY > 40);
    }

    let currentSection = null;

    sections.forEach(section => {
        const sectionTop =
            section.offsetTop - 180;
        const sectionBottom =
            sectionTop + section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionBottom
        ) {
            currentSection = section;
        }
    });

    // navLinks is a container, so select its links.
    if (navLinks) {
        navLinks.querySelectorAll("a").forEach(link => {
            link.classList.remove("active-link");

            // Signup is an action, not a page section.
            if (link.classList.contains("signup-link")) {
                return;
            }

            if (
                currentSection &&
                link.getAttribute("href") === `#${currentSection.id}`
            ) {
                link.classList.add("active-link");
            }
        });
    }
}

window.addEventListener("scroll", evaluateNavbarAndLinks);
window.addEventListener("load", evaluateNavbarAndLinks);


/* =========================================================
   MOBILE MENU
   ========================================================= */

function closeMobileMenu() {
    if (mainNav) {
        mainNav.classList.remove("active");
    }

    if (menuBtn) {
        menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        menuBtn.setAttribute("aria-label", "Open menu");
        menuBtn.setAttribute("aria-expanded", "false");
    }
}

if (menuBtn && mainNav) {
    menuBtn.setAttribute("aria-expanded", "false");

    menuBtn.addEventListener("click", event => {
        event.stopPropagation();

        mainNav.classList.toggle("active");

        const isOpen = mainNav.classList.contains("active");

        menuBtn.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';

        menuBtn.setAttribute(
            "aria-label",
            isOpen ? "Close menu" : "Open menu"
        );

        menuBtn.setAttribute("aria-expanded", String(isOpen));
    });
}

navItems.forEach(link => {
    link.addEventListener("click", () => {
        closeMobileMenu();
    });
});

document.addEventListener("click", event => {
    if (
        mainNav &&
        menuBtn &&
        mainNav.classList.contains("active") &&
        !mainNav.contains(event.target) &&
        !menuBtn.contains(event.target)
    ) {
        closeMobileMenu();
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
        closeMobileMenu();
    }
});


/* =========================================================
   TOAST FALLBACK
   ========================================================= */

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) {
        console.warn(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timeout);

    showToast.timeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}


/* =========================================================
   INLINE AUTH MESSAGE
   ========================================================= */

function showAuthMessage(message, type = "error") {
    if (!authMessage) {
        showToast(message);
        return;
    }

    authMessage.textContent = message;
    authMessage.hidden = false;

    authMessage.classList.remove("success", "error");
    authMessage.classList.add(type);

    authMessage.setAttribute("role", "status");
    authMessage.setAttribute("aria-live", "polite");
}

function clearAuthMessage() {
    if (!authMessage) return;

    authMessage.textContent = "";
    authMessage.hidden = true;
    authMessage.classList.remove("success", "error");
}


/* =========================================================
   AUTH MODE
   ========================================================= */

function setAuthMode(mode) {
    authMode = mode === "signup" ? "signup" : "signin";

    clearAuthMessage();

    const isSignup = authMode === "signup";

    if (authModeText) {
        authModeText.textContent = isSignup
            ? "Create your account"
            : "Welcome back";
    }

    if (authSubtitleText) {
        authSubtitleText.textContent = isSignup
            ? "Join SkillHub to share your skills and learn from others."
            : "Log in to continue your skill exchange journey.";
    }

    const btnText = authSubmit
        ? authSubmit.querySelector(".btn-text")
        : null;

    if (btnText) {
        btnText.textContent = isSignup
            ? "Create account"
            : "Login";
    }

    if (authSwitch) {
        authSwitch.textContent = isSignup
            ? "Login"
            : "Create an account";
    }

    const authFooterText =
        document.getElementById("authFooterText");

    if (authFooterText) {
        authFooterText.textContent = isSignup
            ? "Already have an account?"
            : "Don't have an account?";
    }

    if (nameInputWrapper) {
        nameInputWrapper.style.display =
            isSignup ? "flex" : "none";
    }

    if (confirmPasswordWrapper) {
        confirmPasswordWrapper.style.display =
            isSignup ? "flex" : "none";
    }

    if (nameInput) {
        nameInput.required = isSignup;
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.required = isSignup;
    }

    if (forgotLink) {
        forgotLink.style.display =
            isSignup ? "none" : "block";
    }

    const loginOptions = document.getElementById("loginOptions");

    if (loginOptions) {
        loginOptions.style.display =
            isSignup ? "none" : "flex";
    }

    if (modal) {
        modal.classList.toggle("register-mode", isSignup);
    }
}


/* =========================================================
   OPEN AUTH MODAL
   ========================================================= */

function openAuthMode(mode = "signin") {
    if (!modal) {
        console.error(
            'Login modal element "#loginModal" was not found.'
        );
        return;
    }

    if (authForm) {
        authForm.reset();
    }

    setAuthMode(mode);

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Put keyboard focus in the first useful field.
    const firstField = mode === "signup" && nameInput
        ? nameInput
        : emailInput;

    if (firstField) {
        setTimeout(() => firstField.focus(), 0);
    }
}


/* =========================================================
   CLOSE AUTH MODAL
   ========================================================= */

function closeAuthModal() {
    if (!modal) return;

    modal.classList.remove("active");
    document.body.style.overflow = "";

    clearAuthMessage();
}


/* =========================================================
   AUTH MODAL BUTTONS
   ========================================================= */

loginButtons.forEach(button => {
    button.addEventListener("click", event => {
        event.preventDefault();
        openAuthMode("signin");
    });
});

signupButtons.forEach(button => {
    button.addEventListener("click", event => {
        event.preventDefault();
        openAuthMode("signup");
    });
});

if (closeModal) {
    closeModal.addEventListener("click", closeAuthModal);
}

// Close when clicking the backdrop, but not the modal contents.
window.addEventListener("click", event => {
    if (modal && event.target === modal) {
        closeAuthModal();
    }
});

window.addEventListener("keydown", event => {
    if (
        event.key === "Escape" &&
        modal &&
        modal.classList.contains("active")
    ) {
        closeAuthModal();
    }
});


/* =========================================================
   SWITCH SIGN IN / SIGN UP
   ========================================================= */

if (authSwitch) {
    authSwitch.addEventListener("click", event => {
        event.preventDefault();

        const nextMode =
            authMode === "signin" ? "signup" : "signin";

        if (authForm) {
            authForm.reset();
        }

        setAuthMode(nextMode);
    });
}


/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

function setupPasswordToggle(toggleElement, inputElement) {
    if (!toggleElement || !inputElement) return;

    // Keep the toggle a button even if its HTML is missing type="button".
    if (toggleElement.tagName === "BUTTON") {
        toggleElement.type = "button";
    }

    const initialIcon = toggleElement.querySelector("i");

    if (initialIcon) {
        initialIcon.classList.add("fa-eye");
        initialIcon.classList.remove("fa-eye-slash");
    }

    toggleElement.setAttribute("aria-label", "Show password");
    toggleElement.setAttribute("title", "Show password");
    toggleElement.setAttribute("aria-pressed", "false");

    toggleElement.addEventListener("click", event => {
        event.preventDefault();

        const isHidden = inputElement.type === "password";

        inputElement.type = isHidden ? "text" : "password";

        const eyeIcon = toggleElement.querySelector("i");

        if (eyeIcon) {
            eyeIcon.classList.toggle("fa-eye", !isHidden);
            eyeIcon.classList.toggle("fa-eye-slash", isHidden);
        }

        const label = isHidden ? "Hide password" : "Show password";

        toggleElement.setAttribute("aria-label", label);
        toggleElement.setAttribute("title", label);
        toggleElement.setAttribute(
            "aria-pressed",
            String(isHidden)
        );
    });
}

setupPasswordToggle(togglePassword, passwordInput);
setupPasswordToggle(toggleConfirmPassword, confirmPasswordInput);


/* =========================================================
   AUTH FORM SUBMISSION
   ========================================================= */

if (authForm) {
    authForm.addEventListener("submit", async event => {
        event.preventDefault();

        // Prevent duplicate submissions.
        if (authSubmit && authSubmit.disabled) {
            return;
        }

        const name = nameInput
            ? nameInput.value.trim()
            : "";

        const email = emailInput
            ? emailInput.value.trim()
            : "";

        const password = passwordInput
            ? passwordInput.value
            : "";

        const isSignup = authMode === "signup";

        const confirmPassword = confirmPasswordInput
            ? confirmPasswordInput.value
            : "";

        clearAuthMessage();

        // Validate confirmation before sending the request.
        if (isSignup && password !== confirmPassword) {
            showAuthMessage(
                "Passwords do not match. Please try again.",
                "error"
            );

            if (confirmPasswordInput) {
                confirmPasswordInput.focus();
            }

            return;
        }

        if (authSubmit) {
            authSubmit.disabled = true;
            authSubmit.setAttribute("aria-busy", "true");
        }

        let redirectAfterSuccess = false;

        try {
            const endpoint = isSignup
                ? `${API_BASE_URL}/auth/register`
                : `${API_BASE_URL}/auth/login`;

            const payload = isSignup
                ? { name, email, password }
                : { email, password };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            // Handle APIs that might return a non-JSON response.
            let data = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                showAuthMessage(
                    data.message ||
                        (
                            isSignup
                                ? "Registration failed. Please try again."
                                : "Invalid email or password."
                        ),
                    "error"
                );

                return;
            }

            const userToken =
                data.token ||
                (data.user && data.user.token);

            if (userToken) {
                localStorage.setItem("token", userToken);
            }

            if (isSignup) {
                showAuthMessage(
                    "Registration successful! Redirecting to your dashboard...",
                    "success"
                );
            }

          // Decide where to redirect after successful login.
const loggedInUser = data.user || data.profile || {};
let userRole = String(
    loggedInUser.role || data.role || ""
).toLowerCase();

// If the login response does not include the role,
// request the authenticated user's profile.
if (!userRole && userToken) {
    try {
        const profileResponse = await fetch(
            `${API_BASE_URL}/user/profile`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            }
        );

        if (profileResponse.ok) {
            const profileData = await profileResponse.json();

            const profile =
                profileData.user ||
                profileData.profile ||
                profileData;

            userRole = String(
                profile.role || profile.userRole || ""
            ).toLowerCase();

            // Keep the profile available for other pages.
            localStorage.setItem(
                "skillhubUser",
                JSON.stringify(profile)
            );
        }
    } catch (error) {
        console.error("Unable to retrieve user role:", error);
    }
}

redirectAfterSuccess = true;

setTimeout(() => {
    if (userRole === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "dashboard.html";
    }
}, 1000);

        } catch (error) {
            console.error(
                isSignup ? "Registration error:" : "Login error:",
                error
            );

            showAuthMessage(
                "Unable to connect to the server. Please try again.",
                "error"
            );

        } finally {
            if (!redirectAfterSuccess && authSubmit) {
                authSubmit.disabled = false;
                authSubmit.removeAttribute("aria-busy");
            }
        }
    });
}


/* =========================================================
   INITIAL AUTH STATE
   ========================================================= */

setAuthMode("signin");


/* =========================================================
   LOAD PLATFORM STATISTICS
   ========================================================= */

loadPlatformStats();

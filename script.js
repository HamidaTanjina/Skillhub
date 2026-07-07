// =======================
// THEME TOGGLE
// =======================
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-theme");
        themeToggle.innerHTML = document.body.classList.contains("light-theme")
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';
    });
}

// =======================
// TOAST POPUPS
// =======================
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// =======================
// ROADMAP SCROLL TRIGGER ANIMATIONS
// =======================
const cards = document.querySelectorAll(".road-card");

function animateRoadmap() {
    cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) {
            card.classList.add("active");
            card.classList.add("popped");
        }
    });
}

window.addEventListener("scroll", animateRoadmap);
animateRoadmap();

// =======================
// FEATURE TRACK REVEAL
// =======================
const featureCards = document.querySelectorAll(".feature-card");

function revealCards() {
    featureCards.forEach(card => {
        const top = card.getBoundingClientRect().top;
        if (top < window.innerHeight - 100) {
            card.classList.add("show");
        }
    });
}

window.addEventListener("scroll", revealCards);
revealCards();

// =======================
// FEATURE INTERACTION SELECT
// =======================
featureCards.forEach(card => {
    card.addEventListener("click", () => {
        featureCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
    });
});

// =======================
// ACTIVE LINK ON SCROLL
// =======================
const sections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
        const top = section.offsetTop - 150;
        if (window.scrollY >= top) {
            current = section.getAttribute("id");
        }
    });

    navItems.forEach(link => {
        link.classList.remove("active-link");
        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active-link");
        }
    });
});

// =======================
// AUTH CONSOLE OVERLAY MANAGER
// =======================
const modal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");

const loginButtons = document.querySelectorAll(".login-btn");
const signupButtons = document.querySelectorAll(".signup-link");

const authForm = document.getElementById("authForm");
const authModeText = document.getElementById("authModeText");
const authSubtitleText = document.getElementById("authSubtitleText");
const authSubmit = document.getElementById("authSubmit");
const authSwitch = document.getElementById("authSwitch");

const nameInputWrapper = document.getElementById("nameInputWrapper");
const confirmPasswordWrapper = document.getElementById("confirmPasswordWrapper");
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");
const forgotLink = document.getElementById("forgotLink");

let authMode = "signin";

// =======================
// DATABASE CONTROLS (LOCAL STORAGE)
// =======================
function getUsers() {
    return JSON.parse(localStorage.getItem("skillhubUsers") || "[]");
}

function saveUsers(users) {
    localStorage.setItem("skillhubUsers", JSON.stringify(users));
}

// =======================
// MODE SCHEME PROFILE SETUP
// =======================
function setAuthMode(mode) {
    authMode = mode;
    const isSignup = mode === "signup";

    // Matching screenshot design copy blocks perfectly
    if (authModeText) authModeText.textContent = isSignup ? "Welcome to SkillSwap!" : "Welcome Back!";
    if (authSubtitleText) authSubtitleText.textContent = isSignup ? "Sign Up" : "Sign In";
    
    const btnText = authSubmit ? authSubmit.querySelector(".btn-text") : null;
    if (btnText) {
        btnText.textContent = isSignup ? "Sign Up" : "Sign In";
    } else if (authSubmit) {
        authSubmit.textContent = isSignup ? "Sign Up" : "Sign In";
    }

    if (authSwitch) authSwitch.textContent = isSignup ? "Back to Sign In" : "Create Account";

    if (isSignup) {
        if (nameInputWrapper) nameInputWrapper.style.display = "block";
        if (confirmPasswordWrapper) confirmPasswordWrapper.style.display = "block";
        if (nameInput) nameInput.required = true;
        if (confirmPasswordInput) confirmPasswordInput.required = true;
        if (forgotLink) forgotLink.style.display = "none";
    } else {
        if (nameInputWrapper) nameInputWrapper.style.display = "none";
        if (confirmPasswordWrapper) confirmPasswordWrapper.style.display = "none";
        if (nameInput) nameInput.required = false;
        if (confirmPasswordInput) confirmPasswordInput.required = false;
        if (forgotLink) forgotLink.style.display = "block";
    }
}

// =======================
// INTERFACE ACTION TOGGLES
// =======================
function openAuthMode(mode) {
    setAuthMode(mode);
    if (authForm) authForm.reset();
    if (modal) modal.classList.add("active");
    if (emailInput) setTimeout(() => emailInput.focus(), 100);
}

loginButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        openAuthMode("signin");
    });
});

signupButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        openAuthMode("signup");
    });
});

if (closeModal) {
    closeModal.addEventListener("click", () => {
        modal.classList.remove("active");
    });
}

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("active");
    }
});

if (authSwitch) {
    authSwitch.addEventListener("click", (e) => {
        e.preventDefault();
        setAuthMode(authMode === "signin" ? "signup" : "signin");
    });
}

// =======================
// FORM DATA VERIFICATION HANDLER
// =======================
if (authForm) {
    authForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const users = getUsers();
        const existingUser = users.find(u => u.email === email);

        if (authMode === "signup") {
            const confirmPassword = confirmPasswordInput.value;

            if (password !== confirmPassword) {
                showToast("Passwords do not match!");
                return;
            }

            if (existingUser) {
                showToast("Account already exists. Please sign in.");
                setAuthMode("signin");
                return;
            }

            users.push({
                name: nameInput.value.trim(),
                email,
                password
            });

            saveUsers(users);
            showToast("Account created successfully!");
        } else {
            if (!existingUser || existingUser.password !== password) {
                showToast("Invalid email or password");
                return;
            }
            showToast(`Welcome back, ${existingUser.name || email}!`);
        }

        localStorage.setItem("skillhubCurrentUser", email);
        
        const successCheck = document.querySelector(".success-check");
        if (successCheck) {
            successCheck.classList.add("active");
            setTimeout(() => {
                modal.classList.remove("active");
                successCheck.classList.remove("active");
            }, 2000);
        } else {
            modal.classList.remove("active");
        }
    });
}

// =======================
// MOBILE MENU
// =======================
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        menuBtn.classList.toggle("fa-bars");
        menuBtn.classList.toggle("fa-xmark");
    });
}

// =======================
// SHRINK NAVBAR
// =======================
const navbar = document.querySelector(".navbar");

if (navbar) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 80) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}

// =======================
// SHOW / HIDE PASSWORD
// =======================
const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
        const type = passwordInput.type === "password" ? "text" : "password";
        passwordInput.type = type;
        togglePassword.classList.toggle("fa-eye");
        togglePassword.classList.toggle("fa-eye-slash");
    });
}

if (toggleConfirmPassword && confirmPasswordInput) {
    toggleConfirmPassword.addEventListener("click", () => {
        const type = confirmPasswordInput.type === "password" ? "text" : "password";
        confirmPasswordInput.type = type;
        toggleConfirmPassword.classList.toggle("fa-eye");
        toggleConfirmPassword.classList.toggle("fa-eye-slash");
    });
}

// Initialize layout parameters seamlessly
setAuthMode("signin");
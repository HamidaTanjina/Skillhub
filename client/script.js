// ==========================================
// DOM ELEMENTS POOL & STATE MGMT
// ==========================================
const themeToggle = document.getElementById("themeToggle");
const navbar = document.querySelector(".navbar");
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const navItems = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("section");

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

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
const featureCards = document.querySelectorAll(".feature-card");

let authMode = "signin";

// ==========================================
// SCROLL TRACKING ENGINE
// ==========================================
function evaluateNavbarAndLinks() {
    const scrollPos = window.scrollY;

    // Navbar Scroll Toggle Class
    if (navbar) {
        navbar.classList.toggle("scrolled", scrollPos > 50);
    }

    // Dynamic Navigation Track Syncing
    let currentSectionId = "";
    
    // Page bottom edge-case detection to ensure the last section activates properly
    const isAtBottom = (window.innerHeight + scrollPos) >= (document.documentElement.scrollHeight - 10);
    
    if (isAtBottom && sections.length > 0) {
        currentSectionId = sections[sections.length - 1].getAttribute("id");
    } else {
        sections.forEach(section => {
            const top = section.offsetTop - 180;
            if (scrollPos >= top) {
                currentSectionId = section.getAttribute("id");
            }
        });
    }

    navItems.forEach(link => {
        const href = link.getAttribute("href");
        link.classList.toggle("active-link", !!(currentSectionId && href === "#" + currentSectionId));
    });
}

window.addEventListener("scroll", evaluateNavbarAndLinks, { passive: true });
document.addEventListener("DOMContentLoaded", evaluateNavbarAndLinks);

// ==========================================
// MOBILITY NAVIGATION HANDLERS
// ==========================================
if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        const isOpen = navLinks.classList.contains("active");
        menuBtn.classList.toggle("fa-bars", !isOpen);
        menuBtn.classList.toggle("fa-xmark", isOpen);
    });

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navLinks.classList.remove("active");
            menuBtn.classList.add("fa-bars");
            menuBtn.classList.remove("fa-xmark");
        });
    });
}

// ==========================================
// TOAST NOTIFICATIONS SYSTEM
// ==========================================
let toastTimeout;
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.add("show");
    
    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// ==========================================
// UNIFIED THEME SYNCING ENGINE
// ==========================================
function applySynchronizedTheme(isLight) {
    document.body.classList.toggle("light-theme", isLight);
    if (themeToggle) {
        themeToggle.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    }
}

// Persistent Storage Check
const storedTheme = localStorage.getItem("skillhubTheme") || "dark";
applySynchronizedTheme(storedTheme === "light");

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const isLightActive = !document.body.classList.contains("light-theme");
        localStorage.setItem("skillhubTheme", isLightActive ? "light" : "dark");
        applySynchronizedTheme(isLightActive);
    });
}

// Interactive Feature Card Selectors
featureCards.forEach(card => {
    card.addEventListener("click", () => {
        featureCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
    });
});

// ==========================================
// AUTH VISIBILITY & STATE REFACTORING
// ==========================================
function resetPasswordVisibility() {
    if (passwordInput && togglePassword) {
        passwordInput.type = "password";
        togglePassword.classList.add("fa-eye");
        togglePassword.classList.remove("fa-eye-slash");
    }
    if (confirmPasswordInput && toggleConfirmPassword) {
        confirmPasswordInput.type = "password";
        toggleConfirmPassword.classList.add("fa-eye");
        toggleConfirmPassword.classList.remove("fa-eye-slash");
    }
}

function setAuthMode(mode) {
    authMode = mode;
    const isSignup = mode === "signup";

    resetPasswordVisibility();

    if (authModeText) authModeText.textContent = isSignup ? "Welcome to SkillHub!" : "Welcome Back!";
    if (authSubtitleText) authSubtitleText.textContent = isSignup ? "Create Account" : "Sign In";
    
    const btnText = authSubmit ? authSubmit.querySelector(".btn-text") : null;
    if (btnText) {
        btnText.textContent = isSignup ? "Sign Up" : "Sign In";
    }

    if (authSwitch) authSwitch.textContent = isSignup ? "Back to Sign In" : "Create Account";

    if (nameInputWrapper) nameInputWrapper.style.display = isSignup ? "block" : "none";
    if (confirmPasswordWrapper) confirmPasswordWrapper.style.display = isSignup ? "block" : "none";
    if (nameInput) nameInput.required = isSignup;
    if (confirmPasswordInput) confirmPasswordInput.required = isSignup;
    if (forgotLink) forgotLink.style.display = isSignup ? "none" : "block";
}

// ==========================================
// SIMULATED AUTH OVERLAY CONTROLLERS
// ==========================================
function openAuthMode(mode) {
    setAuthMode(mode);
    if (authForm) authForm.reset();
    if (modal) modal.classList.add("active");
    if (emailInput) setTimeout(() => emailInput.focus(), 200);
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
    closeModal.addEventListener("click", () => modal.classList.remove("active"));
}

window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
});

if (authSwitch) {
    authSwitch.addEventListener("click", (e) => {
        e.preventDefault();
        setAuthMode(authMode === "signin" ? "signup" : "signin");
    });
}

// ==========================================
// LIVE BACKEND AUTH & FORM CONTROLLERS
// ==========================================
if (authForm) {
    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = nameInput ? nameInput.value.trim() : "";
        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        // --- SUBMIT REGISTRATION (SIGN UP MODE) ---
        if (authMode === "signup") {
            const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";
            
            if (password !== confirmPassword) {
                showToast("Error: Passwords do not match!");
                return;
            }
            if (password.length < 6) {
                showToast("Error: Password must be at least 6 characters.");
                return;
            }

            try {
                const response = await fetch("https://skillhub-backend-cths.onrender.com/api/auth/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    showToast(" Registration successful! Redirecting...");
                    
                    // Save JWT token if sent during registration, then redirect
                    if (data.token) localStorage.setItem("token", data.token);
                    
                    setTimeout(() => {
                        window.location.href = "dashboard.html";
                    }, 1000);
                } else {
                    showToast(` Error: ${data.message || "Registration failed."}`);
                }

            } catch (error) {
                console.error("Network Exception:", error);
                showToast(" Connection error. Is your local server running?");
            }

        // --- SUBMIT AUTHENTICATION (SIGN IN MODE) ---
        } else {
            try {
                const response = await fetch("https://skillhub-backend-cths.onrender.com/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    showToast("✅ Login Successful! Redirecting...");
                    
                    // Save the authentication token securely in browser storage
                    if (data.token) {
                        localStorage.setItem("token", data.token);
                    }
                    
                    // Brief delay to allow the success toast to be visible before bouncing pages
                    setTimeout(() => {
                        window.location.href = "dashboard.html";
                    }, 1000);
                } else {
                    showToast(`Error: ${data.message || "Invalid credentials."}`);
                }

            } catch (error) {
                console.error("Network Exception:", error);
                showToast("Connection error. Is your local server running?");
            }
        }
    });
}

// ==========================================
// REUSABLE PASSWORD INPUT REVEAL ENGINE
// ==========================================
function setupPasswordToggle(toggleElement, inputElement) {
    if (!toggleElement || !inputElement) return;
    
    toggleElement.addEventListener("click", () => {
        const isHidden = inputElement.type === "password";
        inputElement.type = isHidden ? "text" : "password";
        toggleElement.classList.toggle("fa-eye-slash", isHidden);
        toggleElement.classList.toggle("fa-eye", !isHidden);
    });
}

setupPasswordToggle(togglePassword, passwordInput);
setupPasswordToggle(toggleConfirmPassword, confirmPasswordInput);

// Initialize Default Mode
setAuthMode("signin");
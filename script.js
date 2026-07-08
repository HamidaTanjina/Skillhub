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

// Clean Lightweight Scroll Listener for Nav Updates
function evaluateNavbarAndLinks() {
    const scrollPos = window.scrollY;

    // Navbar Scroll Toggle Class
    if (navbar) {
        if (scrollPos > 50) navbar.classList.add("scrolled");
        else navbar.classList.remove("scrolled");
    }

    // Dynamic Navigation Track Syncing
    let currentSectionId = "";
    sections.forEach(section => {
        const top = section.offsetTop - 180;
        if (scrollPos >= top) {
            currentSectionId = section.getAttribute("id");
        }
    });

    navItems.forEach(link => {
        link.classList.remove("active-link");
        if (currentSectionId && link.getAttribute("href") === "#" + currentSectionId) {
            link.classList.add("active-link");
        }
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
        menuBtn.classList.toggle("fa-bars");
        menuBtn.classList.toggle("fa-xmark");
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
    if (isLight) {
        document.body.classList.add("light-theme");
    } else {
        document.body.classList.remove("light-theme");
    }
    
    const iconMarkup = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    if (themeToggle) themeToggle.innerHTML = iconMarkup;
}

// Persistent Storage Check
const storedTheme = localStorage.getItem("skillhubTheme") || "dark";
applySynchronizedTheme(storedTheme === "light");

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-theme");
        const isLightActive = document.body.classList.contains("light-theme");
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
// DIRECT SIMULATED AUTH CONTROLLERS
// ==========================================
if (authForm) {
    authForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Simple Front-end Validation Checklist
        if (authMode === "signup") {
            const confirmPassword = confirmPasswordInput.value;
            if (password !== confirmPassword) {
                showToast("❌ Error: Passwords do not match!");
                return;
            }
            if (password.length < 6) {
                showToast("❌ Error: Password must be at least 6 characters.");
                return;
            }
            showToast("🚀 Account Registered Successfully!");
        } else {
            showToast("✅ Login Successful!");
        }

        // Clean, instantaneous UI clearance
        modal.classList.remove("active");
        authForm.reset();
        
        // Notify user that they are visually logged in
        document.querySelector(".hero-badge").innerHTML = `<i class="fa-solid fa-circle-user"></i> Simulated Session: Active`;
    });
}

// ==========================================
// PASSWORD INPUT REVEAL ENGINE
// ==========================================
if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
        const isCurrentlyHidden = passwordInput.type === "password";
        passwordInput.type = isCurrentlyHidden ? "text" : "password";
        togglePassword.classList.toggle("fa-eye-slash", isCurrentlyHidden);
        togglePassword.classList.toggle("fa-eye", !isCurrentlyHidden);
    });
}

if (toggleConfirmPassword && confirmPasswordInput) {
    toggleConfirmPassword.addEventListener("click", () => {
        const isCurrentlyHidden = confirmPasswordInput.type === "password";
        confirmPasswordInput.type = isCurrentlyHidden ? "text" : "password";
        toggleConfirmPassword.classList.toggle("fa-eye-slash", isCurrentlyHidden);
        toggleConfirmPassword.classList.toggle("fa-eye", !isCurrentlyHidden);
    });
}

setAuthMode("signin");
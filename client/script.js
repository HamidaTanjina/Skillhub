const API_BASE_URL = "https://skillhub-backend-cths.onrender.com/api";

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

let authMode = "signin";

function evaluateNavbarAndLinks() {
    const scrollPos = window.scrollY;
    if (navbar) navbar.classList.toggle("scrolled", scrollPos > 50);

    let currentSectionId = "";
    sections.forEach(section => {
        const top = section.offsetTop - 180;
        if (scrollPos >= top) currentSectionId = section.getAttribute("id");
    });

    navItems.forEach(link => {
        const href = link.getAttribute("href");
        link.classList.toggle("active-link", !!(currentSectionId && href === "#" + currentSectionId));
    });
}

window.addEventListener("scroll", evaluateNavbarAndLinks, { passive: true });

if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        const isOpen = navLinks.classList.contains("active");
        menuBtn.classList.toggle("fa-bars", !isOpen);
        menuBtn.classList.toggle("fa-xmark", isOpen);
    });
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 4000);
}

function setAuthMode(mode) {
    authMode = mode;
    const isSignup = mode === "signup";

    if (authModeText) authModeText.textContent = isSignup ? "Welcome to SkillHub!" : "Welcome Back!";
    if (authSubtitleText) authSubtitleText.textContent = isSignup ? "Create Account" : "Sign In";
    
    const btnText = authSubmit ? authSubmit.querySelector(".btn-text") : null;
    if (btnText) btnText.textContent = isSignup ? "Sign Up" : "Sign In";

    if (authSwitch) authSwitch.textContent = isSignup ? "Back to Sign In" : "Create Account";

    if (nameInputWrapper) nameInputWrapper.style.display = isSignup ? "block" : "none";
    if (confirmPasswordWrapper) confirmPasswordWrapper.style.display = isSignup ? "block" : "none";
    if (nameInput) nameInput.required = isSignup;
    if (confirmPasswordInput) confirmPasswordInput.required = isSignup;
    if (forgotLink) forgotLink.style.display = isSignup ? "none" : "block";
}

function openAuthMode(mode) {
    setAuthMode(mode);
    if (authForm) authForm.reset();
    if (modal) modal.classList.add("active");
}

loginButtons.forEach(btn => btn.addEventListener("click", (e) => { e.preventDefault(); openAuthMode("signin"); }));
signupButtons.forEach(btn => btn.addEventListener("click", (e) => { e.preventDefault(); openAuthMode("signup"); }));

if (closeModal) closeModal.addEventListener("click", () => modal.classList.remove("active"));
window.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("active"); });

if (authSwitch) {
    authSwitch.addEventListener("click", (e) => {
        e.preventDefault();
        setAuthMode(authMode === "signin" ? "signup" : "signin");
    });
}

function setupPasswordToggle(toggleElement, inputElement) {
    if (!toggleElement || !inputElement) return;
    toggleElement.addEventListener("click", (e) => {
        e.preventDefault();
        const isHidden = inputElement.type === "password";
        inputElement.type = isHidden ? "text" : "password";
        toggleElement.classList.toggle("fa-eye-slash", isHidden);
        toggleElement.classList.toggle("fa-eye", !isHidden);
    });
}

setupPasswordToggle(togglePassword, passwordInput);
setupPasswordToggle(toggleConfirmPassword, confirmPasswordInput);

if (authForm) {
    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = nameInput ? nameInput.value.trim() : "";
        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        const btnText = authSubmit ? authSubmit.querySelector(".btn-text") : null;
        if (authSubmit) authSubmit.disabled = true;

        if (authMode === "signup") {
            const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";
            if (password !== confirmPassword) {
                showToast("⚠️ Passwords do not match!");
                if (authSubmit) authSubmit.disabled = false;
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    showToast("🎉 Registration successful! Redirecting...");
                    const userToken = data.token || (data.user && data.user.token);
                    if (userToken) localStorage.setItem("token", userToken);
                    setTimeout(() => window.location.href = "dashboard.html", 1000);
                } else {
                    showToast(`❌ ${data.message || "Registration failed."}`);
                }
            } catch (error) {
                showToast("⚡ Network error. Please try again.");
            } finally {
                if (authSubmit) authSubmit.disabled = false;
            }
        } else {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    showToast("✅ Login Successful! Redirecting...");
                    const userToken = data.token || (data.user && data.user.token);
                    if (userToken) localStorage.setItem("token", userToken);
                    setTimeout(() => window.location.href = "dashboard.html", 1000);
                } else {
                    showToast(`❌ ${data.message || "Invalid credentials."}`);
                }
            } catch (error) {
                showToast("⚡ Server connection error.");
            } finally {
                if (authSubmit) authSubmit.disabled = false;
            }
        }
    });
}

setAuthMode("signin");
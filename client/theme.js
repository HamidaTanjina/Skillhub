// ==========================================
// SkillHub Global Theme Controller
// ==========================================

(() => {

    const STORAGE_KEY = "skillhubTheme";

    // ==========================
    // Apply Theme
    // ==========================

    function applyTheme(theme) {

        const isLight = theme === "light";

        document.documentElement.classList.toggle("light-theme", isLight);

        if (document.body) {
            document.body.classList.toggle("light-theme", isLight);
        }

        updateIcons(isLight);

    }

    // ==========================
    // Save Theme
    // ==========================

    function saveTheme(theme) {

        localStorage.setItem(STORAGE_KEY, theme);

    }

    // ==========================
    // Toggle Theme
    // ==========================

    function toggleTheme() {

        const isLight =
            document.documentElement.classList.contains("light-theme");

        const newTheme = isLight ? "dark" : "light";

        applyTheme(newTheme);

        saveTheme(newTheme);

    }

    // Make available globally
    window.toggleTheme = toggleTheme;

    // ==========================
    // Update Icons
    // ==========================

    function updateIcons(isLight) {

        document
            .querySelectorAll(".theme-toggle-btn, #themeToggle")
            .forEach(button => {

                if (button.tagName === "I") {

                    button.className =
                        isLight
                            ? "fa-solid fa-sun"
                            : "fa-solid fa-moon";

                } else {

                    const icon = button.querySelector("i");

                    if (icon) {

                        icon.className =
                            isLight
                                ? "fa-solid fa-sun"
                                : "fa-solid fa-moon";

                    }

                }

            });

    }

    // ==========================
    // Page Loaded
    // ==========================

    document.addEventListener("DOMContentLoaded", () => {

        // Apply saved theme

        const savedTheme =
            localStorage.getItem(STORAGE_KEY) || "dark";

        applyTheme(savedTheme);

        // Attach click events

        document
            .querySelectorAll(".theme-toggle-btn, #themeToggle")
            .forEach(button => {

                button.addEventListener("click", toggleTheme);

            });

    });

})();
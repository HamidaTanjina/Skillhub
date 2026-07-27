// ==========================================
// SkillHub Global Theme Controller
// ==========================================

(function () {

    const STORAGE_KEY = "skillhubTheme";

    // Apply saved theme immediately
    const savedTheme = localStorage.getItem(STORAGE_KEY);

    if (savedTheme === "light") {
        document.documentElement.classList.add("light-theme");
        document.body.classList.add("light-theme");
    }

    // ===========================
    // Toggle Theme
    // ===========================

    window.toggleTheme = function () {

        document.body.classList.toggle("light-theme");
        document.documentElement.classList.toggle("light-theme");

        const isLight =
            document.body.classList.contains("light-theme");

        localStorage.setItem(
            STORAGE_KEY,
            isLight ? "light" : "dark"
        );

        updateIcons(isLight);

    };

    // ===========================
    // Update Moon / Sun Icons
    // ===========================

    function updateIcons(isLight) {

        document
            .querySelectorAll(".theme-toggle-btn,#themeToggle")
            .forEach(btn => {

                if (btn.tagName === "I") {

                    btn.className =
                        isLight
                            ? "fa-solid fa-sun"
                            : "fa-solid fa-moon";

                }

                else {

                    const icon = btn.querySelector("i");

                    if (icon) {

                        icon.className =
                            isLight
                                ? "fa-solid fa-sun"
                                : "fa-solid fa-moon";

                    }

                }

            });

    }

    // ===========================
    // Page Load
    // ===========================

    document.addEventListener("DOMContentLoaded", () => {

        const isLight =
            document.body.classList.contains("light-theme");

        updateIcons(isLight);

        document
            .querySelectorAll(".theme-toggle-btn,#themeToggle")
            .forEach(btn => {

                btn.addEventListener("click", toggleTheme);

            });

    });

})();
// ==========================================
// SkillHub Global Theme Controller
// ==========================================

(function () {

    const STORAGE_KEY = "skillhubTheme";


    // ==========================================
    // APPLY SAVED THEME
    // ==========================================

    function applyTheme(theme) {

        const isLight = theme === "light";

        document.body.classList.toggle(
            "light-theme",
            isLight
        );

        updateIcons(isLight);
    }


    // ==========================================
    // UPDATE MOON / SUN ICONS
    // ==========================================

    function updateIcons(isLight) {

        document
            .querySelectorAll(
                ".theme-toggle-btn, #themeToggle"
            )
            .forEach(button => {

                // Direct <i> icon
                if (button.tagName === "I") {

                    button.className = isLight
                        ? "fa-solid fa-sun"
                        : "fa-solid fa-moon";

                }

                // Button containing <i>
                else {

                    const icon =
                        button.querySelector("i");

                    if (icon) {

                        icon.className = isLight
                            ? "fa-solid fa-sun"
                            : "fa-solid fa-moon";
                    }
                }

            });
    }


    // ==========================================
    // TOGGLE THEME
    // ==========================================

    window.toggleTheme = function () {

        const isLight =
            !document.body.classList.contains(
                "light-theme"
            );

        applyTheme(
            isLight ? "light" : "dark"
        );

        localStorage.setItem(
            STORAGE_KEY,
            isLight ? "light" : "dark"
        );
    };


    // ==========================================
    // PAGE LOAD
    // ==========================================

    const savedTheme =
        localStorage.getItem(STORAGE_KEY);


    document.addEventListener(
        "DOMContentLoaded",
        () => {

            // Default = dark
            applyTheme(
                savedTheme === "light"
                    ? "light"
                    : "dark"
            );


            // Add click events
            document
                .querySelectorAll(
                    ".theme-toggle-btn, #themeToggle"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        window.toggleTheme
                    );

                });

        }
    );

})();
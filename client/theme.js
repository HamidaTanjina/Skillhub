// Global Theme Controller
(function () {
    const storedTheme = localStorage.getItem("skillhubTheme") || "dark";
    if (storedTheme === "light") {
        document.body.classList.add("light-theme");
    }

    window.toggleTheme = function () {
        const isLight = document.body.classList.toggle("light-theme");
        localStorage.setItem("skillhubTheme", isLight ? "light" : "dark");
        updateThemeIcons(isLight);
    };

    function updateThemeIcons(isLight) {
        const themeBtns = document.querySelectorAll(".theme-toggle-btn, #themeToggle");
        themeBtns.forEach(btn => {
            const icon = btn.querySelector("i");
            if (icon) {
                icon.className = isLight ? "fa-solid fa-sun" : "fa-solid fa-moon";
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        const isLight = document.body.classList.contains("light-theme");
        updateThemeIcons(isLight);
        
        const toggleButtons = document.querySelectorAll(".theme-toggle-btn, #themeToggle");
        toggleButtons.forEach(btn => {
            btn.addEventListener("click", window.toggleTheme);
        });
    });
})();
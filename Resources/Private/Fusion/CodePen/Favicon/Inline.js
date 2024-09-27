const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");

let darkMode = darkModePreference.matches;
addBodyClass();

darkModePreference.addEventListener("change", () => {
    toggleColorScheme(!!darkModePreference.matches);
});

function addBodyClass() {
    document.documentElement.classList.toggle("dark", darkMode);
}

function getStyleSheetMediaRules() {
    const svg = document.querySelector("#carbon-codepen-preview svg");
    const style = svg?.querySelector("style");
    if (!svg || !style) {
        return [];
    }
    let styleSheetRules;
    [...document.styleSheets].forEach((sheet) => {
        if (sheet.ownerNode === style && sheet.rules) {
            styleSheetRules = sheet.rules;
        }
    });
    let rules = [];
    for (const rule of styleSheetRules) {
        const media = rule?.media;
        if (media?.mediaText?.includes("prefers-color-scheme")) {
            rules.push(media);
        }
    }
    return rules;
}

function toggleColorScheme(forceMode) {
    if (typeof forceMode === "boolean") {
        darkMode = forceMode;
    } else {
        darkMode = !darkMode;
    }
    addBodyClass();

    const styleSheetMediaRules = getStyleSheetMediaRules();
    for (const media of styleSheetMediaRules) {
        if (darkMode) {
            media.appendMedium("(prefers-color-scheme: light)");
            media.appendMedium("(prefers-color-scheme: dark)");
            if (media.mediaText.includes("original")) {
                media.deleteMedium("original-prefers-color-scheme");
            }
            continue;
        }

        media.appendMedium("original-prefers-color-scheme");
        if (media.mediaText.includes("light")) {
            media.deleteMedium("(prefers-color-scheme: light)");
        }
        if (media.mediaText.includes("dark")) {
            media.deleteMedium("(prefers-color-scheme: dark)");
        }
    }
}

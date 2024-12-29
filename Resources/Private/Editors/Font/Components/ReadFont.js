import { getFilePath } from "/_Resources/Static/Packages/Carbon.Webfonts/Editor/Helper.js";

let FontLib;
const regex = /url\(['"]?(?<url>[^"')]+)/gm;
const emptyReturn = {
    features: [],
    variations: [],
};

// https://simoncozens.github.io/feature-tags/
const disallowedFeatures = ["liga", "ccmp", "rvrn", "dnom", "numr", "init", "fina", "medi", "rlig", "locl", "frac"];

async function readFont(cssFile) {
    if (!FontLib) {
        await import("/_Resources/Static/Packages/Litefyr.Style/Editors/Inflate.js");
        await import("/_Resources/Static/Packages/Litefyr.Style/Editors/Unbrotli.js");
        const { Font } = await import("/_Resources/Static/Packages/Litefyr.Style/Editors/FontLib.js");
        FontLib = Font;
    }

    let filePath = getFilePath(cssFile);
    if (!filePath) {
        return emptyReturn;
    }
    if (!filePath.startsWith("http://") && !filePath.startsWith("https://")) {
        filePath = window.location.origin + filePath;
    }
    // Remove filename from filepath
    const basePath = filePath.replace(/\/[^/]*$/, "/");
    let fontName = null;
    let fontFiles = [];
    [...document.styleSheets].some((styleSheet) => {
        if (styleSheet.href === filePath) {
            const cssRules = [...styleSheet.cssRules];
            // all the font-faces rules
            const rulesFontFace = cssRules.filter((rule) => rule.cssText.startsWith("@font-face"));

            rulesFontFace.forEach((fontFace) => {
                if (!fontName) {
                    fontName = fontFace.style.getPropertyValue("font-family").replace(/['"]+/g, "");
                }
                const src = fontFace.style.getPropertyValue("src");
                const match = regex.exec(src);
                const url = match?.groups?.url;
                if (url) {
                    fontFiles.push(resolvePath(url, basePath));
                }
            });
            return true;
        }
        return false;
    });
    if (!fontFiles.length) {
        return emptyReturn;
    }

    const features = [];
    const variations = {};

    const promises = fontFiles.map((filepathToFont, index) => {
        return new Promise((resolve) => {
            const fontObject = new FontLib(fontName + index);
            fontObject.onerror = () => resolve();
            fontObject.onload = async (event) => {
                const { fontFeatureSettings, fontVariationSettings } = await fontCheck(event);
                // Push the font-feature-settings to the array
                if (fontFeatureSettings?.length) {
                    fontFeatureSettings.forEach((feature) => {
                        if (!features.includes(feature) && !disallowedFeatures.includes(feature)) {
                            features.push(feature);
                        }
                    });
                }

                // Push the font-variation-settings to the object
                if (fontVariationSettings && Object.keys(fontVariationSettings).length) {
                    Object.entries(fontVariationSettings).forEach(([key, config]) => {
                        if (!variations[key]) {
                            variations[key] = config;
                        }
                    });
                }
                resolve();
            };
            fontObject.src = filepathToFont;
        });
    });

    await Promise.all(promises);
    return { features, variations: Object.values(variations) };
}

function resolvePath(path, basePath = window.location.origin) {
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    if (path.startsWith("/")) {
        return window.location.origin + path;
    }

    if (!basePath.endsWith("/")) {
        basePath += "/";
    }

    const resolvedPath = path
        .split("/")
        .reduce((a, v) => {
            if (v === "..") {
                a.pop();
            } else if (v !== ".") {
                a.push(v);
            }
            return a;
        }, [])
        .join("/");

    return basePath + resolvedPath;
}

// When the font's up and loaded in, let's do some testing!
function fontCheck(event) {
    // We can either rely on scoped access to font, but because the onload function
    // is not guaranteed to live in the same scope, the font is in the event, too.
    const font = event.detail.font;
    const variable = !!font.opentype.tables.fvar;

    // Then, let's check some OpenType things (fontFeatureSettings)
    let fontFeatureSettings = [];
    const GSUB = font.opentype.tables.GSUB;
    if (GSUB) {
        // Let's figure out which writing scripts this font supports:
        const supportedScripts = GSUB.getSupportedScripts();
        supportedScripts.forEach((script) => {
            const scriptTable = GSUB.getScriptTable(script);
            const supportedLangSys = GSUB.getSupportedLangSys(scriptTable);

            supportedLangSys.forEach((langsys) => {
                const langSysTable = GSUB.getLangSysTable(script, langsys);
                fontFeatureSettings = [
                    ...fontFeatureSettings,
                    ...GSUB.getFeatures(langSysTable).map((f) => f.featureTag),
                ];
            });
        });

        fontFeatureSettings = [...new Set(fontFeatureSettings)];
    }

    // And some OpenType things (fontVariationSettings)
    // wght is a special case, as it is the font-weight
    const fontVariationSettings = {};
    const fontWeight = {
        // options is for fixed font-weights, who are not variable
        options: null,
        // range is for variable font-weights
        range: null,
    };
    if (variable) {
        // Which axes does it support?
        const supportedAxes = font.opentype.tables.fvar.getSupportedAxes();
        let axes = font.opentype.tables.fvar.axes;
        axes = axes.filter((axis) => supportedAxes.includes(axis.tag));
        axes.forEach((axis) => {
            if (axis.tag === "wght") {
                // We have a special case for font-weight and we dont save it in fontVariationSettings
                fontWeight.range = {
                    min: axis.minValue,
                    max: axis.maxValue,
                    default: axis.defaultValue,
                };
                return;
            }
            fontVariationSettings[axis.tag] = {
                tag: axis.tag,
                min: axis.minValue,
                max: axis.maxValue,
                default: axis.defaultValue,
            };
        });
    }

    return {
        fontFeatureSettings,
        fontVariationSettings,
        variable,
        fontWeight,
    };
}

export default readFont;

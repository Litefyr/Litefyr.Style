let FontLib;

async function readFont(font, pluginConfig = {}) {
    const { folder, fonts } = pluginConfig;
    const config = fonts[font];
    if (!FontLib) {
        await import("/_Resources/Static/Packages/Litefyr.Style/Editors/Inflate.js");
        await import("/_Resources/Static/Packages/Litefyr.Style/Editors/Unbrotli.js");
        const { Font } = await import("/_Resources/Static/Packages/Litefyr.Style/Editors/FontLib.js");
        FontLib = Font;
    }

    let fontWeightOptions = null;
    if (config.fontWeight && typeof config.fontWeight !== "string") {
        // The font is not variable, we must know this because of the filename
        fontWeightOptions = Array.isArray(config.fontWeight) ? config.fontWeight : [config.fontWeight];
    }

    let filepathToFont = config?.filepath;
    if (!filepathToFont) {
        const filename = fontWeightOptions ? `${font}-${fontWeightOptions[0]}` : font;
        filepathToFont = `${folder}/${filename}.woff2`;
    }

    return new Promise((resolve, reject) => {
        const fontObject = new FontLib(font);

        fontObject.onerror = (event) => reject(event);
        fontObject.onload = async (event) => {
            let features = await fontCheck(event);
            features.fontWeight.options = fontWeightOptions;
            resolve(features);
        };

        fontObject.src = filepathToFont;
    });
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

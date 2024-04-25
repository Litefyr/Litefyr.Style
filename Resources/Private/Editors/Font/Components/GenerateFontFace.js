export default function generateAllFontFaces(config = {}, renderClass = true) {
    const { fonts, fallback, folder } = config;

    const generateFontFace = ({ font, filepath, weight, fixedWeight = false }) => {
        if (!filepath) {
            const filename = fixedWeight && weight ? `${font}-${weight}` : font;
            filepath = `${folder}/${filename}.woff2`;
        }
        const format = filepath.split(".").pop();
        const fontWeight = weight ? `font-weight:${weight};` : "";
        return `@font-face{font-family:${font};${fontWeight}font-style:normal;font-display:swap;src:url("${filepath}") format("${format}")}`;
    };

    let selector = "";
    const fontFace = Object.keys(fonts)
        .map((font) => {
            const { filepath, fontWeight, group } = fonts[font];

            let css = "";

            if (Array.isArray(fontWeight)) {
                // Fonth as multiple, fixed weights
                fontWeight.forEach((weight) => {
                    css += generateFontFace({ font, filepath, weight, fixedWeight: true });
                });
            } else if (typeof fontWeight === "number") {
                // Font has one, fixed weight
                css += generateFontFace({ font, filepath, weight: fontWeight, fixedWeight: true });
            } else {
                css += generateFontFace({ font, filepath, weight: fontWeight, fixedWeight: false });
            }

            if (renderClass) {
                const family = `'${font}', ${fallback[group]}`;
                selector += `span[title="${font}"],.font-${font}{font-family:${family}}`;
            }

            return css;
        })
        .join("");

    return fontFace + selector;
}

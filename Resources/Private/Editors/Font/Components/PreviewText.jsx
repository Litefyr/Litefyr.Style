import React from "react";
import { neos } from "@neos-project/neos-ui-decorators";
import { Parser, ProcessNodeDefinitions } from "html-to-react";
import { style as styleSheet } from "./index";
import clsx from "clsx";

const neosifier = neos((globalRegistry) => ({
    colorConfig: globalRegistry.get("frontendConfiguration").get("CarbonTailwindColors"),
}));

export default neosifier(PreviewText);

const isValidNode = () => true;

function PreviewText({ text, style, fontWeightBold, type, colors, colorContrastThreshold }) {
    const processNodeDefinitions = ProcessNodeDefinitions();
    const processingInstructions = [
        {
            shouldProcessNode: (node) => node?.parent?.name === "strong",
            processNode: (node) => {
                if (!fontWeightBold) {
                    return node.data;
                }
                node.parent.attribs.style = `font-weight: ${fontWeightBold}`;
                return node.data;
            },
        },
        {
            shouldProcessNode: () => true,
            processNode: processNodeDefinitions.processDefaultNode,
        },
    ];
    const htmlParser = new Parser();

    const isButton = type === "button";

    colors = colors.filter((color) => !!color);

    function getColorFromBackground(background) {
        let luminance = parseFloat(background.split("(")[1].split(" ")[0]);
        if (luminance < 1) {
            luminance *= 100;
        }
        return luminance > colorContrastThreshold ? "black" : "white";
    }

    if (!isButton) {
        return <div style={style}>{htmlParser.parseWithInstructions(text, isValidNode, processingInstructions)}</div>;
    }

    return (
        <div className={styleSheet.buttonPreview}>
            {colors.map((color, index) => (
                <button
                    key={index}
                    type="button"
                    data-theme="main"
                    style={{
                        ...style,
                        cursor: "auto",
                        backgroundColor: color,
                        color: getColorFromBackground(color),
                        "--fluid-bp": "1px",
                    }}
                    class={clsx(styleSheet.btn, styleSheet["btn--inline"])}
                >
                    {text}
                </button>
            ))}
        </div>
    );
}

import React, { Fragment } from "react";
import { neos } from "@neos-project/neos-ui-decorators";
import button from "./Button.module.css";
import clsx from "clsx";
import { style as styleSheet } from "../../Components";

const neosifier = neos((globalRegistry) => ({
    colorConfig: globalRegistry.get("frontendConfiguration").get("CarbonTailwindColors"),
}));

export default neosifier(PreviewText);

function PreviewText({ text, style, type, colorConfig, colors }) {
    const blockQuoteElements = parseTags(text, "blockquote").map(({ tagName, text }) => ({
        tagName,
        text: parseTags(text, "strong"),
    }));

    const strongElements = parseTags(text, "strong");
    const isButton = type === "button";

    colors = colors.filter((color) => !!color);

    return (
        <Fragment>
            {isButton && (
                <div className={styleSheet.buttonPreview}>
                    {colors.map((color, index) => (
                        <button
                            key={index}
                            type="button"
                            data-theme="main"
                            style={{ ...style.normal, cursor: "auto", backgroundColor: color, color: "white" }}
                            class={clsx(button.btn, button["btn--inline"])}
                        >
                            {text}
                        </button>
                    ))}
                </div>
            )}
            {!isButton && (
                <div style={style.normal}>
                    {blockQuoteElements.map(({ tagName, text }, key) => {
                        if (tagName === "blockquote") {
                            return (
                                <blockquote key={key}>
                                    {text.map(({ tagName, text }, key) => {
                                        if (tagName === "strong") {
                                            return (
                                                <strong key={key} style={style.bold}>
                                                    {parseLineBreaks(text)}
                                                </strong>
                                            );
                                        }
                                        return parseLineBreaks(text);
                                    })}
                                </blockquote>
                            );
                        }
                        return text.map(({ tagName, text }, key) => {
                            if (tagName === "strong") {
                                return (
                                    <strong key={key} style={style.bold}>
                                        {parseLineBreaks(text)}
                                    </strong>
                                );
                            }
                            return parseLineBreaks(text);
                        });
                    })}
                </div>
            )}
        </Fragment>
    );
}

function parseLineBreaks(text) {
    return text.split(/<br\s*\/?>/gi).map((line, key) => {
        return (
            <Fragment key={key}>
                {key !== 0 && <br />}
                {line}
            </Fragment>
        );
    });
}

function parseTags(text, tagName = "strong") {
    const elements = [];
    const closingStrong = `</${tagName}>`;
    text.split(`<${tagName}>`).forEach((line) => {
        if (line.includes(closingStrong)) {
            const [strong, normal] = line.split(closingStrong);
            if (strong) {
                elements.push({
                    tagName,
                    text: strong,
                });
            }
            if (normal) {
                elements.push({
                    tagName: null,
                    text: normal,
                });
            }
            return;
        }
        if (line) {
            elements.push({
                tagName: null,
                text: line,
            });
        }
    });
    return elements;
}

import React, { useState, useEffect } from "react";
import { CheckBox } from "@neos-project/react-ui-components";
import clsx from "clsx";
import { style } from "../Components";
import { ControlBar, generateAllFontFaces, PreviewText, readFont } from "./Components";

export default function SecondaryFont({ onChange, value, options, i18nRegistry }) {
    const [state, setState] = useState({
        font: null,
        features: {},
        userSettings: {},
        style: {},
        rangePreview: false,
    });

    function handleCommit(value) {
        if (!value) {
            const newState = {
                font: null,
                features: {},
                userSettings: {},
                style: {
                    normal: {},
                    bold: {},
                },
                rangePreview: state.rangePreview,
            };
            setState(newState);
            onChange();
            return;
        }

        let { font, features, userSettings, style } = value;
        if (font == undefined) {
            font = state.font;
        }
        if (features == undefined) {
            features = state.features;
        }
        if (userSettings == undefined) {
            userSettings = state.userSettings;
        }
        if (style == undefined) {
            style = state.style;
        }
        const rangePreview = state.rangePreview;

        setState({ font, features, userSettings, style, rangePreview });
        onChange({ font, userSettings, style });
    }

    function setRangePreview(enable) {
        setState({ ...state, rangePreview: !!enable });
    }

    useEffect(() => {
        async function fetchData() {
            if (value?.font) {
                const features = await readFont(value.font, options);
                setState({ ...state, ...value, features });
            }
        }
        fetchData();
    }, []);

    const previewClassName = "litespeed-font-preview";
    const roundedButton = (() => {
        const rounded = options?.roundedButton || 0;
        return rounded >= 26 ? "9999px" : rounded / 16 + "rem";
    })();
    const buttonCSS = `.${previewClassName} button{border-radius:${roundedButton} !important}`;
    const fontFaces = generateAllFontFaces(options);
    const enableBold = options.type !== "button";
    const preview = state.rangePreview ? "range" : options.type;
    const mainFontCSS = options?.mainFont?.style ? mainFontStyle(options.mainFont.style, previewClassName) : "";
    const previewText = i18nRegistry.translate(`Litespeed.Style:NodeTypes.Mixin.Fonts:editor.preview.${preview}`);

    return (
        <div className={style.secondaryGrid}>
            <style>
                {mainFontCSS}
                {fontFaces}
                {buttonCSS}
            </style>
            <ControlBar
                state={state}
                onCommit={handleCommit}
                config={options}
                setRangePreview={setRangePreview}
                enableBold={enableBold}
                allowEmpty={options.allowEmpty}
                i18nRegistry={i18nRegistry}
            />
            <div className={clsx(previewClassName, style[preview + "Output"], style.fontOutput)}>
                <PreviewText text={previewText} style={state.style} type={options.type} colors={options?.colors} />
            </div>
        </div>
    );
}

function mainFontStyle({ normal, bold }, className) {
    if (!normal) {
        return "";
    }

    const normalStyles = [
        `font-family:${normal.fontFamily}`,
        `font-weight:${normal.fontWeight}`,
        `font-feature-settings:${normal.fontFeatureSettings}`,
        `font-variation-settings:${normal.fontVariationSettings}`,
    ].join(";");
    const boldStyles = `font-weight:${bold.fontWeight}`;

    return `.${className}{${normalStyles}}.${className} strong{${boldStyles}}`;
}

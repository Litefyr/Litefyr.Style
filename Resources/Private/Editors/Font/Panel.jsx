import React, { useState, useEffect, useMemo } from "react";
import { CheckBox, Label } from "@neos-project/react-ui-components";
import { neos } from "@neos-project/neos-ui-decorators";
import { FontWeight, FontFeatures, PreviewText, style } from "./Components";
import FontFamily from "/_Resources/Static/Packages/Carbon.Webfonts/Editor/FontFamily.js";
import {
    getFontCollection,
    getFontWeight,
    getFontWeightConfig,
    getFontBasedOnValue,
} from "/_Resources/Static/Packages/Carbon.Webfonts/Editor/Helper.js";
import clsx from "clsx";

const defaultFontWeight = 400;
const defaultFontWeightBold = 700;

/*
Example value

const value = {
    fontFamily: "Anybody,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'",    fontFeatureSettings: 'normal',
    fontVariationSettings: "normal",
    fontFeatureSettings: "normal",
    fontWeight: 150,
    fontWeightBold: 850,
}
*/

function Panel({ id, onChange, value, options, placeholder, i18nRegistry, labels }) {
    const fonts = useMemo(() => getFontCollection(options.fonts), [options.fonts]);

    const [rangePreview, setRangePreview] = useState(false);
    const [fontFamily, setFontFamily] = useState(value?.fontFamily);
    const [fontVariationSettings, setFontVariationSettings] = useState(value?.fontVariationSettings || "normal");
    const [fontFeatureSettings, setFontFeatureSettings] = useState(value?.fontFeatureSettings || "normal");
    const [fontWeight, setFontWeight] = useState(value?.fontWeight || defaultFontWeight);
    const [fontWeightBold, setFontWeightBold] = useState(value?.fontWeightBold || defaultFontWeightBold);
    const [cssFile, setCssFile] = useState(null);
    const [fontWeightConfig, setFontWeightConfig] = useState(null);
    const [fontType, setFontType] = useState(null);
    const [uppercase, setUppercase] = useState(!!value?.uppercase);

    useEffect(() => {
        if (!fontFamily) {
            return;
        }
        onChange({
            fontFamily,
            fontVariationSettings,
            fontFeatureSettings,
            fontWeight,
            fontWeightBold,
            uppercase,
        });
    }, [fontFamily, fontVariationSettings, fontFeatureSettings, fontWeight, fontWeightBold, uppercase]);

    useEffect(() => {
        if (!fontFamily) {
            return;
        }
        const font = getFontBasedOnValue(fontFamily, fonts.flat);
        setCssFile(font?.cssFile);
    }, [fontFamily]);

    useEffect(() => {
        const fontFamilyHasChanged = fontFamily !== value?.fontFamily;
        const obj = getFontWeightConfig(fontFamily, value?.fontWeight, fonts.flat);

        if (!obj?.font) {
            setFontFamily(null);
            setUppercase(false);
            setFontVariationSettings("normal");
            setFontFeatureSettings("normal");
            onChange();
            return;
        }

        setFontWeightConfig(obj.fontWeight);
        setFontType(obj.type);
        setCssFile(obj.font?.cssFile);

        if (fontFamilyHasChanged) {
            const newFontWeightBold =
                (obj.type === "fixed" || obj.type !== fontType) && fontWeightBold === obj.value
                    ? defaultFontWeightBold
                    : fontWeightBold;
            const bold = getFontWeight(obj.fontWeight, newFontWeightBold, defaultFontWeightBold);
            if (obj.value !== fontWeight) {
                setFontWeight(obj.value);
            }
            if (bold !== fontWeightBold) {
                setFontWeightBold(bold);
            }
            setFontVariationSettings("normal");
            setFontFeatureSettings("normal");
        }
    }, [fontFamily]);

    const previewClassName = "litefyr-font-preview";
    const mainFontCSS = mainFontStyle(options?.mainFont || {}, previewClassName);
    const buttonCSS = `.${previewClassName} button{border-radius:${options?.roundedButton || 0} !important}`;
    const enableBold = !!options?.enableBold;
    const preview = rangePreview ? "range" : options.type;
    const previewText = i18nRegistry.translate(`Litefyr.Style:NodeTypes.Mixin.Fonts:editor.preview.${preview}`);

    return (
        <div className={style.secondaryGrid}>
            <style>
                {mainFontCSS}
                {buttonCSS}
            </style>
            <div className={clsx(style.maxHeightSecondary, style.paddingSecondary, style.secondaryControls)}>
                <label className={clsx(style.checkboxLabel)}>
                    <CheckBox onChange={setRangePreview} isChecked={!!rangePreview} />
                    {labels.characterListing}
                </label>
                <div>
                    <Label htmlFor={`${id}-fontfamily`}>{labels.typeface}</Label>
                    <FontFamily
                        id={`${id}-fontfamily`}
                        scrollable={false}
                        value={fontFamily}
                        commit={setFontFamily}
                        options={{
                            allowEmpty: !!options?.allowEmpty,
                            useCarbonWebfonts: !!options?.useCarbonWebfonts,
                            placeholder,
                        }}
                    />
                </div>
                {fontFamily && (
                    <>
                        <FontWeight
                            id={id}
                            defaultFontWeight={defaultFontWeight}
                            defaultFontWeightBold={defaultFontWeightBold}
                            fontType={fontType}
                            fontWeight={fontWeight}
                            setFontWeight={setFontWeight}
                            fontWeightBold={fontWeightBold}
                            setFontWeightBold={setFontWeightBold}
                            enableBold={enableBold}
                            fontWeightConfig={fontWeightConfig}
                        />
                        <FontFeatures
                            id={id}
                            cssFile={cssFile}
                            allowUpperCase={options?.allowUpperCase}
                            uppercase={uppercase}
                            setUppercase={setUppercase}
                            fontVariationSettings={fontVariationSettings}
                            setFontVariationSettings={setFontVariationSettings}
                            fontFeatureSettings={fontFeatureSettings}
                            setFontFeatureSettings={setFontFeatureSettings}
                        />
                    </>
                )}
            </div>
            <div className={clsx(previewClassName, style[preview + "Output"], style.fontOutput)}>
                <PreviewText
                    text={previewText}
                    style={
                        fontFamily
                            ? {
                                  fontFamily,
                                  fontWeight,
                                  fontVariationSettings,
                                  fontFeatureSettings,
                                  textTransform: uppercase ? "uppercase" : "inherit",
                              }
                            : {}
                    }
                    fontWeightBold={fontFamily ? fontWeightBold : null}
                    type={preview}
                    colors={options?.colors}
                    colorContrastThreshold={options?.colorContrastThreshold}
                />
            </div>
        </div>
    );
}

function mainFontStyle(
    { fontFamily, fontVariationSettings, fontFeatureSettings, fontWeight, fontWeightBold },
    className,
) {
    const normalStyles = [
        fontFamily ? `font-family:${fontFamily}` : null,
        `font-weight:${fontWeight || defaultFontWeight}`,
        `font-feature-settings:${fontFeatureSettings || "normal"}`,
        `font-variation-settings:${fontVariationSettings || "normal"}`,
    ]
        .filter(Boolean)
        .join(";");
    const boldStyles = `font-weight:${fontWeightBold || defaultFontWeightBold}`;

    return `.${className}{${normalStyles}}.${className} strong{${boldStyles}}`;
}

const neosifier = neos((globalRegistry) => {
    const i18nRegistry = globalRegistry.get("i18n");

    const labels = {};
    ["characterListing", "typeface"].forEach((key) => {
        labels[key] = i18nRegistry.translate(`Litefyr.Style:NodeTypes.Mixin.Fonts:editor.${key}`);
    });
    return { labels, i18nRegistry };
});

export default neosifier(Panel);

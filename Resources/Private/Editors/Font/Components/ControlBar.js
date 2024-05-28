import React from "react";
import clsx from "clsx";
import { style } from "../../Components";
import RangeInput from "./RangeInput";
import { SelectBox, CheckBox } from "@neos-project/react-ui-components";
import readFont from "./ReadFont";

export default function ControlBar({
    i18nRegistry,
    state,
    onCommit,
    config,
    setRangePreview,
    allowEmpty = true,
    enableBold = true,
}) {
    const { fonts } = config;

    const fontTypeOptions = [];
    for (const font in fonts) {
        fontTypeOptions.push({
            value: font,
            label: font,
            group: fonts[font].group,
        });
    }

    // Stuff for fontVariationSettings
    const fontVariationSettings = state?.features?.fontVariationSettings || {};
    function onFontVariationSettingChange(key, value) {
        let userSettings = getCopyOfUserSettings();
        userSettings.fontVariationSettings[key] = value;
        const style = generateStyleForPreview(userSettings);
        onCommit({ userSettings, style });
    }

    // Stuff for fontFeatureSettings
    const fontFeatureSettings = state?.features?.fontFeatureSettings || [];
    function onFontFeatureSettingChange(key, enable) {
        let userSettings = getCopyOfUserSettings();
        let fontFeatureSettings = userSettings.fontFeatureSettings;
        if (enable) {
            fontFeatureSettings.push(key);
        } else {
            fontFeatureSettings = fontFeatureSettings.filter((item) => item !== key);
        }
        // Make the array unique
        userSettings.fontFeatureSettings = [...new Set(fontFeatureSettings)];
        const style = generateStyleForPreview(userSettings);
        onCommit({ userSettings, style });
    }

    // Stuff for font weight
    const isVariableFont = state?.features?.variable;
    const variableFontWeight = isVariableFont ? state?.features?.fontWeight?.range : null;

    const fixedFontWeight = !isVariableFont ? state?.features?.fontWeight?.options : [];
    const fixedFontWeightControlValues = fixedFontWeight && fixedFontWeight.length > 1 ? fixedFontWeight : null;

    function onFontWeightChange(key, value) {
        let userSettings = JSON.parse(JSON.stringify(state.userSettings));
        userSettings.fontWeight[key] = value;
        const style = generateStyleForPreview(userSettings);
        onCommit({ userSettings, style });
    }

    // Function to get a copy of the userSettings
    const getCopyOfUserSettings = () => JSON.parse(JSON.stringify(state.userSettings));

    const labelArray = ["characterListing", "typeface", "normalFontWeight", "boldFontWeight"];

    const labels = {};
    labelArray.forEach((key) => {
        labels[key] = i18nRegistry.translate(`Litefyr.Style:NodeTypes.Mixin.Fonts:editor.${key}`);
    });

    return (
        <div className={style.secondaryControls} style={{ maxWidth: "300px" }}>
            <label className={clsx(style.checboxLabel)}>
                <CheckBox onChange={setRangePreview} isChecked={!!state?.rangePreview} />
                <span>{labels.characterListing}</span>
            </label>
            <div className={clsx(style.flex, style.flexColumn, style.gap2)}>
                <div>{labels.typeface}</div>
                <SelectBox
                    allowEmpty={allowEmpty}
                    displaySearchBox={false}
                    options={fontTypeOptions}
                    value={state.font}
                    onValueChange={async (font) => {
                        if (!font) {
                            onCommit();
                            return;
                        }
                        const features = await readFont(font, config);
                        const fontWeight = features.fontWeight;
                        const variable = features.variable;
                        const normalFontWeight = variable ? fontWeight.range.default : fontWeight.options[0];
                        const boldFontWeight = variable
                            ? getDefaultValueForBold(normalFontWeight, fontWeight.range.max)
                            : fontWeight.options[fontWeight.options.length - 1];
                        const userSettings = {
                            font,
                            variable,
                            fontVariationSettings: valuesForFontVariants(features.fontVariationSettings),
                            fontFeatureSettings: [],
                            fontWeight: {
                                normal: normalFontWeight,
                                bold: boldFontWeight,
                            },
                        };
                        const style = generateStyleForPreview(userSettings);
                        onCommit({ font, features, userSettings, style });
                    }}
                />
            </div>

            {variableFontWeight && (
                <React.Fragment>
                    <RangeInput
                        min={variableFontWeight.min}
                        max={variableFontWeight.max}
                        value={state.userSettings.fontWeight.normal}
                        label={labels.normalFontWeight}
                        step={5}
                        onChange={(value) => onFontWeightChange("normal", value)}
                        onReset={() => onFontWeightChange("normal", variableFontWeight.default)}
                    />
                    {enableBold && (
                        <RangeInput
                            min={variableFontWeight.min}
                            max={variableFontWeight.max}
                            value={state.userSettings.fontWeight.bold}
                            label={labels.boldFontWeight}
                            step={5}
                            onChange={(value) => onFontWeightChange("bold", value)}
                            onReset={() =>
                                onFontWeightChange(
                                    "bold",
                                    getDefaultValueForBold(variableFontWeight.default, variableFontWeight.max),
                                )
                            }
                        />
                    )}
                </React.Fragment>
            )}

            {fixedFontWeightControlValues && (
                <React.Fragment>
                    <div className={clsx(style.flex, style.flexColumn, style.gap2)}>
                        <div>{labels.normalFontWeight}</div>
                        {fixedFontWeightControlValues.map((weight) => (
                            <label className={style.radio}>
                                <input
                                    type="radio"
                                    name="weightNormal"
                                    value={weight}
                                    checked={state.userSettings.fontWeight.normal == weight}
                                    onChange={() => onFontWeightChange("normal", weight)}
                                />
                                <span></span>
                                {weight}
                            </label>
                        ))}
                    </div>
                    {enableBold && (
                        <div className={clsx(style.flex, style.flexColumn, style.gap2)}>
                            <div>{labels.boldFontWeight}</div>
                            {fixedFontWeightControlValues.map((weight) => (
                                <label className={style.radio}>
                                    <input
                                        type="radio"
                                        name="weightBold"
                                        value={weight}
                                        checked={state.userSettings.fontWeight.bold == weight}
                                        onChange={() => onFontWeightChange("bold", weight)}
                                    />
                                    <span></span>
                                    {weight}
                                </label>
                            ))}
                        </div>
                    )}
                </React.Fragment>
            )}

            {Object.entries(fontVariationSettings).map(([key, item]) => (
                <RangeInput
                    min={item.min}
                    max={item.max}
                    value={state.userSettings.fontVariationSettings[key]}
                    label={key}
                    step={1}
                    onChange={(value) => onFontVariationSettingChange(key, value)}
                    onReset={() => onFontVariationSettingChange(key, item.default)}
                />
            ))}

            <div className={style.checkboxGrid}>
                {fontFeatureSettings.map((feature) => (
                    <label className={clsx(style.checboxLabel)}>
                        <CheckBox
                            onChange={(value) => onFontFeatureSettingChange(feature, value)}
                            isChecked={state.userSettings.fontFeatureSettings.includes(feature)}
                        />
                        <span>{feature}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

function valuesForFontVariants(value) {
    let result = {};
    for (const key in value) {
        const item = value[key];
        result[key] = item.value || item.default;
    }
    return result;
}

function getDefaultValueForBold(normal, max) {
    return Math.min(normal + 300, max);
}

function generateStyleForPreview({ font, fontVariationSettings, fontFeatureSettings, fontWeight }) {
    const styles = {
        fontFamily: font,
        fontWeight: fontWeight.normal,
        fontFeatureSettings:
            fontFeatureSettings && fontFeatureSettings.length
                ? fontFeatureSettings.map((item) => `"${item}"`).join(",")
                : "normal",
    };

    const customFontVariationSettings = [];
    Object.entries(fontVariationSettings).forEach(([subKey, subValue]) => {
        customFontVariationSettings.push(`"${subKey}" ${subValue}`);
    });
    styles.fontVariationSettings = customFontVariationSettings.length
        ? customFontVariationSettings.join(",")
        : "normal";

    return {
        normal: styles,
        bold: { fontWeight: fontWeight.bold },
    };
}

import React, { useState, useEffect, use } from "react";
import { neos } from "@neos-project/neos-ui-decorators";
import { CheckBox } from "@neos-project/react-ui-components";
import { RangeInput, readFont, style } from "./index";
import { RadioButton } from "/_Resources/Static/Packages/Carbon.Webfonts/Editor/Helper.js";
import { useDebouncedCallback } from "use-debounce";

function stringToVariantionsState(string) {
    if (string === "normal") {
        return {};
    }
    const variations = {};
    string.split(",").forEach((variation) => {
        const [tag, value] = variation.split(" ");
        variations[tag.replaceAll("'", "").replaceAll('"', "")] = parseInt(value);
    });
    return variations;
}

function variantStateToString(variationsState) {
    const value = Object.entries(variationsState)
        .map(([tag, value]) => `'${tag}' ${value}`)
        .join(",");
    return value || "normal";
}

function stringToFeaturesState(string) {
    if (typeof string !== "string" || string === "normal") {
        return [];
    }
    return string
        .trim()
        .split(",")
        .map((feature) => feature.replaceAll("'", "").replaceAll('"', "").trim());
}

function featuresStateToString(featuresState) {
    return featuresState.map((feature) => `'${feature}'`).join(",") || "normal";
}

function FontFeatures({
    id,
    cssFile,
    fontVariationSettings,
    setFontVariationSettings,
    fontFeatureSettings,
    setFontFeatureSettings,
    i18nRegistry,
}) {
    const [features, setFeatures] = useState([]);
    const [variations, setVariations] = useState([]);

    const [variationsState, setVariationsState] = useState(stringToVariantionsState(fontVariationSettings));
    const [featuresState, setFeaturesState] = useState(stringToFeaturesState(fontFeatureSettings));

    useEffect(() => {
        const getFontSettings = async () => {
            const { features, variations } = await readFont(cssFile);
            setFeatures(features);

            const newVariations = [];
            variations.forEach((config) => {
                const min = Math.round(config.min);
                const max = Math.floor(config.max);
                if (min !== max) {
                    const tag = config.tag;
                    const defaultValue = Math.round(config.default);
                    newVariations.push({
                        tag,
                        min,
                        max,
                        defaultValue,
                    });
                }
            });
            setVariations(newVariations);
        };

        getFontSettings().catch(console.error);
    }, [cssFile]);

    function onVariantChange(tag, value, defaultValue) {
        const newState = { ...variationsState, [tag]: value };
        if (value === defaultValue) {
            delete newState[tag];
        }

        setVariationsState(newState);
        setFontVariationSettings(variantStateToString(newState));
    }

    function onFontFeatureChange(feature, value) {
        if (value) {
            if (!featuresState.includes(feature)) {
                const newFeatures = [...featuresState, feature];
                setFeaturesState(newFeatures);
                setFontFeatureSettings(featuresStateToString(newFeatures));
            }
            return;
        }
        // Remove the feature from array
        const newFeatures = featuresState.filter((f) => f !== feature);
        setFeaturesState(newFeatures);
        setFontFeatureSettings(featuresStateToString(newFeatures));
    }

    return (
        <>
            {variations.map(({ tag, min, max, defaultValue }) => (
                <RangeInput
                    key={tag + cssFile}
                    min={min}
                    max={max}
                    value={typeof variationsState[tag] == "number" ? variationsState[tag] : defaultValue}
                    label={i18nRegistry.translate(`Litefyr.Style:NodeTypes.Mixin.Fonts:editor.variations.${tag}`, tag)}
                    step={1}
                    onChange={(value) => onVariantChange(tag, value, defaultValue)}
                    resetValue={defaultValue}
                />
            ))}
            <div className={style.fontFeatures}>
                {features.map((feature) => (
                    <label className={style.checkboxLabel} title={feature} key={feature}>
                        <CheckBox
                            onChange={(value) => onFontFeatureChange(feature, value)}
                            isChecked={featuresState.includes(feature)}
                        />
                        {i18nRegistry.translate(
                            `Litefyr.Style:NodeTypes.Mixin.Fonts:editor.feature.${feature}`,
                            feature,
                        )}
                    </label>
                ))}
            </div>
        </>
    );
}

const neosifier = neos((globalRegistry) => ({
    i18nRegistry: globalRegistry.get("i18n"),
}));

export default neosifier(FontFeatures);

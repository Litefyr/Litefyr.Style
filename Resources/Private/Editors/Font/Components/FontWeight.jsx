import React, { useState, useEffect } from "react";
import { neos } from "@neos-project/neos-ui-decorators";
import { RangeInput, Dropdown } from "./index";
import { RadioButton } from "/_Resources/Static/Packages/Carbon.Webfonts/Editor/Helper.js";

function FontWeight({
    id,
    fontWeightConfig,
    defaultFontWeight,
    defaultFontWeightBold,
    fontType,
    fontWeight,
    setFontWeight,
    fontWeightBold,
    setFontWeightBold,
    enableBold,
    labels,
}) {
    const [key, setKey] = useState(JSON.stringify(fontWeightConfig));
    useEffect(() => {
        setKey(JSON.stringify(fontWeightConfig));
    }, [fontWeightConfig]);

    if (fontType !== "variable" && fontType !== "fixed") {
        return null;
    }

    if (fontType === "fixed") {
        if (!Array.isArray(fontWeightConfig)) {
            return null;
        }

        if (fontWeightConfig.length > 3) {
            return (
                <>
                    <div>
                        <Dropdown
                            label={labels.normalFontWeight}
                            id={`${id}-fontweight`}
                            value={fontWeight}
                            options={fontWeightConfig}
                            onChange={setFontWeight}
                            plainOptions
                        />
                    </div>
                    {enableBold && (
                        <div>
                            <Dropdown
                                label={labels.boldFontWeight}
                                id={`${id}-fontweightbold`}
                                value={fontWeightBold}
                                options={fontWeightConfig}
                                onChange={setFontWeightBold}
                                plainOptions
                            />
                        </div>
                    )}
                </>
            );
        }

        return (
            <>
                <div>
                    <div>{labels.normalFontWeight}</div>
                    {fontWeightConfig.map((weight) => (
                        <RadioButton key={weight} value={weight} onChange={setFontWeight} currentValue={fontWeight} />
                    ))}
                </div>
                {enableBold && fontWeightConfig.length > 1 && (
                    <div>
                        <div>{labels.boldFontWeight}</div>
                        {fontWeightConfig.map((weight) => (
                            <RadioButton
                                key={weight}
                                value={weight}
                                onChange={setFontWeightBold}
                                currentValue={fontWeightBold}
                            />
                        ))}
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            <RangeInput
                {...fontWeightConfig}
                key={key}
                id={`${id}-fontweight`}
                value={fontWeight}
                label={labels.normalFontWeight}
                step={5}
                onChange={setFontWeight}
                resetValue={defaultFontWeight}
            />
            {enableBold && (
                <RangeInput
                    {...fontWeightConfig}
                    key={`${key}-bold`}
                    id={`${id}-fontweightbold`}
                    value={fontWeightBold}
                    label={labels.boldFontWeight}
                    step={5}
                    onChange={setFontWeightBold}
                    resetValue={defaultFontWeightBold}
                />
            )}
        </>
    );
}

const neosifier = neos((globalRegistry) => {
    const i18nRegistry = globalRegistry.get("i18n");
    const labels = {};
    ["normalFontWeight", "boldFontWeight"].forEach((key) => {
        labels[key] = i18nRegistry.translate(`Litefyr.Style:NodeTypes.Mixin.Fonts:editor.${key}`);
    });
    return { labels };
});

export default neosifier(FontWeight);

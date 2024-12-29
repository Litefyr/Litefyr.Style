import React, { useState, useEffect } from "react";
import { CheckBox } from "@neos-project/react-ui-components";
import { ClipPathOutput, calculate, CurveEditor, style, RangeInput } from "./Components";
import clsx from "clsx";
import { neos } from "@neos-project/neos-ui-decorators";

function Panel({ id, onChange, value, topColor, bottomColor, contentLabel, interpolationMethods, labels }) {
    const firstPossibleInterpolationMethod = interpolationMethods[0];
    function returnState(config) {
        let interpolationMethod = config?.interpolationMethod || "";
        if (!interpolationMethods.includes(interpolationMethod)) {
            interpolationMethod = firstPossibleInterpolationMethod;
        }

        return {
            interpolationMethod,
            points: config?.points || null,
        };
    }

    const [topSpacing, setTopSpacing] = useState(value?.topSpacing || 0);
    const [bottomSpacing, setBottomSpacing] = useState(value?.bottomSpacing || 0);
    const [topState, setTopState] = useState(returnState(value?.topConfig));
    const [bottomState, setBottomState] = useState(returnState(value?.bottomConfig));
    const [outputState, setOutputState] = useState(null);
    const [resultAsJSON, setResultAsJSON] = useState(null);
    const [asyncPath, setAsyncPath] = useState(!!value?.asyncPath);
    const [reverseStacking, setReverseStacking] = useState(!!value?.reverseStacking);
    const [nesting, setNesting] = useState(value?.nesting || 0);
    const [showGrid, setShowGrid] = useState(true);
    const [snapToGrid, setSnapToGrid] = useState(true);

    useEffect(() => {
        // If we have a buttom string, we are in async mode
        const asyncPath = !!value?.bottom;
        const result = calculate({
            top: topState,
            bottom: bottomState,
            asyncPath,
            nesting,
            reverseStacking,
            topSpacing,
            bottomSpacing,
        });
        setResultAsJSON(JSON.stringify(result));
        setOutputState(result);
    }, []);

    // React on state changes
    useEffect(() => {
        if (!topState || !bottomState) {
            return;
        }
        const result = calculate({
            top: topState,
            bottom: bottomState,
            asyncPath,
            nesting,
            reverseStacking,
            topSpacing,
            bottomSpacing,
        });
        const json = JSON.stringify(result);
        if (resultAsJSON !== json) {
            setResultAsJSON(json);
            setOutputState(result);

            if (JSON.stringify(value) !== json) {
                onChange(result);
            }
        }
    }, [topState, bottomState, asyncPath, nesting, reverseStacking, topSpacing, bottomSpacing]);

    if (!topState) {
        return null;
    }

    return (
        <div class={clsx(style.responsiveContainer, style.paddingSecondary, style.maxHeightSecondary)}>
            <div className={style.secondary}>
                <div className={style.globalControls}>
                    <RangeInput
                        id={`${id}-nesting`}
                        value={nesting}
                        onChange={setNesting}
                        unit="%"
                        label={labels.nesting}
                    />
                    <RangeInput
                        id={`${id}-top-padding`}
                        value={topSpacing}
                        onChange={setTopSpacing}
                        unit="%"
                        min={-10}
                        max={10}
                        label={labels.topSpacing}
                        resetValue={0}
                    />
                    <RangeInput
                        id={`${id}-bottom-padding`}
                        value={bottomSpacing}
                        onChange={setBottomSpacing}
                        unit="%"
                        min={-10}
                        max={10}
                        label={labels.bottomSpacing}
                        resetValue={0}
                    />
                    <label className={clsx(style.checkboxLabel, nesting || style.disabled)}>
                        <CheckBox onChange={setReverseStacking} isChecked={nesting && reverseStacking} />
                        {labels.reverseStacking}
                    </label>
                    <label className={style.checkboxLabel}>
                        <CheckBox onChange={setAsyncPath} isChecked={asyncPath} />
                        {labels.asyncPath}
                    </label>
                    <label className={style.checkboxLabel}>
                        <CheckBox onChange={setShowGrid} isChecked={showGrid} />
                        {labels.showGrid}
                    </label>
                    <label className={clsx(style.checkboxLabel, showGrid || style.disabled)}>
                        <CheckBox onChange={setSnapToGrid} isChecked={snapToGrid && showGrid} disabled={!showGrid} />
                        {labels.snapToGrid}
                    </label>
                </div>
                <CurveEditor
                    top={true}
                    onCommit={setTopState}
                    state={topState}
                    interpolationMethods={interpolationMethods}
                    showGrid={showGrid}
                    snapToGrid={snapToGrid}
                />
                {bottomState && asyncPath && (
                    <CurveEditor
                        top={false}
                        onCommit={setBottomState}
                        state={bottomState}
                        interpolationMethods={interpolationMethods}
                        showGrid={showGrid}
                        snapToGrid={snapToGrid}
                    />
                )}
                <ClipPathOutput
                    state={outputState}
                    label={contentLabel}
                    topColor={topColor}
                    bottomColor={bottomColor}
                    asyncPath={asyncPath}
                    nesting={nesting}
                    reverseStacking={reverseStacking}
                    topSpacing={topSpacing}
                    bottomSpacing={bottomSpacing}
                />
            </div>
        </div>
    );
}

const neosifier = neos((globalRegistry) => {
    const i18nRegistry = globalRegistry.get("i18n");
    const labels = {};
    ["asyncPath", "nesting", "showGrid", "snapToGrid", "reverseStacking", "topSpacing", "bottomSpacing"].forEach(
        (key) => {
            labels[key] = i18nRegistry.translate(`Litefyr.Style:NodeTypes.Mixin.Visuals.ClipPath:editor.${key}`);
        },
    );
    return { labels };
});

export default neosifier(Panel);

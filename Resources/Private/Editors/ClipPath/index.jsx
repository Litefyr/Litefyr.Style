import React, { useState, useCallback, Suspense, lazy } from "react";
import { neos } from "@neos-project/neos-ui-decorators";
import { Button, Icon } from "@neos-project/react-ui-components";
import LoadingAnimation from "carbon-neos-loadinganimation/LoadingWithClassNames";
import Dialog from "/_Resources/Static/Packages/Carbon.Editor.Styling/Dialog.js";
import clsx from "clsx";
import { ClipPathOutput, style } from "./Components";

const defaultOptions = {
    allowEmpty: true,
    disabled: false,
    topColor: "#00adee",
    bottomColor: "#00a338",
    interpolationMethods: {
        cubic: true,
        akima: true,
        linear: true,
        nearestNeighbor: true,
        loess: true,
    },
};

const LazyPanel = lazy(() => import("./Panel"));

function Editor({ id, value, commit, highlight, labels, options }) {
    const [open, setOpen] = useState(false);
    const [valueFromPanel, setValueFromPanel] = useState(value);
    const [valueAsJson, setValueAsJson] = useState(JSON.stringify(value));
    const { allowEmpty, disabled, topColor, bottomColor } = { ...defaultOptions, ...options };
    const interpolationMethodsObject = {
        ...defaultOptions.interpolationMethods,
        ...(options?.interpolationMethods || {}),
    };

    // Generate array with enabled interpolation methods
    const interpolationMethods = [];
    Object.entries(interpolationMethodsObject).forEach(([key, enabled]) => {
        if (enabled) {
            interpolationMethods.push(key);
        }
    });
    if (!interpolationMethods.length) {
        interpolationMethods.push("cubic");
    }

    const onApply = useCallback(() => {
        setOpen(false);
        if (!value.css || JSON.stringify(valueFromPanel) !== valueAsJson) {
            commit(valueFromPanel);
        }
    }, [valueFromPanel, value]);

    const onReset = useCallback(() => {
        setOpen(false);
        if (value.css) {
            commit({ ...value, css: null });
        }
    }, [valueFromPanel]);

    return (
        <div className={clsx(style.primaryWrapper, disabled && style.disabled)}>
            <button
                type="button"
                className={clsx(style.previewOutput, style.chessboard, highlight && style.highlight)}
                onClick={() => setOpen(true)}
                title={labels.edit}
            >
                {!!value.css && (
                    <ClipPathOutput
                        state={value}
                        topColor={topColor}
                        bottomColor={bottomColor}
                        asyncPath={value.asyncPath}
                        nesting={value.nesting}
                        reverseStacking={value.reverseStacking}
                        topSpacing={value?.topSpacing}
                        bottomSpacing={value?.bottomSpacing}
                    />
                )}
                <Icon icon="pencil" size="5x" mask={["fas", "circle"]} transform="shrink-8" />
            </button>
            <Dialog
                open={open}
                setOpen={setOpen}
                onCancel={() => setOpen(false)}
                onApply={onApply}
                disabledApply={value.css && JSON.stringify(valueFromPanel) === valueAsJson}
                footer={
                    allowEmpty && (
                        <Button onClick={onReset} hoverStyle="error">
                            {labels.reset}
                        </Button>
                    )
                }
                fullHeight
                fullWidth
            >
                {open && (
                    <Suspense fallback={<LoadingAnimation isLoading={true} />}>
                        <LazyPanel
                            id={id}
                            onChange={setValueFromPanel}
                            value={value}
                            topColor={topColor}
                            bottomColor={bottomColor}
                            interpolationMethods={interpolationMethods}
                            contentLabel={labels.content}
                        />
                    </Suspense>
                )}
            </Dialog>
        </div>
    );
}

const neosifier = neos((globalRegistry) => {
    const i18nRegistry = globalRegistry.get("i18n");
    const secondaryEditorsRegistry = globalRegistry.get("inspector").get("secondaryEditors");
    const labels = {};
    ["edit", "reset", "content"].forEach((key) => {
        labels[key] = i18nRegistry.translate(`Litefyr.Style:NodeTypes.Mixin.Visuals.ClipPath:editor.${key}`);
    });
    return { labels, secondaryEditorsRegistry };
});

export default neosifier(Editor);

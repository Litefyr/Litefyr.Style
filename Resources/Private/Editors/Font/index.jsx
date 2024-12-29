import React, { useState, useCallback, useEffect, Suspense, lazy } from "react";
import { neos } from "@neos-project/neos-ui-decorators";
import { IconButton, Icon, Button } from "@neos-project/react-ui-components";
import LoadingAnimation from "carbon-neos-loadinganimation/LoadingWithClassNames";
import Dialog from "/_Resources/Static/Packages/Carbon.Editor.Styling/Dialog.js";
import { style } from "./Components";
import clsx from "clsx";

const LazyPanel = lazy(() => import("./Panel"));

const defaultOptions = {
    type: "main",
    allowEmpty: true,
    disabled: false,
    roundedButton: 0,
    colorContrastThreshold: 65,
    colors: [],
    useCarbonWebfonts: true,
};

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

function Editor({ id, value, commit, highlight, i18nRegistry, carbonWebfonts, ...props }) {
    const options = { ...defaultOptions, ...props.config, ...props.options };
    const [open, setOpen] = useState(false);
    const [fontName, setFontName] = useState(null);
    const [valueFromPanel, setValueFromPanel] = useState(value);
    const [valueAsJson, setValueAsJson] = useState(JSON.stringify(value));
    options.fonts = { ...props.config.fonts, ...props.options.fonts };
    if (options.useCarbonWebfonts) {
        options.fonts = { ...carbonWebfonts, ...options.fonts };
    }

    useEffect(() => {
        const name = value?.fontFamily?.split(",")[0].trim();
        setFontName(name || null);
        setValueAsJson(JSON.stringify(value));
    }, [value]);

    const onApply = useCallback(() => {
        setOpen(false);
        if (JSON.stringify(valueFromPanel) !== valueAsJson) {
            commit(valueFromPanel ? valueFromPanel : {});
        }
    }, [valueFromPanel, value]);

    const onReset = useCallback(() => {
        setOpen(false);
        commit({});
    }, []);

    const placeholder = i18nRegistry.translate("Litefyr.Style:NodeTypes.Mixin.Fonts:editor.select");

    return (
        <div className={clsx(style.buttons, options.disabled && style.disabled)}>
            <Button
                id={id}
                onClick={() => setOpen(true)}
                style="lighter"
                className={clsx(
                    style.primaryFontOutput,
                    highlight && style.highlight,
                    !fontName && style.primaryFontOutputPlaceholder,
                )}
                title={fontName ? i18nRegistry.translate("Litefyr.Style:NodeTypes.Mixin.Fonts:editor.edit") : null}
            >
                <Icon icon="pencil" size="1x" padded="right" />
                {fontName || placeholder}
            </Button>
            {!!fontName && options.allowEmpty && (
                <IconButton
                    style="lighter"
                    icon="times"
                    title={i18nRegistry.translate("Carbon.Webfonts:Main:noFont")}
                    onClick={onReset}
                />
            )}
            <Dialog
                open={open}
                setOpen={setOpen}
                onCancel={() => setOpen(false)}
                onApply={onApply}
                disabledApply={JSON.stringify(valueFromPanel) === valueAsJson}
                fullWidth
                fullHeight
            >
                {open && (
                    <Suspense fallback={<LoadingAnimation isLoading={true} />}>
                        <LazyPanel
                            id={id}
                            onChange={setValueFromPanel}
                            value={value}
                            options={options}
                            placeholder={placeholder}
                        />
                    </Suspense>
                )}
            </Dialog>
        </div>
    );
}

const neosifier = neos((globalRegistry) => ({
    i18nRegistry: globalRegistry.get("i18n"),
    config: globalRegistry.get("frontendConfiguration").get("Litefyr.Style.FontEditor"),
    carbonWebfonts: globalRegistry.get("frontendConfiguration").get("CarbonWebfonts"),
}));

export default neosifier(Editor);

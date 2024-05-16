import React from "react";
import { neos } from "@neos-project/neos-ui-decorators";
import { IconButton, Icon } from "@neos-project/react-ui-components";
import clsx from "clsx";
import { ClipPathOutput } from "./Components";
import { style } from "../Components";

const neosifier = neos((globalRegistry) => ({
    i18nRegistry: globalRegistry.get("i18n"),
    secondaryEditorsRegistry: globalRegistry.get("inspector").get("secondaryEditors"),
}));

const defaultOptions = {
    allowEmpty: true,
    disabled: false,
};

function Editor(props) {
    const { allowEmpty, disabled, topColor, bottomColor } = { ...defaultOptions, ...props.options };
    const { value, commit, highlight, i18nRegistry, renderSecondaryInspector, secondaryEditorsRegistry } = props;

    function onChange(value) {
        commit(value);
    }

    function onReset() {
        // This closes the secondary inspector
        renderSecondaryInspector("LITEFYR_CLIPPATH_EDIT", () => null);
        commit({ ...value, top: null, bottom: null });
    }

    function handleOpenEditor() {
        const { component: ClipPathEditorWrap } = secondaryEditorsRegistry.get("Litefyr.Style/ClipPathEditorWrap");
        renderSecondaryInspector("LITEFYR_CLIPPATH_EDIT", () => (
            <ClipPathEditorWrap
                onChange={onChange}
                value={value}
                topColor={topColor}
                bottomColor={bottomColor}
                i18nRegistry={i18nRegistry}
            />
        ));
    }

    return (
        <div className={clsx(style.primaryWrapper, disabled && style.primaryDisabled)}>
            {value.top && (
                <button
                    type="button"
                    className={clsx(style.previewOutput, highlight && style.highlight)}
                    onClick={handleOpenEditor}
                >
                    <ClipPathOutput state={value} topColor={topColor} bottomColor={bottomColor} />
                    <Icon icon="pencil" size="5x" mask={["fas", "circle"]} transform="shrink-8" />
                </button>
            )}
            <div className={style.primaryButtons}>
                <IconButton
                    className={clsx(!value.top && highlight && style.highlight)}
                    style="lighter"
                    icon="pencil"
                    title="Edit"
                    onClick={handleOpenEditor}
                />
                {allowEmpty && <IconButton style="lighter" icon="times" title="Reset" onClick={onReset} />}
            </div>
        </div>
    );
}

export default neosifier(Editor);

import React from "react";
import { neos } from "@neos-project/neos-ui-decorators";
import { IconButton, Icon, Button } from "@neos-project/react-ui-components";
import { style } from "../Components";
import clsx from "clsx";

const neosifier = neos((globalRegistry) => ({
    i18nRegistry: globalRegistry.get("i18n"),
    config: globalRegistry.get("frontendConfiguration").get("LitefyrStyleEditorsFont"),
    secondaryEditorsRegistry: globalRegistry.get("inspector").get("secondaryEditors"),
}));

const defaultOptions = {
    type: "main",
    allowEmpty: false,
    disabled: false,
    roundedButton: 0,
    colorContrastThreshold: 65,
    colors: [],
    mainFont: {},
};

function Editor(props) {
    const options = { ...defaultOptions, ...props.config, ...props.options };
    const { value, commit, highlight, i18nRegistry, renderSecondaryInspector, secondaryEditorsRegistry } = props;
    const { allowEmpty, disabled } = options;

    function onChange(value) {
        if (value) {
            commit(value);
            return;
        }
        commit({});
    }

    function onReset() {
        // This closes the secondary inspector
        renderSecondaryInspector("LITEFYR_FONT_EDIT", () => null);
        commit({});
    }

    function handleOpenEditor() {
        const { component: FontEditorWrap } = secondaryEditorsRegistry.get("Litefyr.Style/FontEditorWrap");
        renderSecondaryInspector("LITEFYR_FONT_EDIT", () => (
            <FontEditorWrap onChange={onChange} value={value} options={options} i18nRegistry={i18nRegistry} />
        ));
    }

    return (
        <div className={clsx(style.primaryButtons, disabled && style.primaryDisabled)}>
            <Button
                onClick={handleOpenEditor}
                style="lighter"
                className={clsx(style.wFull, style.textLeft, style.rounded, highlight && style.highlight)}
            >
                <Icon icon="pencil" size="1x" padded="right" />
                {value.font}
            </Button>
            {allowEmpty && <IconButton style="lighter" icon="times" title="Reset" onClick={onReset} />}
        </div>
    );
}

export default neosifier(Editor);

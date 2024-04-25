import React from "react";
import clsx from "clsx";
import { CheckBox } from "@neos-project/react-ui-components";
import style from "./Style.module.css";
import { nanoid } from "nanoid";

export default function RangeInput({
    state,
    onCommit,
    property,
    enableProperty,
    label,
    min = 0,
    max = 100,
    step = 1,
    minIcon,
    maxIcon,
    showValue = false,
}) {
    const id = nanoid();
    const value = state[property];
    const enabled = enableProperty ? !!state[enableProperty] : true;

    let valueLabel = null;
    if (showValue) {
        valueLabel = typeof showValue === "function" ? showValue(value) : value;
    }

    return (
        <div className={style.range}>
            {enableProperty && (
                <label className={clsx(style.rangeEnableLabel, style.checboxLabel)}>
                    <CheckBox
                        onChange={(value) => {
                            onCommit({ [enableProperty]: value });
                        }}
                        isChecked={enabled}
                    />
                    <span>
                        {label} {valueLabel}
                    </span>
                </label>
            )}
            <label htmlFor={id} className={enableProperty ? style.srOnly : style.rangeLabel}>
                {label} {valueLabel}
            </label>
            {enabled && (
                <div className={clsx(style.flex, style.itemsCenter, style.gap2)}>
                    <div className={style.rangeIcon}>{minIcon}</div>
                    <input
                        type="range"
                        id={id}
                        min={min}
                        max={max}
                        value={value}
                        step={step}
                        onChange={({ target }) => {
                            onCommit({ [property]: target.valueAsNumber });
                        }}
                    />
                    <div className={style.rangeIcon}>{maxIcon}</div>
                </div>
            )}
        </div>
    );
}

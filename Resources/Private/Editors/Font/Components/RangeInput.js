import React from "react";
import clsx from "clsx";
import style from "../../Components/Style.module.css";
import { IconButton } from "@neos-project/react-ui-components";
import { nanoid } from "nanoid";

export default function RangeInput({ value, label, min = 0, max = 100, step = 1, onChange, onReset }) {
    const id = nanoid();

    return (
        <div className={style.range}>
            <label htmlFor={id} className={style.flex}>
                {label}: {value}
            </label>
            <div className={clsx(style.flex, style.itemsCenter, style.gap2)}>
                <input
                    type="range"
                    id={id}
                    min={min}
                    max={max}
                    value={value}
                    step={step}
                    onChange={({ target }) => onChange(target.valueAsNumber)}
                />
                {onReset && <IconButton style="lighter" icon="times" title="Reset" onClick={onReset} />}
            </div>
        </div>
    );
}

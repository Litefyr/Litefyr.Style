import React from "react";
import { Label } from "@neos-project/react-ui-components";
import RangeEditor from "/_Resources/Static/Packages/Carbon.RangeEditor/RangeEditor.js";

export default function RangeInput({
    id,
    value,
    label,
    min = 0,
    max = 100,
    step = 1,
    unit = "",
    onChange,
    resetValue,
}) {
    return (
        <div>
            <Label htmlFor={id}>{label}</Label>
            <RangeEditor
                id={id}
                value={value}
                commit={onChange}
                options={{ min, max, step, unit, resetValue, resetIcon: "undo" }}
            />
        </div>
    );
}

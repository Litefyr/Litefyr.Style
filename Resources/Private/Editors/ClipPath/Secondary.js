import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { ClipPathOutput, calculate, ControlBar } from "./Components";
import { style } from "../Components";

export default function SecondaryClipPath({ onChange, value, topColor, bottomColor, i18nRegistry }) {
    const [state, setState] = useState({
        width: 1200,
        height: 140,
        offset: 70,
        amplitude: 60,
        frequency: 1.5,
        points: 7,
        phase: 0,
        asyncPhaseEnable: false,
        asyncPhase: 0,
        top: null,
        bottom: null,
    });

    function handleCommit({
        width,
        height,
        offset,
        amplitude,
        frequency,
        points,
        phase,
        asyncPhaseEnable,
        asyncPhase,
    }) {
        if (width == undefined) {
            width = state.width;
        }
        if (height == undefined) {
            height = state.height;
        }
        if (offset == undefined) {
            offset = state.offset;
        }
        if (amplitude == undefined) {
            amplitude = state.amplitude;
        }
        if (frequency == undefined) {
            frequency = state.frequency;
        }
        if (points == undefined) {
            points = state.points;
        }
        if (phase == undefined) {
            phase = state.phase;
        }

        if (asyncPhaseEnable == undefined) {
            asyncPhaseEnable = !!state.asyncPhaseEnable;
        }
        if (asyncPhase == undefined) {
            asyncPhase = state.asyncPhase;
        }

        const result = calculate({
            width,
            height,
            offset,
            amplitude,
            frequency,
            points,
            phase,
            asyncPhaseEnable,
            asyncPhase,
        });

        setState(result);
        onChange(result);
    }

    useEffect(() => {
        const result = calculate({ ...state, ...value });
        setState(result);
        if (!value.top || !value.bottom) {
            onChange(result);
        }
    }, []);

    const labelArray = [
        "content",
        "width",
        "height",
        "offset",
        "amplitude",
        "frequency",
        "points",
        "phase",
        "asyncPhaseEnable",
        "asyncPhase",
    ];

    const labels = {};
    labelArray.forEach((key) => {
        labels[key] = i18nRegistry.translate(`Litefyr.Style:NodeTypes.Mixin.Visuals.ClipPath:editor.${key}`);
    });

    return (
        <div className={style.secondaryGrid}>
            <ControlBar state={state} onCommit={handleCommit} labels={labels} />
            <ClipPathOutput state={state} label={labels.content} topColor={topColor} bottomColor={bottomColor} />
        </div>
    );
}

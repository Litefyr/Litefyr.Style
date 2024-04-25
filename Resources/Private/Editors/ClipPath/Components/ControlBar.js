import React from "react";
import clsx from "clsx";
import { Icon, RangeInput, style } from "../../Components";

export default function ControlBar({ state, onCommit, labels }) {
    const frequencyIcons = {
        wave: {
            min: <Icon.WaveLow />,
            max: <Icon.WaveHigh />,
        },
        peak: {
            min: <Icon.PeakLow />,
            max: <Icon.PeakHigh />,
        },
    };

    return (
        <div className={style.secondaryControls}>
            <RangeInput
                state={state}
                onCommit={onCommit}
                property="width"
                label={labels.width}
                min={200}
                max={1400}
                minIcon={
                    <div className={clsx(style.flex)}>
                        <Icon.ArrowRight size="12" />
                        <Icon.ArrowLeft size="12" />
                    </div>
                }
                maxIcon={
                    <div className={clsx(style.flex)}>
                        <Icon.ArrowLeft size="12" />
                        <Icon.ArrowRight size="12" />
                    </div>
                }
            />
            <RangeInput
                state={state}
                onCommit={onCommit}
                property="height"
                label={labels.height}
                min={20}
                max={500}
                minIcon={
                    <div className={clsx(style.flex, style.flexColumn)}>
                        <Icon.ArrowDown size="12" />
                        <Icon.ArrowUp size="12" />
                    </div>
                }
                maxIcon={
                    <div className={clsx(style.flex, style.flexColumn)}>
                        <Icon.ArrowUp size="12" />
                        <Icon.ArrowDown size="12" />
                    </div>
                }
            />
            <RangeInput
                state={state}
                onCommit={onCommit}
                property="offset"
                label={labels.offset}
                min={1}
                max={250}
                minIcon={<Icon.ArrowDown />}
                maxIcon={<Icon.ArrowUp />}
            />
            <RangeInput
                state={state}
                onCommit={onCommit}
                property="amplitude"
                label={labels.amplitude}
                min={1}
                max={200}
                minIcon={<Icon.Mountain />}
                maxIcon={<Icon.Mountain size="48" />}
            />
            <RangeInput
                state={state}
                onCommit={onCommit}
                property="frequency"
                label={labels.frequency}
                min={0.1}
                max={10}
                step={0.1}
                minIcon={frequencyIcons[state.points < 7 ? "peak" : "wave"].min}
                maxIcon={frequencyIcons[state.points < 7 ? "peak" : "wave"].max}
            />
            <RangeInput
                state={state}
                onCommit={onCommit}
                property="points"
                label={labels.points}
                min={1}
                max={10}
                step={1}
                minIcon={<Icon.Peak />}
                maxIcon={<Icon.Wave />}
            />
            <RangeInput
                state={state}
                onCommit={onCommit}
                property="phase"
                label={labels.phase}
                min={-180}
                max={180}
                step={5}
                minIcon={<Icon.AngleLow />}
                maxIcon={<Icon.AngleHigh />}
            />
            <RangeInput
                state={state}
                onCommit={onCommit}
                property="asyncPhase"
                enableProperty="asyncPhaseEnable"
                label={labels.asyncPhase}
                min={-180}
                max={180}
                step={5}
                minIcon={<Icon.AngleLow />}
                maxIcon={<Icon.AngleHigh />}
            />
        </div>
    );
}

import clsx from "clsx";
import React from "react";
import { style } from "../../Components";

export function calculate(state) {
    const { width, height, offset, amplitude, frequency, points, phase, asyncPhaseEnable, asyncPhase } = state;
    let scaledPoints = points;
    if (scaledPoints > 6) {
        const pointsScale = {
            7: 100,
            8: 150,
            9: 200,
            10: 300,
        };
        scaledPoints = pointsScale[points] || 300;
    }

    const units = (2 * Math.PI * (frequency * -1)) / scaledPoints;
    const radPhase = (phase * Math.PI) / 180;

    const top = calcPath({ scaledPoints, offset, amplitude, units, radPhase, height });
    const bottom = asyncPhaseEnable
        ? calcPath({ scaledPoints, offset, amplitude, units, radPhase: (asyncPhase * Math.PI) / 180, height })
        : top;
    return { ...state, top, bottom };
}

function calcPath({ scaledPoints, offset, amplitude, units, radPhase, height }) {
    const path = [];
    for (let i = 0; i <= scaledPoints; i++) {
        const value = offset + amplitude * Math.cos(i * units + radPhase);
        const X = (i * 100) / scaledPoints;
        const Y = (value / height) * 100;
        path.push(`${X.toFixed(2)}% ${Y.toFixed(2)}%`);
    }
    return path.join(",");
}

function getClipPath(path, top = true) {
    return top ? `polygon(100% 100%,0% 100%,${path})` : `polygon(100% 0%,0% 0%,${path})`;
}

export default function ClipPathOutput({ state, label, topColor, bottomColor }) {
    const { width, height, top, bottom, asyncPhaseEnable } = state;
    if (!top || !bottom) {
        return "";
    }
    const aspectRatio = `${width}  / ${height}`;
    const margin = `${(height / width) * -100}%`;

    return (
        <div className={clsx(style.checkboard, style.clipPathOutput)}>
            <div style={{ position: "relative", zIndex: 2 }}>
                <div
                    className={style.bgBlue}
                    style={{
                        backgroundColor: topColor,
                        aspectRatio,
                        clipPath: getClipPath(top),
                        marginBottom: "-1px",
                    }}
                ></div>
                <h1 style={{ backgroundColor: topColor }} className={clsx(style.outputContent, style.bgBlue)}>
                    {label}
                </h1>
                <div
                    className={style.bgBlue}
                    style={{
                        backgroundColor: topColor,
                        aspectRatio,
                        clipPath: getClipPath(bottom, false),
                    }}
                ></div>
            </div>
            {asyncPhaseEnable && (
                <div style={{ position: "relative", zIndex: 1 }}>
                    <div
                        className={style.bgViolet}
                        style={{
                            backgroundColor: bottomColor,
                            aspectRatio,
                            clipPath: getClipPath(top),
                            marginTop: margin,
                            marginBottom: "-1px",
                            zIndex: -1,
                        }}
                    ></div>
                    <h1 style={{ backgroundColor: bottomColor }} className={clsx(style.outputContent, style.bgViolet)}>
                        {label}
                    </h1>
                    <div
                        className={style.bgViolet}
                        style={{
                            backgroundColor: bottomColor,
                            aspectRatio,
                            clipPath: getClipPath(bottom, false),
                        }}
                    ></div>
                </div>
            )}
        </div>
    );
}

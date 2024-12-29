import React, { useRef, useEffect, useState, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { neos } from "@neos-project/neos-ui-decorators";
import { Button, Label, IconButton } from "@neos-project/react-ui-components";
import TextInput from "/_Resources/Static/Packages/Carbon.Editor.Styling/TextInput.js";
import { style, Dropdown } from "./index";
import * as FunctionCurveEditor from "./FunctionCurveEditor";
import { nanoid } from "nanoid";
import clsx from "clsx";

const maxX = 100;
const maxY = 50;

const rangeValues = {
    xMin: 0,
    xMax: maxX,
    yMin: 0,
    yMax: maxY,
};
const border = maxY / 20;

const minKnots = 2;
const maxKnots = 100;

const limitPoints = (number) => Math.min(Math.max(number, minKnots), maxKnots);

function CurveEditor({ top, onCommit, state, interpolationMethods, labels, showGrid, snapToGrid }) {
    const id = useMemo(() => nanoid(), []);
    const interpolationMethodOptions = interpolationMethods.map((method) => ({
        value: method,
        label: labels[method],
    }));
    const validateInterpolationMethod = (value) => interpolationMethods.some((method) => method == value);

    const initialKnots = [
        { x: rangeValues.xMin, y: rangeValues.yMax / 2 },
        { x: rangeValues.xMax / 2, y: rangeValues.yMax / 2 + 2 },
        { x: rangeValues.xMax, y: rangeValues.yMax / 2 },
    ];

    const initialEditorState = {
        knots: state.points ? state.points : initialKnots,
        xMin: rangeValues.xMin - border,
        xMax: rangeValues.xMax + border,
        yMin: rangeValues.yMin - border,
        yMax: rangeValues.yMax + border,
        rangeValues,
        gridEnabled: true,
        snapToGridEnabled: true,
        interpolationMethod: state.interpolationMethod || "cubic",
    };

    const size = {
        width: (initialEditorState.xMax - initialEditorState.xMin) * 10,
        height: (initialEditorState.yMax - initialEditorState.yMin) * 10,
    };
    const [coordinateString, setCoordinateString] = useState(null);
    const [initialCoordinateString, setInitialCoordinateString] = useState(null);
    const [interpolationMethod, setInterpolationMethod] = useState(initialEditorState.interpolationMethod);
    const [initialInterpolationMethod, setInitialInterpolationMethod] = useState(
        initialEditorState.interpolationMethod,
    );

    const canvas = useRef(null);
    const [widget, setWidget] = useState(null);
    const [knotsLength, setKnotsLength] = useState(null);
    const [knotsLengthDebounced] = useDebounce(knotsLength, 250);
    const [knotsLengthInput, setKnotsLengthInput] = useState(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [canReset, setCanReset] = useState(false);
    const [canDeletePoint, setCanDeletePoint] = useState(false);

    useEffect(() => {
        setKnotsLength(limitPoints(knotsLengthInput));
    }, [knotsLengthInput]);

    useEffect(() => {
        const element = new FunctionCurveEditor.Widget(canvas.current);
        element.setEditorState(initialEditorState);
        const eState = element.getEditorState();
        setKnotsLengthInput(limitPoints(eState.knots.length));
        const coordinateString = element.getKnotCoordinateString();
        const interpolationMethod = eState.interpolationMethod;
        setInitialCoordinateString(coordinateString);
        setCoordinateString(coordinateString);
        setInterpolationMethod(interpolationMethod);
        setInitialInterpolationMethod(interpolationMethod);
        element.addEventListener("change", ({ detail }) => {
            const { knotsLength, coordinateString, knots, interpolationMethod } = detail;
            setKnotsLengthInput(knotsLength);
            setCoordinateString(coordinateString);
            if (
                !widget &&
                initialCoordinateString === coordinateString &&
                interpolationMethod === initialInterpolationMethod
            ) {
                return;
            }
            onCommit({ interpolationMethod, points: knots });
            //debouncedOnCommit(knots, coordinateString, interpolationMethod);
        });
        element.addEventListener("hasSelectedKnot", ({ detail }) => {
            setCanDeletePoint(!!detail);
        });
        setWidget(element);
        if (!state.points) {
            onCommit({ interpolationMethod, points: initialKnots });
        }
        return () => {
            element.setConnected(false);
        };
    }, []);

    useMemo(() => {
        setCanReset(initialCoordinateString !== coordinateString);
        if (widget) {
            setCanUndo(widget.canUndo());
            setCanRedo(widget.canRedo());
        }
    }, [coordinateString]);

    useMemo(() => {
        if (!widget) {
            return;
        }
        const eState = widget.getEditorState();
        eState.gridEnabled = showGrid;
        widget.setEditorState(eState);
    }, [showGrid]);

    useMemo(() => {
        if (!widget) {
            return;
        }
        const eState = widget.getEditorState();
        eState.snapToGridEnabled = snapToGrid && showGrid;
        widget.setEditorState(eState);
    }, [snapToGrid]);

    useMemo(() => {
        if (!widget) {
            return;
        }
        const eState = widget.getEditorState();
        eState.interpolationMethod = interpolationMethod;
        widget.setEditorState(eState);
        action("fireChangeEvent");
    }, [interpolationMethod]);

    useMemo(() => {
        if (!widget) {
            return;
        }
        const eState = widget.getEditorState();

        const oldKnots = eState.knots;
        const oldKnotsLength = oldKnots.length;

        if (knotsLengthDebounced === oldKnotsLength || !oldKnotsLength) {
            return;
        }

        const xMin = oldKnots[0].x;
        const xMax = oldKnots[oldKnotsLength - 1].x;
        const uniFunction = widget.getFunction();
        const newKnots = Array(knotsLengthDebounced);
        for (let i = 0; i < knotsLengthDebounced; i++) {
            const x = xMin + ((xMax - xMin) / (knotsLengthDebounced - 1)) * i;
            const y = uniFunction(x);
            newKnots[i] = { x, y };
        }
        eState.knots = newKnots;
        widget.setEditorState(eState);
        action("fireChangeEvent");
    }, [knotsLengthDebounced]);

    function action(func) {
        widget.action(func);
    }

    async function pasteConfig() {
        try {
            const text = await navigator.clipboard.readText();
            try {
                const [interpolationMethod, coordinateString] = text.split("||");

                if (!validateInterpolationMethod(interpolationMethod)) {
                    alert(labels.interpolationMethodError);
                    console.error(`${interpolationMethod} is not a valid interpolation method`);
                    return;
                }
                try {
                    widget.setKnotCoordinateString(coordinateString);
                    setInterpolationMethod(interpolationMethod);
                    action("fireChangeEvent");
                } catch (error) {
                    alert(labels.coordinatesError);
                    console.error(error);
                }
            } catch (error) {
                alert(labels.parseConfigError);
                console.error(error);
            }
        } catch (error) {
            alert(labels.clipboardError);
            console.error(error);
        }
    }

    function flipPoints(vertically = true) {
        const coords = JSON.parse(`[${coordinateString}]`);
        let inverted;
        if (vertically) {
            inverted = coords.map(([x, y]) => [x, Math.abs(y - rangeValues.yMax)]).reverse();
        } else {
            inverted = coords.map(([x, y]) => [Math.abs(x - rangeValues.xMax), y]).reverse();
        }
        widget.setKnotCoordinateString(JSON.stringify(inverted).slice(1).slice(0, -1));
        action("fireChangeEvent");
    }

    const [openInterpolationMethod, setOpenInterpolationMethod] = useState(false);

    return (
        <>
            <div className={clsx(style.curveOutput, top ? style.curveOutputTop : style.curveOutputBottom)}>
                <canvas ref={canvas} width={size.width} height={size.height} tabindex="-1"></canvas>
            </div>
            {widget && (
                <div className={clsx(style.curveControls, top ? style.curveControlsTop : style.curveControlsBottom)}>
                    {interpolationMethods.length > 1 && (
                        <div>
                            <Dropdown
                                label={labels.interpolationmethod}
                                options={interpolationMethodOptions}
                                value={interpolationMethod}
                                onChange={setInterpolationMethod}
                            />
                        </div>
                    )}
                    <div>
                        <Label htmlFor={`${id}_knots`}>{labels.numberOfPoints}</Label>
                        <div className={style.numberOfPoints}>
                            <Button onClick={() => setKnotsLengthInput(limitPoints(knotsLength - 1))}>-</Button>
                            <TextInput
                                id={`${id}_knots`}
                                type="number"
                                min={minKnots}
                                max={maxKnots}
                                value={knotsLengthInput}
                                onChange={setKnotsLengthInput}
                                textAlign="center"
                            />
                            <Button onClick={() => setKnotsLengthInput(limitPoints(knotsLength + 1))}>+</Button>
                        </div>
                    </div>
                    <div className={style.iconButtons}>
                        <IconButton
                            style="neutral"
                            icon="copy"
                            title={labels.copyConfig}
                            onClick={() => {
                                navigator.clipboard.writeText(`${interpolationMethod}||${coordinateString}`);
                            }}
                        />
                        <IconButton style="neutral" icon="paste" title={labels.pasteConfig} onClick={pasteConfig} />
                        <IconButton
                            iconProps={{
                                className: style.rotate90,
                            }}
                            style="neutral"
                            icon="exchange-alt"
                            title={labels.flipVertically}
                            onClick={() => flipPoints(true)}
                        />
                        <IconButton
                            style="neutral"
                            icon="exchange-alt"
                            title={labels.flipHorizontally}
                            onClick={() => flipPoints(false)}
                        />
                        <IconButton
                            disabled={!canUndo}
                            style="neutral"
                            hoverStyle="warn"
                            icon="undo"
                            title={labels.undo}
                            onClick={() => action("undo")}
                        />
                        <IconButton
                            disabled={!canRedo}
                            style="neutral"
                            hoverStyle="warn"
                            icon="redo"
                            title={labels.redo}
                            onClick={() => action("redo")}
                        />
                        <IconButton
                            disabled={!canDeletePoint}
                            style="neutral"
                            hoverStyle="error"
                            icon="trash"
                            title={labels.deletePoint}
                            onClick={() => action("deletePoint")}
                        />
                        <IconButton
                            disabled={!canReset}
                            style="neutral"
                            hoverStyle="error"
                            icon="times"
                            title={labels.reset}
                            onClick={() => action("reset")}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

const labelArray = [
    "akima",
    "clipboardError",
    "coordinatesError",
    "copyConfig",
    "cubic",
    "deletePoint",
    "flipHorizontally",
    "flipVertically",
    "interpolationmethod",
    "interpolationMethodError",
    "linear",
    "loess",
    "nearestNeighbor",
    "numberOfPoints",
    "parseConfigError",
    "pasteConfig",
    "redo",
    "reset",
    "undo",
];

const neosifier = neos((globalRegistry) => {
    const i18nRegistry = globalRegistry.get("i18n");
    const labels = {};
    labelArray.forEach((key) => {
        labels[key] = i18nRegistry.translate(`Litefyr.Style:NodeTypes.Mixin.Visuals.ClipPath:editor.${key}`);
    });
    return { labels };
});

export default neosifier(CurveEditor);

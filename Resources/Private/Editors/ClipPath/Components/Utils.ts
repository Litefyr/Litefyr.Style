import { createInterpolatorWithFallback, InterpolationMethod } from "commons-math-interpolation";

declare type Point = {
    x: number;
    y: number;
};
declare type Points = Point[];

export const convertNesting = (nesting) => (nesting ? nesting / -100 : 0);

const getConfig = ({ interpolationMethod, points }) => ({ interpolationMethod, points });

export function calculate(state) {
    const asyncPath = !!state?.asyncPath;
    const topSpacing = state?.topSpacing || 0;
    const bottomSpacing = state?.bottomSpacing || 0;
    const top = calcPath({
        config: state.top,
        top: true,
        spacing: topSpacing,
    });
    const bottom = calcPath({
        config: asyncPath ? state.bottom : state.top,
        top: false,
        spacing: bottomSpacing,
    });
    const topConfig = getConfig(state.top);
    const bottomConfig = getConfig(state.bottom);
    const nesting = state?.nesting || 0;
    const reverseStacking = !!state?.reverseStacking;
    const css = {
        nesting: convertNesting(nesting),
        reverseStacking: nesting ? reverseStacking : false,
        raw: {
            top: top?.clipPath,
            bottom: bottom?.clipPath,
        },
        height: {
            top: top?.padding,
            bottom: bottom?.padding,
        },
    };
    return { asyncPath, nesting, reverseStacking, topConfig, bottomConfig, css, topSpacing, bottomSpacing };
}

export function calcPath({
    config,
    top,
    spacing = 0,
    containerWidth = null,
}: {
    config: {
        interpolationMethod: InterpolationMethod;
        points: Points;
    };
    top: boolean;
    spacing: number;
    containerWidth?: number | null;
}) {
    const interpolationMethod = config?.interpolationMethod;
    const points = config?.points;

    if (!interpolationMethod || !points || points.length < 2) {
        return null;
    }

    const method = points.length < 3 && interpolationMethod !== "nearestNeighbor" ? "linear" : interpolationMethod;
    return convertToClipPath({ points, method, top, containerWidth, spacing });
}

const dummyResolvedPromise = Promise.resolve();

const getHighestYValueFromPoints = (points: Points) => points.reduce((prev, { y }) => (prev < y ? y : prev), 0);
const getLowestYValueFromPoints = (points: Points) => points.reduce((prev, { y }) => (prev < y ? prev : y), Infinity);

function pointsForTop(points: Points) {
    const maxY = getHighestYValueFromPoints(points);
    return points.map(({ x, y }) => ({ x, y: Math.abs(y - maxY) }));
}

function pointsForBottom(points: Points) {
    const minY = getLowestYValueFromPoints(points);
    return points.map(({ x, y }) => ({ x, y: y - minY })).reverse();
}

function convertPointsToClipPath({
    points,
    unit,
    multiplier,
    top = false,
}: {
    points: Points;
    unit: string;
    multiplier: number;
    top: boolean;
}) {
    const before = top ? "" : "calc(100% - ";
    const after = top ? "" : ")";
    return points.map(({ x, y }) => `${x}% ${before}${y * multiplier}${unit}${after}`).join(",");
}

function convertToClipPath({
    points,
    method,
    top,
    containerWidth = null,
    numberOfPoints = 100,
    spacing,
}: {
    points: Points;
    method: InterpolationMethod;
    top: boolean;
    containerWidth?: number;
    numberOfPoints?: number;
    spacing: number;
}) {
    const unit = containerWidth ? "px" : "vw";
    const multiplier = containerWidth ? Math.round(containerWidth / 100) : 1;

    if (method === "linear") {
        return pointsToClipPath({ points, unit, multiplier, top, spacing });
    }

    if (method === "nearestNeighbor") {
        numberOfPoints = 10000;
    }

    const pointsCount = points.length;
    const xMin = points[0].x;
    const xMax = points[pointsCount - 1].x;
    const increaseValue = (xMax - xMin) / numberOfPoints;

    const newPoints = [];
    const uniFunction = createInterpolationFunction({ points, method });
    for (let x = xMin; x <= xMax; x += increaseValue) {
        const y = uniFunction(x);
        newPoints.push({ x, y });
    }
    return pointsToClipPath({ points: newPoints, unit, multiplier, top, spacing });
}

function mergeYValues(points) {
    let lastY;
    const lastIndex = points.length - 1;
    return points.filter(({ y }, index) => {
        if (index === 0 || index === lastIndex) {
            lastY = y;
            return true;
        }
        const nextY = points[index + 1]?.y;
        if (lastY == y && nextY == y) {
            return false;
        }
        lastY = y;
        return true;
    });
}

function pointsToClipPath({ points, top, multiplier, unit, spacing }) {
    const convertedPoints = mergeYValues(top ? pointsForTop(points) : pointsForBottom(points));
    const padding = (getHighestYValueFromPoints(convertedPoints) + spacing) * multiplier;
    const roundValue = unit == "vw" ? 1000 : 1;
    return {
        clipPath: convertPointsToClipPath({ points: convertedPoints, unit, top, multiplier }),
        padding: Math.round(padding * roundValue) / roundValue + unit,
    };
}

export function nextTick(callback: () => void) {
    void dummyResolvedPromise.then(callback);
}

export const clone = (input) => JSON.parse(JSON.stringify(input));

export function createInterpolationFunction({ points, method }) {
    const n = points.length;
    const xVals = new Float64Array(n);
    const yVals = new Float64Array(n);
    for (let i = 0; i < n; i++) {
        xVals[i] = points[i].x;
        yVals[i] = points[i].y;
    }
    return createInterpolatorWithFallback(method, xVals, yVals);
}

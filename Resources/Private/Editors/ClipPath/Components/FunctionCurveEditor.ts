import { UniFunction, InterpolationMethod } from "commons-math-interpolation";
import { nextTick, clone, createInterpolationFunction } from "./Utils";

//--- Point and PointUtils -----------------------------------------------------

export interface Point {
    x: number;
    y: number;
}

class PointUtils {
    public static clone(p: Point): Point {
        return { x: p.x, y: p.y };
    }

    // Returns the distance between two points.
    public static computeDistance(point1: Point, point2: Point): number {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    public static computeCenter(point1: Point, point2: Point): Point {
        return { x: (point1.x + point2.x) / 2, y: (point1.y + point2.y) / 2 };
    }

    // Returns the index of points1[pointIndex] in points2, or undefined.
    public static mapPointIndex(
        points1: Point[],
        points2: Point[],
        pointIndex: number | undefined,
    ): number | undefined {
        if (pointIndex == undefined) {
            return;
        }
        const point = points1[pointIndex];
        return PointUtils.findPoint(points2, point);
    }

    // Returns the index of point in the points array or undefined.
    public static findPoint(points: Point[], point: Point): number | undefined {
        if (!point) {
            return;
        }
        const i = points.indexOf(point);
        return i >= 0 ? i : undefined;
    }

    public static makeXValsStrictMonotonic(points: Point[]) {
        for (let i = 1; i < points.length; i++) {
            if (points[i].x <= points[i - 1].x) {
                const x = points[i - 1].x + 1e-6;
                points[i] = { x, y: points[i].y };
            }
        }
    }

    public static encodeCoordinateList(points: Point[]): string {
        let s: string = "";
        for (const point of points) {
            if (s.length > 0) {
                s += ", ";
            }
            s += "[" + formatCoordinateValue(point.x) + ", " + formatCoordinateValue(point.y) + "]";
        }
        return s;
    }

    public static decodeCoordinateList(s: string): Point[] {
        const a = JSON.parse("[" + s + "]");
        const points: Point[] = Array(a.length);
        for (let i = 0; i < a.length; i++) {
            const e = a[i];
            if (!Array.isArray(e) || e.length != 2 || typeof e[0] != "number" || typeof e[1] != "number") {
                throw new Error("Invalid syntax in element " + i + ".");
            }
            points[i] = { x: e[0], y: e[1] };
        }
        return points;
    }
}

function formatCoordinateValue(v: number) {
    let s = String(v);
    if (s.length > 10) {
        s = v.toPrecision(6);
    }
    return s;
}

//--- Plotter ------------------------------------------------------------------

class FunctionPlotter {
    private wctx: WidgetContext;
    private ctx: CanvasRenderingContext2D;
    private newCanvasWidth: number;
    private newCanvasHeight: number;

    public constructor(wctx: WidgetContext) {
        this.wctx = wctx;
        const ctx = wctx.canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Canvas 2D context not available.");
        }
        ctx.scale(wctx.ratio, wctx.ratio);
        this.ctx = ctx;
    }

    private clearCanvas() {
        const wctx = this.wctx;
        const ctx = this.ctx;
        ctx.save();
        const width = wctx.getWidth();
        const height = wctx.getHeight();
        ctx.fillStyle = wctx.eState.background;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }

    private drawKnot(knotNdx: number) {
        const wctx = this.wctx;
        const ctx = this.ctx;
        const knot = wctx.eState.knots[knotNdx];
        const point = wctx.mapLogicalToCanvasCoordinates(knot);
        ctx.save();
        ctx.beginPath();
        const isDragging = knotNdx == wctx.iState.selectedKnotNdx && wctx.iState.knotDragging;
        const isSelected = knotNdx == wctx.iState.selectedKnotNdx;
        const isPotential = knotNdx == wctx.iState.potentialKnotNdx;
        const bold = isDragging || isSelected || isPotential;
        const r = (bold ? 5 : 4) * wctx.ratio;
        ctx.arc(point.x, point.y, r, 0, 2 * Math.PI);
        ctx.lineWidth = (bold ? 3 : 2) * wctx.ratio;
        ctx.strokeStyle =
            isDragging || isPotential
                ? wctx.eState.activeKnotColor
                : isSelected
                  ? wctx.eState.selectedKnotColor
                  : wctx.eState.defaultKnotColor;
        ctx.stroke();
        ctx.restore();
        wctx.fireEvent("hasSelectedKnot", !!wctx.iState.selectedKnotNdx);
    }

    private drawKnots() {
        const knots = this.wctx.eState.knots;
        for (let knotNdx = 0; knotNdx < knots.length; knotNdx++) {
            this.drawKnot(knotNdx);
        }
    }

    private drawGridLine(p: number, cPos: number, xy: boolean, center: boolean) {
        const wctx = this.wctx;
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = wctx.eState[center ? "centerLineColor" : "lineColor"];
        ctx.fillRect(xy ? cPos : 0, xy ? 0 : cPos, xy ? 1 : wctx.getWidth(), xy ? wctx.getHeight() : 1);
        ctx.restore();
    }

    private calcGridLine(p: number, space: number, xy: boolean, forceCenter: boolean = false) {
        const wctx = this.wctx;
        const lPos = p * space;
        const cPos = xy ? wctx.mapLogicalToCanvasXCoordinate(lPos) : wctx.mapLogicalToCanvasYCoordinate(lPos);
        if (!forceCenter && (xy ? cPos > wctx.getWidth() : cPos < 0)) {
            return null;
        }
        const center = forceCenter || p == wctx.eState.rangeValues[xy ? "xMax" : "yMax"] / 2;
        this.drawGridLine(p, cPos, xy, center);
        return center;
    }

    private drawXYGrid(xy: boolean) {
        const wctx = this.wctx;
        const gp = wctx.getGridParms(xy);
        if (!gp) {
            return;
        }
        let p = gp.pos;
        let hasCenter = false;
        let loopCtr = 0;
        while (true) {
            const center = this.calcGridLine(p, gp.space, xy);
            if (center === null) {
                break;
            }
            if (center === true) {
                hasCenter = true;
            }
            p += gp.span;
            if (loopCtr++ > 100) {
                // to prevent endless loop on numerical instability
                break;
            }
        }
        if (!hasCenter) {
            this.calcGridLine((p - 1) / 2, gp.space, xy, true);
        }
    }

    private drawGrid() {
        this.drawXYGrid(true);
        this.drawXYGrid(false);
    }

    private drawFunctionCurve(uniFunction: UniFunction, lxMin: number, lxMax: number) {
        const wctx = this.wctx;
        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        const cxMin = Math.max(0, Math.ceil(wctx.mapLogicalToCanvasXCoordinate(lxMin)));
        const cxMax = Math.min(wctx.getWidth(), Math.floor(wctx.mapLogicalToCanvasXCoordinate(lxMax)));
        for (let cx = cxMin; cx <= cxMax; cx++) {
            const lx = wctx.mapCanvasToLogicalXCoordinate(cx);
            const ly = uniFunction(lx);
            const cy = Math.max(-1e6, Math.min(1e6, wctx.mapLogicalToCanvasYCoordinate(ly)));
            ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = wctx.eState.curveColor;
        ctx.lineWidth = wctx.ratio * 2;
        ctx.stroke();
        ctx.restore();
    }

    private drawFunctionCurveFromKnots() {
        const wctx = this.wctx;
        const knots = wctx.eState.knots;
        if (knots.length < 2) {
            return;
        }
        const xMin = knots[0].x;
        const xMax = knots[knots.length - 1].x;
        const uniFunction = wctx.createInterpolationFunction();
        this.drawFunctionCurve(uniFunction, xMin, xMax);
    }

    public paint() {
        const wctx = this.wctx;
        if (!this.newCanvasWidth || !this.newCanvasHeight) {
            return;
        }
        if (this.newCanvasWidth != wctx.getWidth() || this.newCanvasHeight != wctx.getHeight()) {
            wctx.canvas.width = this.newCanvasWidth;
            wctx.canvas.height = this.newCanvasHeight;
        }
        this.clearCanvas();
        if (wctx.eState.gridEnabled) {
            this.drawGrid();
        }
        this.drawKnots();
        this.drawFunctionCurveFromKnots();
    }

    public resize(width: number, height: number) {
        const wctx = this.wctx;
        if (this.newCanvasWidth == width && this.newCanvasHeight == height) {
            return;
        }
        this.newCanvasWidth = width * wctx.ratio;
        this.newCanvasHeight = height * wctx.ratio;
        wctx.requestRefresh();
    }
}

//--- Pointer controller -------------------------------------------------------

// Controller for mouse and touch input.
class PointerController {
    private wctx: WidgetContext;
    private pointers: Map<number, PointerEvent>; // maps IDs of active pointers to last pointer events
    private dragCount: number;
    private lastTouchTime: number;

    public constructor(wctx: WidgetContext) {
        this.wctx = wctx;
        this.pointers = new Map();
        wctx.canvas.addEventListener("pointerdown", this.pointerDownEventListener);
        wctx.canvas.addEventListener("pointerup", this.pointerUpEventListener);
        wctx.canvas.addEventListener("pointercancel", this.pointerUpEventListener);
        wctx.canvas.addEventListener("pointermove", this.pointerMoveEventListener);
        wctx.canvas.addEventListener("dblclick", this.dblClickEventListener);
    }

    public dispose() {
        const wctx = this.wctx;
        wctx.canvas.removeEventListener("pointerdown", this.pointerDownEventListener);
        wctx.canvas.removeEventListener("pointerup", this.pointerUpEventListener);
        wctx.canvas.removeEventListener("pointercancel", this.pointerUpEventListener);
        wctx.canvas.removeEventListener("pointermove", this.pointerMoveEventListener);
        wctx.canvas.removeEventListener("dblclick", this.dblClickEventListener);

        this.releaseAllPointers();
    }

    public processEscKey() {
        this.abortDragging();
    }

    private pointerDownEventListener = (event: PointerEvent) => {
        if (
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            (event.pointerType == "mouse" && event.button != 0)
        ) {
            return;
        }
        if (this.isPointerInResizeHandle(event)) {
            return;
        }
        this.trackPointer(event);
        if ((event.pointerType == "touch" || event.pointerType == "pen") && this.pointers.size == 1) {
            // detect double-click with touch or pen
            if (this.lastTouchTime > 0 && performance.now() - this.lastTouchTime <= 300) {
                // double-click
                this.lastTouchTime = 0;
                this.processDoubleClickTouch();
                event.preventDefault();
                return;
            }
            this.lastTouchTime = performance.now();
        }
        this.switchMode();
        event.preventDefault();
    };

    private pointerUpEventListener = (event: PointerEvent) => {
        if (!this.pointers.has(event.pointerId)) {
            return;
        }
        this.releasePointer(event.pointerId);
        this.switchMode();
        event.preventDefault();
    };

    private switchMode() {
        const wctx = this.wctx;
        this.stopDragging();
        if (this.pointers.size == 1) {
            // left click or single touch
            this.startDragging();
            wctx.canvas.focus();
        }
    }

    private pointerMoveEventListener = (event: PointerEvent) => {
        if (!this.pointers.has(event.pointerId)) {
            this.updatePotentialKnot(event);
            return;
        }
        this.trackPointer(event);

        if (this.pointers.size == 1) {
            this.drag();
        }
        event.preventDefault();
    };

    private trackPointer(event: PointerEvent) {
        const wctx = this.wctx;
        const pointerId = event.pointerId;
        if (!this.pointers.has(pointerId)) {
            wctx.canvas.setPointerCapture(pointerId);
        }
        this.pointers.set(pointerId, event);
    }

    private releasePointer(pointerId: number) {
        const wctx = this.wctx;
        this.pointers.delete(pointerId);
        wctx.canvas.releasePointerCapture(pointerId);
    }

    private releaseAllPointers() {
        while (this.pointers.size > 0) {
            const pointerId = this.pointers.keys().next().value;
            this.releasePointer(pointerId);
        }
    }

    private startDragging() {
        const wctx = this.wctx;
        const cPoint = this.getCanvasCoordinates();
        const pointerType = this.pointers.values().next().value.pointerType;
        const knotNdx = this.findNearKnot(cPoint, pointerType);
        wctx.iState.selectedKnotNdx = knotNdx;
        wctx.iState.knotDragging = knotNdx != undefined;
        this.dragCount = 0;
        wctx.iState.potentialKnotNdx = undefined;
        wctx.requestRefresh();
    }

    private abortDragging() {
        const wctx = this.wctx;
        if (wctx.iState.knotDragging && this.dragCount > 0) {
            wctx.undo();
            wctx.fireChangeEvent();
        }
        this.stopDragging();
        wctx.requestRefresh();
    }

    private stopDragging() {
        const wctx = this.wctx;
        if (wctx.iState.knotDragging) {
            wctx.requestRefresh();
        }
        wctx.iState.knotDragging = false;
    }

    private drag() {
        const wctx = this.wctx;
        const cPoint = this.getCanvasCoordinates();
        if (wctx.iState.knotDragging && wctx.iState.selectedKnotNdx != undefined) {
            if (this.dragCount++ == 0) {
                wctx.pushUndoHistoryState();
            }
            const lPoint = wctx.mapCanvasToLogicalCoordinates(cPoint);
            const lPoint2 = this.snapToGrid(lPoint);
            wctx.moveKnot(wctx.iState.selectedKnotNdx, lPoint2);
            wctx.requestRefresh();
            wctx.fireChangeEvent();
        }
    }

    private processDoubleClickTouch() {
        const cPoint = this.getCanvasCoordinates();
        this.createKnot(cPoint);
    }

    private dblClickEventListener = (event: MouseEvent) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.button != 0) {
            return;
        }
        const cPoint = this.getCanvasCoordinatesFromEvent(event);
        this.createKnot(cPoint);
        event.preventDefault();
    };

    private createKnot(cPoint: Point) {
        const wctx = this.wctx;
        wctx.pushUndoHistoryState();
        const lPoint = wctx.mapCanvasToLogicalCoordinates(cPoint);
        const knotNdx = wctx.addKnot(lPoint);
        wctx.iState.selectedKnotNdx = knotNdx;
        wctx.iState.potentialKnotNdx = knotNdx;
        wctx.iState.knotDragging = false;
        wctx.requestRefresh();
        wctx.fireChangeEvent();
    }

    private updatePotentialKnot(event: PointerEvent) {
        const wctx = this.wctx;
        const cPoint = this.getCanvasCoordinatesFromEvent(event);
        const knotNdx = this.findNearKnot(cPoint, event.pointerType);
        if (wctx.iState.potentialKnotNdx != knotNdx) {
            wctx.iState.potentialKnotNdx = knotNdx;
            wctx.requestRefresh();
        }
    }

    private findNearKnot(cPoint: Point, pointerType: string): number | undefined {
        const wctx = this.wctx;
        const r = wctx.findNearestKnot(cPoint);
        const proximityRange = pointerType == "touch" ? 30 : 15;
        return r && r.distance <= proximityRange ? r.knotNdx : undefined;
    }

    private snapToGrid(lPoint: Point): Point {
        const wctx = this.wctx;
        if (!wctx.eState.gridEnabled || !wctx.eState.snapToGridEnabled) {
            return lPoint;
        }
        return { x: this.snapToGrid2(lPoint.x, true), y: this.snapToGrid2(lPoint.y, false) };
    }

    private snapToGrid2(lPos: number, xy: boolean) {
        const wctx = this.wctx;
        const maxDistance = 5 * wctx.ratio;
        const gp = wctx.getGridParms(xy);
        if (!gp) {
            return lPos;
        }
        const gridSpace = gp.space * gp.span;
        const gridPos = Math.round(lPos / gridSpace) * gridSpace;
        const lDist = Math.abs(lPos - gridPos);
        const cDist = lDist * wctx.getZoomFactor(xy);
        if (cDist > maxDistance) {
            return lPos;
        }
        return gridPos;
    }

    // Returns the coordinates of the first pointer.
    private getCanvasCoordinates(): Point {
        if (this.pointers.size < 1) {
            throw new Error("No active pointers.");
        }
        const event = this.pointers.values().next().value;
        return this.getCanvasCoordinatesFromEvent(event);
    }

    private getCanvasCoordinatesFromEvent(event: MouseEvent): Point {
        const wctx = this.wctx;
        return wctx.mapViewportToCanvasCoordinates({ x: event.clientX, y: event.clientY });
    }

    // Checks whether the resize property of the parent element of the canvas element is "both"
    // and the pointer is in the lower right corner.
    private isPointerInResizeHandle(event: PointerEvent): boolean {
        const wctx = this.wctx;
        const parentElement = wctx.canvas.parentNode;
        if (!(parentElement instanceof HTMLElement)) {
            return false;
        }
        if (getComputedStyle(parentElement).resize != "both") {
            return false;
        }
        const rect = parentElement.getBoundingClientRect();
        const dx = rect.right - event.clientX;
        const dy = rect.bottom - event.clientY;
        const handleSize = 18;
        return dx >= 0 && dx < handleSize && dy >= 0 && dy < handleSize;
    }
}

//--- Keyboard controller ------------------------------------------------------

class KeyboardController {
    private wctx: WidgetContext;

    public constructor(wctx: WidgetContext) {
        this.wctx = wctx;
        wctx.canvas.addEventListener("keydown", this.keyDownEventListener);
    }

    public dispose() {
        const wctx = this.wctx;
        wctx.canvas.removeEventListener("keydown", this.keyDownEventListener);
    }

    private keyDownEventListener = (event: KeyboardEvent) => {
        const keyName = genKeyName(event);
        if (this.processKeyDown(keyName)) {
            event.preventDefault();
        }
    };

    private processKeyDown(keyName: string) {
        const wctx = this.wctx;
        switch (keyName) {
            case "Backspace":
            case "Delete": {
                return wctx.action("deletePoint");
            }
            case "Ctrl+z":
            case "Alt+Backspace": {
                return wctx.action("undo");
            }
            case "Ctrl+y":
            case "Ctrl+Z": {
                return wctx.action("redo");
            }
            case "Escape": {
                wctx.pointerController.processEscKey();
                return true;
            }
            default: {
                return false;
            }
        }
    }
}

function genKeyName(event: KeyboardEvent): string {
    return (event.altKey ? "Alt+" : "") + (event.ctrlKey ? "Ctrl+" : "") + event.key;
}

//--- Internal widget context --------------------------------------------------

interface InteractionState {
    selectedKnotNdx: number | undefined; // index of currently selected knot or undefined
    potentialKnotNdx: number | undefined; // index of potential target knot for mouse click (or undefined)
    knotDragging: boolean; // true if the selected knot is beeing dragged
} // true if the coordinate plane is beeing dragged

interface HistoryState {
    undoStack: Point[][]; // old knot points
    undoStackPos: number;
} // current position within undoStack
// Concept:
// - Only the knots are saved on the undo stack.
// - If undoStackPos == undoStack.length, the current state has changed and is not equal to the last entry.
// - If undoStackPos < undoStack.length, the current state is equal to undoStack[undoStackPos] and
//   the entries > undoStackPos are redo states.

class WidgetContext {
    public widget: Widget;
    public plotter: FunctionPlotter;
    public pointerController: PointerController;
    public kbController: KeyboardController;

    public canvas: HTMLCanvasElement; // the DOM canvas element
    private canvasStyle: CSSStyleDeclaration;
    public eventTarget: EventTarget;
    public isConnected: boolean;
    private animationFramePending: boolean;
    private resizeObserver: ResizeObserver;

    public ratio: number;
    public eState: EditorState; // current editor state
    public initialEState: EditorState; // last set initial editor state
    public iState: InteractionState;
    public hState: HistoryState;

    public constructor(canvas: HTMLCanvasElement, widget: Widget) {
        this.ratio = window.devicePixelRatio || 1;
        this.widget = widget;
        this.canvas = canvas;
        this.canvasStyle = getComputedStyle(canvas);
        this.eventTarget = new EventTarget();
        this.isConnected = false;
        this.animationFramePending = false;
        this.resizeObserver = new ResizeObserver(this.resizeObserverCallback);
        this.setEditorState(<EditorState>{});
    }

    public getHeight(useRatio = false) {
        return this.canvas.height * (useRatio ? this.ratio : 1);
    }

    public getWidth(useRatio = false) {
        return this.canvas.width * (useRatio ? this.ratio : 1);
    }

    public setConnected(connected: boolean) {
        if (connected == this.isConnected) {
            return;
        }
        if (connected) {
            this.plotter = new FunctionPlotter(this);
            this.pointerController = new PointerController(this);
            this.kbController = new KeyboardController(this);
            this.resizeObserver.observe(this.canvas);
        } else {
            this.pointerController.dispose();
            this.kbController.dispose();
            this.resizeObserver.unobserve(this.canvas);
        }
        this.isConnected = connected;
        this.requestRefresh();
    }

    public setEditorState(eState: Partial<EditorState>) {
        this.eState = cloneEditorState(eState);
        this.initialEState = cloneEditorState(eState);
        this.resetInteractionState();
        this.resetHistoryState();
        this.requestRefresh();
    }

    public getEditorState(): EditorState {
        return cloneEditorState(this.eState);
    }

    private resetInteractionState() {
        this.iState = {
            selectedKnotNdx: undefined,
            potentialKnotNdx: undefined,
            knotDragging: false,
        };
    }

    // Resets the context to the initial state.
    public reset() {
        this.setEditorState(this.initialEState);
        return true;
    }

    private resetHistoryState() {
        this.hState = {
            undoStack: [],
            undoStackPos: 0,
        };
    }

    // Must be called immediatelly before the current state (knots) is changed.
    public pushUndoHistoryState() {
        const hState = this.hState;
        hState.undoStack.length = hState.undoStackPos; // get rid of redo entries
        hState.undoStack.push(this.eState.knots.slice()); // push knots to undo stack
        hState.undoStackPos = hState.undoStack.length;
    }

    public canRedo(): boolean {
        const hState = this.hState;
        return !(hState.undoStackPos >= hState.undoStack.length - 1);
    }

    public canUndo(): boolean {
        return this.hState.undoStackPos > 0;
    }

    public canDeleteKnot(): boolean {
        return this.iState.selectedKnotNdx != undefined;
    }

    public undo(): boolean {
        if (!this.canUndo()) {
            // no more undo entries available
            return false;
        }
        const hState = this.hState;
        if (hState.undoStackPos == hState.undoStack.length) {
            hState.undoStack.push(this.eState.knots.slice());
        }
        hState.undoStackPos--;
        this.eState.knots = hState.undoStack[hState.undoStackPos].slice();
        this.resetInteractionState();
        return true;
    }

    public redo(): boolean {
        if (!this.canRedo()) {
            // no more redo entries available
            return false;
        }
        const hState = this.hState;
        hState.undoStackPos++;
        this.eState.knots = hState.undoStack[hState.undoStackPos].slice();
        this.resetInteractionState();
        return true;
    }

    public action(name) {
        switch (name) {
            case "deletePoint":
                if (this.canDeleteKnot()) {
                    this.iState.knotDragging = false;
                    this.pushUndoHistoryState();
                    this.deleteKnot(this.iState.selectedKnotNdx);
                    this.requestRefresh();
                    this.fireChangeEvent();
                }
                return true;
            case "undo":
                if (this.undo()) {
                    this.requestRefresh();
                    this.fireChangeEvent();
                }
                return true;
            case "redo":
                if (this.redo()) {
                    this.requestRefresh();
                    this.fireChangeEvent();
                }
                return true;
            case "reset":
                this.reset();
                this.requestRefresh();
                this.fireChangeEvent();

                return true;
            case "fireChangeEvent":
                this.fireChangeEvent();
                return true;
            default:
                return false;
        }
    }

    public mapLogicalToCanvasXCoordinate(lx: number): number {
        return ((lx - this.eState.xMin) * this.getWidth()) / (this.eState.xMax - this.eState.xMin);
    }

    public mapLogicalToCanvasYCoordinate(ly: number): number {
        return this.getHeight() - ((ly - this.eState.yMin) * this.getHeight()) / (this.eState.yMax - this.eState.yMin);
    }

    public mapLogicalToCanvasCoordinates(lPoint: Point): Point {
        return { x: this.mapLogicalToCanvasXCoordinate(lPoint.x), y: this.mapLogicalToCanvasYCoordinate(lPoint.y) };
    }

    public mapCanvasToLogicalXCoordinate(cx: number): number {
        return this.eState.xMin + (cx * (this.eState.xMax - this.eState.xMin)) / this.getWidth();
    }

    public mapCanvasToLogicalYCoordinate(cy: number): number {
        return this.eState.yMin + ((this.getHeight() - cy) * (this.eState.yMax - this.eState.yMin)) / this.getHeight();
    }

    public mapCanvasToLogicalCoordinates(cPoint: Point): Point {
        return { x: this.mapCanvasToLogicalXCoordinate(cPoint.x), y: this.mapCanvasToLogicalYCoordinate(cPoint.y) };
    }

    public mapViewportToCanvasCoordinates(vPoint: Point): Point {
        const canvasStyle = this.canvasStyle;
        const rect = this.canvas.getBoundingClientRect();
        const paddingLeft = getPx(canvasStyle.paddingLeft);
        const paddingRight = getPx(canvasStyle.paddingRight);
        const paddingTop = getPx(canvasStyle.paddingTop);
        const paddingBottom = getPx(canvasStyle.paddingBottom);
        const borderLeft = getPx(canvasStyle.borderLeftWidth);
        const borderTop = getPx(canvasStyle.borderTopWidth);
        const width = this.canvas.clientWidth - paddingLeft - paddingRight;
        const height = this.canvas.clientHeight - paddingTop - paddingBottom;
        const x1 = vPoint.x - rect.left - borderLeft - paddingLeft;
        const y1 = vPoint.y - rect.top - borderTop - paddingTop;
        const x = (x1 / width) * this.getWidth();
        const y = (y1 / height) * this.getHeight();
        return { x, y };
        function getPx(s: string): number {
            return s ? parseFloat(s) : 0;
        }
    } // ignores the "px" suffix

    public getZoomFactor(xy: boolean): number {
        const eState = this.eState;
        return xy ? this.getWidth() / (eState.xMax - eState.xMin) : this.getHeight() / (eState.yMax - eState.yMin);
    }

    public deleteKnot(knotNdx: number) {
        const isFirst = knotNdx == 0;
        const isLast = knotNdx == this.eState.knots.length - 1;
        if (isFirst || isLast) {
            return;
        }
        // Make a copy of the knots
        const knots = clone(this.eState.knots);
        const oldKnots = knots.slice();
        knots.splice(knotNdx, 1);
        this.eState.knots = knots;
        this.fixUpKnotIndexes(oldKnots);
    }

    public moveKnot(knotNdx: number, newPosition: Point) {
        const { rangeValues, knots } = this.eState;
        const isFirst = knotNdx == 0;
        const isLast = knotNdx == knots.length - 1;
        const closest = 0.1;

        const xMin = rangeValues.xMin;
        const xMax = rangeValues.xMax;
        const closestXMin = xMin + closest;
        const closestXMax = xMax - closest;

        const yMin = rangeValues.yMin;
        const yMax = rangeValues.yMax;
        const closestYMin = yMin + closest;
        const closestYMax = yMax - closest;

        if (isFirst) {
            newPosition.x = xMin;
        } else if (isLast) {
            newPosition.x = xMax;
        } else {
            // Ensure that the knot is not moved outside the range of the neighboring knots.
            newPosition.x = Math.min(Math.max(newPosition.x, closestXMin), closestXMax);
        }

        newPosition.y = Math.min(Math.max(newPosition.y, closestYMin), closestYMax);

        const cloned = clone(this.eState.knots);
        cloned[knotNdx] = newPosition;

        this.eState.knots = cloned;
        this.revampKnots();
    }

    // Returns the index of the newly inserted knot.
    public addKnot(newKnot: Point): number {
        const knot = PointUtils.clone(newKnot);
        this.eState.knots = [...this.eState.knots, knot];
        this.revampKnots();
        const knotNdx = PointUtils.findPoint(this.eState.knots, knot);
        // (warning: This only works as long as makeXValsStrictMonotonic() modified the knots in-place and
        // does not construct new knot point objects)
        if (knotNdx == undefined) {
            throw new Error("Program logic error.");
        }
        return knotNdx;
    }

    public replaceKnots(newKnots: Point[]) {
        this.eState.knots = newKnots;
        this.resetInteractionState();
        this.revampKnots();
    }

    private revampKnots() {
        this.sortKnots();
        PointUtils.makeXValsStrictMonotonic(this.eState.knots);
    }

    private sortKnots() {
        const oldKnots = this.eState.knots.slice();
        this.eState.knots.sort(function (p1: Point, p2: Point) {
            return p1.x != p2.x ? p1.x - p2.x : p1.y - p2.y;
        });
        this.fixUpKnotIndexes(oldKnots);
    }

    private fixUpKnotIndexes(oldKnots: Point[]) {
        this.iState.selectedKnotNdx = PointUtils.mapPointIndex(
            oldKnots,
            this.eState.knots,
            this.iState.selectedKnotNdx,
        );
        this.iState.potentialKnotNdx = PointUtils.mapPointIndex(
            oldKnots,
            this.eState.knots,
            this.iState.potentialKnotNdx,
        );
        this.iState.knotDragging = this.iState.knotDragging && this.iState.selectedKnotNdx != undefined;
    }

    // Returns the index and distance of the nearest knot or undefined.
    public findNearestKnot(cPoint: Point): { knotNdx: number; distance: number } | undefined {
        const knots = this.eState.knots;
        let minDist: number | undefined = undefined;
        let nearestKnotNdx: number | undefined = undefined;
        for (let i = 0; i < knots.length; i++) {
            const lKnot = knots[i];
            const cKnot = this.mapLogicalToCanvasCoordinates(lKnot);
            const d = PointUtils.computeDistance(cKnot, cPoint);
            if (minDist == undefined || d < minDist) {
                nearestKnotNdx = i;
                minDist = d;
            }
        }
        return nearestKnotNdx != undefined ? { knotNdx: nearestKnotNdx, distance: minDist! } : undefined;
    }

    public getKnotCoordinateString() {
        return PointUtils.encodeCoordinateList(this.eState.knots);
    }

    public async setKnotCoordinateString(s: string) {
        let newKnots: Point[];
        try {
            newKnots = PointUtils.decodeCoordinateList(s);
        } catch (e) {
            throw new Error("Knot coordinates could not be decoded. " + e);
        }
        this.pushUndoHistoryState();
        this.replaceKnots(newKnots);
        this.requestRefresh();
        this.fireChangeEvent();
    }

    public getGridParms(xy: boolean): { space: number; span: number; pos: number; decPow: number } | undefined {
        const minSpaceC = xy ? 66 : 50; // minimum space between grid lines in pixel
        const edge = xy ? this.eState.xMin : this.eState.yMin; // canvas edge coordinate
        const minSpaceL = minSpaceC / this.getZoomFactor(xy); // minimum space between grid lines in logical coordinate units
        const decPow = Math.ceil(Math.log(minSpaceL / 5) / Math.LN10); // decimal power of grid line space
        const edgeDecPow = edge == 0 ? -99 : Math.log(Math.abs(edge)) / Math.LN10; // decimal power of canvas coordinates
        if (edgeDecPow - decPow > 10) {
            return undefined;
        } // numerically instable
        const space = Math.pow(10, decPow); // grid line space (distance) in logical units
        const f = minSpaceL / space; // minimum for span factor
        const span = f > 2.001 ? 5 : f > 1.001 ? 2 : 1; // span factor for visible grid lines
        const p1 = Math.ceil(edge / space);
        const pos = span * Math.ceil(p1 / span); // position of first grid line in grid space units
        return { space, span, pos, decPow };
    }

    public createInterpolationFunction(): UniFunction {
        return createInterpolationFunction({
            points: this.eState.knots,
            method: this.eState.interpolationMethod,
        });
    }

    public requestRefresh() {
        if (this.animationFramePending || !this.isConnected) {
            return;
        }
        requestAnimationFrame(this.animationFrameHandler);
        this.animationFramePending = true;
    }

    private animationFrameHandler = () => {
        this.animationFramePending = false;
        if (!this.isConnected) {
            return;
        }
        this.refresh();
    };

    // Re-paints the canvas and updates the cursor.
    private refresh() {
        this.plotter.paint();
        this.updateCanvasCursorStyle();
    }

    private updateCanvasCursorStyle() {
        const { knotDragging, potentialKnotNdx } = this.iState;
        const style = knotDragging ? "grabbing" : potentialKnotNdx ? "grab" : "auto";
        this.canvas.style.cursor = style;
    }

    public fireChangeEvent() {
        const { interpolationMethod, knots } = this.eState;
        const coordinateString = PointUtils.encodeCoordinateList(knots);
        const knotsLength = knots.length;
        this.fireEvent("change", { knotsLength, interpolationMethod, knots, coordinateString });
    }

    public fireEvent(name: string, detail: any) {
        const event = new CustomEvent(name, {
            detail,
        });
        nextTick(() => {
            this.eventTarget.dispatchEvent(event);
        });
    }

    private resizeObserverCallback = (entries: ResizeObserverEntry[]) => {
        const box = entries[0].contentBoxSize[0];
        const width = box.inlineSize;
        const height = box.blockSize;
        this.plotter.resize(width, height);
    };
}

//--- Editor state -------------------------------------------------------------

export { InterpolationMethod };

// Function curve editor state.
export interface EditorState {
    knots: Point[]; // knot points for the interpolation
    xMin: number; // minimum x coordinate of the function graph area
    xMax: number; // maximum x coordinate of the function graph area
    yMin: number; // minimum y coordinate of the function graph area
    yMax: number; // maximum y coordinate of the function graph area
    relevantXMin?: number; // lower edge of relevant X range or undefined
    relevantXMax?: number; // upper edge of relevant X range or undefined
    gridEnabled: boolean; // true to draw a coordinate grid
    snapToGridEnabled: boolean; // true to enable snap to grid behavior
    interpolationMethod: InterpolationMethod; // optimal interpolation method
    focusShield: boolean; // true to ignore mouse wheel events without focus
    curveColor: string; // CSS color for the curve
    defaultKnotColor: string; // default CSS color of knots
    selectedKnotColor: string; // CSS color of selected knots
    activeKnotColor: string; // default CSS color of active knot
    lineColor: string; // CSS color for lines
    centerLineColor: string; // CSS color for center line
    background: string; // CSS color for background
    rangeValues: {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
    };
} // CSS color for out of domain background

// Clones and adds missing fields.
function cloneEditorState(eState: Partial<EditorState>): EditorState {
    return {
        knots: (eState.knots ?? []).slice(),
        xMin: eState.xMin ?? 0,
        xMax: eState.xMax ?? 10,
        yMin: eState.yMin ?? -2,
        yMax: eState.yMax ?? 2,
        relevantXMin: eState.relevantXMin,
        relevantXMax: eState.relevantXMax,
        gridEnabled: eState.gridEnabled ?? true,
        snapToGridEnabled: eState.snapToGridEnabled ?? true,
        rangeValues: eState.rangeValues ?? { xMin: 0, xMax: 10, yMin: -2, yMax: 2 },
        interpolationMethod: eState.interpolationMethod ?? "akima",
        focusShield: eState.focusShield ?? false,
        curveColor: eState.curveColor ?? "#00ADEE",
        defaultKnotColor: eState.defaultKnotColor ?? "#ff8700",
        selectedKnotColor: eState.selectedKnotColor ?? "#ff460d",
        activeKnotColor: eState.activeKnotColor ?? "#fda23d",
        lineColor: eState.lineColor ?? "#323232",
        centerLineColor: eState.centerLineColor ?? "#555",
        background: eState.background ?? "#222222",
    };
}

//--- Widget -------------------------------------------------------------------

export class Widget {
    private wctx: WidgetContext;

    public constructor(canvas: HTMLCanvasElement, connected = true) {
        this.wctx = new WidgetContext(canvas, this);
        if (connected) {
            this.setConnected(true);
        }
    }

    // Sets a new EventTarget for this widget.
    // The web component calls this method to direct the events out of the shadow DOM.
    public setEventTarget(eventTarget: EventTarget) {
        this.wctx.eventTarget = eventTarget;
    }

    // Called after the widget is inserted into or removed from the DOM.
    // It installs or removes the internal event listeners for mouse, touch and keyboard.
    // When the widget is connected, it also adjusts the resolution of the backing bitmap
    // and draws the widget.
    public setConnected(connected: boolean) {
        this.wctx.setConnected(connected);
    }

    // Registers an event listener.
    // Currently only the "change" event is supported.
    // The "change" event is fired after the user has changed the edited function
    // so that the function values are different. It is not fired when only the display
    // of the function has changed, e.g. by zooming or moving the plane.
    public addEventListener(type: string, listener: EventListener) {
        this.wctx.eventTarget.addEventListener(type, listener);
    }

    // Deregisters an event listener.
    public removeEventListener(type: string, listener: EventListener) {
        this.wctx.eventTarget.removeEventListener(type, listener);
    }

    // Returns the current state of the function curve editor.
    public getEditorState(): EditorState {
        return this.wctx.getEditorState();
    }

    // Updates the current state of the function curve editor.
    public setEditorState(eState: Partial<EditorState>) {
        const wctx = this.wctx;
        wctx.setEditorState(eState);
    }

    // Returns the current graph function.
    // The returned JavaScript function maps each x value to an y value.
    public getFunction(): (x: number) => number {
        return this.wctx.createInterpolationFunction();
    }

    public getKnotCoordinateString(): string {
        return this.wctx.getKnotCoordinateString();
    }

    public setKnotCoordinateString(s: string) {
        return this.wctx.setKnotCoordinateString(s);
    }

    public canUndo(): boolean {
        return this.wctx.canUndo();
    }

    public canRedo(): boolean {
        return this.wctx.canRedo();
    }

    public action(name: string) {
        return this.wctx.action(name);
    }
}

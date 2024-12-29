export { default as ClipPathOutput } from "./ClipPathOutput";
export { default as CurveEditor } from "./CurveEditor";
export { default as RangeInput } from "../../Components/RangeInput";
export { default as Dropdown } from "../../Components/Dropdown";
import editorStyles from "./style.module.css";
import globalStyles from "../../style.module.css";
export { calculate } from "./Utils";

const style = { ...globalStyles, ...editorStyles };

export { style };

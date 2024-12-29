export { default as PreviewText } from "./PreviewText";
export { default as readFont } from "./ReadFont";
export { default as RangeInput } from "../../Components/RangeInput";
export { default as Dropdown } from "../../Components/Dropdown";
export { default as FontWeight } from "./FontWeight";
export { default as FontFeatures } from "./FontFeatures";
import editorStyles from "./style.module.css";
import buttonStyles from "./Button.module.css";
import globalStyles from "../../style.module.css";

const style = { ...globalStyles, ...editorStyles, ...buttonStyles };

export { style };

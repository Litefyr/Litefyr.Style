import React, { useMemo, useState, useRef, useEffect } from "react";
import { calcPath, convertNesting } from "./Utils";
import { style } from "./index";
import clsx from "clsx";

export default function ClipPathOutput({
    state,
    label,
    topColor,
    bottomColor,
    asyncPath,
    nesting,
    reverseStacking,
    topSpacing = 0,
    bottomSpacing = 0,
}) {
    const topConfig = state?.topConfig;
    const bottomConfig = state?.bottomConfig;

    const [width, setWidth] = useState(0);
    const [styles, setStyles] = useState(null);
    const container = useRef();

    let calls = 0;
    function setWidthFromContainer() {
        if (container.current && container.current.offsetWidth) {
            setWidth(container.current.offsetWidth);
        } else if (calls < 1000) {
            calls++;
            setTimeout(setWidthFromContainer, 10);
        }
    }

    useEffect(() => {
        setWidthFromContainer();
        window.addEventListener("resize", setWidthFromContainer);

        return () => {
            window.removeEventListener("resize", setWidthFromContainer);
        };
    }, []);

    useMemo(() => {
        if (!width) {
            setStyles(null);
            return;
        }

        const clipPathTop = calcPath({
            config: topConfig,
            top: true,
            containerWidth: width,
            spacing: topSpacing,
        });
        const clipPathBottom = calcPath({
            config: asyncPath ? bottomConfig : topConfig,
            top: false,
            containerWidth: width,
            spacing: bottomSpacing,
        });

        if (!clipPathTop || !clipPathBottom) {
            setStyles(null);
            return;
        }

        setStyles({
            clipPath: `polygon(${clipPathTop.clipPath}, ${clipPathBottom.clipPath})`,
            "--padding-top": clipPathTop.padding,
            "--padding-bottom": clipPathBottom.padding,
        });
    }, [width, topConfig, bottomConfig, asyncPath, topSpacing, bottomSpacing]);

    return (
        <div ref={container} className={style.clipPathOutput} style={{ "--nesting": convertNesting(nesting) }}>
            {styles && (
                <>
                    <div
                        className={clsx(style.topClipPath, nesting && reverseStacking && style.reverseStacking)}
                        style={{ backgroundColor: topColor, ...styles }}
                    >
                        {label && <h1 className={style.chessboard}>{label}</h1>}
                    </div>
                    <div className={style.bottomClipPath} style={{ backgroundColor: bottomColor, ...styles }}></div>
                </>
            )}
        </div>
    );
}

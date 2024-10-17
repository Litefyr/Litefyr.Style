import esbuild from "esbuild";
import extensibilityMap from "@neos-project/neos-ui-extensibility/extensibilityMap.json" assert { type: "json" };
import { cssModules } from "esbuild-plugin-lightningcss-modules";

const options = {
    logLevel: "info",
    bundle: true,
    minify: true,
    sourcemap: true,
    target: "es2020",
    format: "iife",
    legalComments: "none",
    entryPoints: { Plugin: "Resources/Private/Editors/manifest.js" },
    loader: {
        ".js": "tsx",
    },
    outdir: "Resources/Public/Editors",
    external: [
        "/_Resources/Static/Packages/Litefyr.Style/Editors/Unbrotli.js",
        "/_Resources/Static/Packages/Litefyr.Style/Editors/FontLib.js",
        "/_Resources/Static/Packages/Litefyr.Style/Editors/Inflate.js",
    ],
    alias: extensibilityMap,
    plugins: [
        cssModules({
            targets: {
                chrome: 80, // aligns somewhat to es2020
            },
        }),
    ],
};

async function watch() {
    const context = await esbuild.context(options);
    await context.watch();
}

if (process.argv.includes("--watch")) {
    watch();
} else {
    esbuild.build(options);
}

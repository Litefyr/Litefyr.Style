import manifest from "@neos-project/neos-ui-extensibility";

import { ClipPath, ClipPathWrap } from "./ClipPath";
import { Font, FontWrap } from "./Font";

manifest("Litespeed.Style:Editors", {}, (globalRegistry) => {
    const inspectorRegistry = globalRegistry.get("inspector");
    const editorsRegistry = inspectorRegistry.get("editors");
    const secondaryEditorsRegistry = inspectorRegistry.get("secondaryEditors");

    editorsRegistry.set("Litespeed.Style/ClipPathEditor", {
        component: ClipPath,
    });

    secondaryEditorsRegistry.set("Litespeed.Style/ClipPathEditorWrap", {
        component: ClipPathWrap,
    });

    editorsRegistry.set("Litespeed.Style/FontEditor", {
        component: Font,
    });

    secondaryEditorsRegistry.set("Litespeed.Style/FontEditorWrap", {
        component: FontWrap,
    });
});

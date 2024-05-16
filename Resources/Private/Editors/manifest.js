import manifest from "@neos-project/neos-ui-extensibility";

import { ClipPath, ClipPathWrap } from "./ClipPath";
import { Font, FontWrap } from "./Font";

manifest("Litefyr.Style:Editors", {}, (globalRegistry) => {
    const inspectorRegistry = globalRegistry.get("inspector");
    const editorsRegistry = inspectorRegistry.get("editors");
    const secondaryEditorsRegistry = inspectorRegistry.get("secondaryEditors");

    editorsRegistry.set("Litefyr.Style/ClipPathEditor", {
        component: ClipPath,
    });

    secondaryEditorsRegistry.set("Litefyr.Style/ClipPathEditorWrap", {
        component: ClipPathWrap,
    });

    editorsRegistry.set("Litefyr.Style/FontEditor", {
        component: Font,
    });

    secondaryEditorsRegistry.set("Litefyr.Style/FontEditorWrap", {
        component: FontWrap,
    });
});

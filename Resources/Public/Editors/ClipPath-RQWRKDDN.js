import{a as b}from"./chunk-VQS6HJO4.js";import{b as C,d as n}from"./chunk-CGUFC6VM.js";import{a as z,b as f}from"./chunk-42WQAUJ2.js";import{b as d,f as x,g as w}from"./chunk-AXCDKCXT.js";var t=d(x(),1),O=d(w(),1),c=d(z(),1);import V from"/_Resources/Static/Packages/Carbon.Editor.Styling/Dialog.js";var S={allowEmpty:!0,disabled:!1,topColor:"#00adee",bottomColor:"#00a338",interpolationMethods:{cubic:!0,akima:!0,linear:!0,nearestNeighbor:!0,loess:!0}},j=(0,t.lazy)(()=>import("./Panel-MUV2ADXZ.js"));function B({id:r,value:o,commit:l,highlight:a,labels:e,options:m}){let[h,s]=(0,t.useState)(!1),[i,k]=(0,t.useState)(o),[u,F]=(0,t.useState)(JSON.stringify(o)),{allowEmpty:E,disabled:M,topColor:g,bottomColor:y}={...S,...m},N={...S.interpolationMethods,...m?.interpolationMethods||{}},p=[];Object.entries(N).forEach(([J,L])=>{L&&p.push(J)}),p.length||p.push("cubic");let P=(0,t.useCallback)(()=>{s(!1),(!o.css||JSON.stringify(i)!==u)&&l(i)},[i,o]),A=(0,t.useCallback)(()=>{s(!1),o.css&&l({...o,css:null})},[i]);return t.default.createElement("div",{className:f(n.primaryWrapper,M&&n.disabled)},t.default.createElement("button",{type:"button",className:f(n.previewOutput,n.chessboard,a&&n.highlight),onClick:()=>s(!0),title:e.edit},!!o.css&&t.default.createElement(C,{state:o,topColor:g,bottomColor:y,asyncPath:o.asyncPath,nesting:o.nesting,reverseStacking:o.reverseStacking,topSpacing:o?.topSpacing,bottomSpacing:o?.bottomSpacing}),t.default.createElement(c.Icon,{icon:"pencil",size:"5x",mask:["fas","circle"],transform:"shrink-8"})),t.default.createElement(V,{open:h,setOpen:s,onCancel:()=>s(!1),onApply:P,disabledApply:o.css&&JSON.stringify(i)===u,footer:E&&t.default.createElement(c.Button,{onClick:A,hoverStyle:"error"},e.reset),fullHeight:!0,fullWidth:!0},h&&t.default.createElement(t.Suspense,{fallback:t.default.createElement(b,{isLoading:!0})},t.default.createElement(j,{id:r,onChange:k,value:o,topColor:g,bottomColor:y,interpolationMethods:p,contentLabel:e.content}))))}var D=(0,O.neos)(r=>{let o=r.get("i18n"),l=r.get("inspector").get("secondaryEditors"),a={};return["edit","reset","content"].forEach(e=>{a[e]=o.translate(`Litefyr.Style:NodeTypes.Mixin.Visuals.ClipPath:editor.${e}`)}),{labels:a,secondaryEditorsRegistry:l}}),$=D(B);export{$ as default};
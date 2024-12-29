import{a as te,b as q,d as wt,e as it,f as yt,g as kt}from"./chunk-42WQAUJ2.js";import{b as _,c as g,f as It,g as $t}from"./chunk-AXCDKCXT.js";function W(o,t,e){let n=st(o,e);return n<0&&(n=-n-2),n=Math.max(0,Math.min(n,t.length-1)),ee(t[n],e-o[n])}function ee(o,t){let e=o.length;if(e==0)return 0;let n=o[e-1];for(let i=e-2;i>=0;i--)n=t*n+o[i];return n}function H(o){let t=o.length;for(;t>1&&o[t-1]==0;)t--;return t==o.length?o:o.subarray(0,t)}function St(o){for(let t=0;t<o.length;t++){if(!isFinite(o[t]))throw new Error("Non-finite number detected.");if(t>0&&o[t]<o[t-1])throw new Error("Number sequence is not monotonically increasing.")}}function F(o){for(let t=0;t<o.length;t++){if(!isFinite(o[t]))throw new Error("Non-finite number detected.");if(t>0&&o[t]<=o[t-1])throw new Error("Number sequence is not strictly increasing.")}}function rt(o){for(let t=0;t<o.length;t++)if(!isFinite(o[t]))throw new Error("Non-finite number detected.")}function st(o,t){let e=0,n=o.length-1;for(;e<=n;){let i=e+n>>>1,r=o[i];if(r<t)e=i+1;else if(r>t)n=i-1;else{if(r==t)return i;throw new Error("Invalid number encountered in binary search.")}}return-(e+1)}function Mt(o){let t=o.length;if(t<1)return NaN;let e=new Float64Array(o);e.sort();let n=Math.floor(t/2);return t%2==0?(e[n-1]+e[n])/2:e[n]}var Gt=Number.EPSILON;function at(o,t){let e=Xt(o,t),n=Float64Array.from(o);return i=>W(n,e,i)}function Xt(o,t){if(o.length!=t.length)throw new Error("Dimension mismatch for xVals and yVals.");if(o.length<5)throw new Error("Number of points is too small.");F(o);let e=o.length-1,n=new Float64Array(e),i=new Float64Array(e);for(let s=0;s<e;s++)n[s]=(t[s+1]-t[s])/(o[s+1]-o[s]);for(let s=1;s<e;s++)i[s]=Math.abs(n[s]-n[s-1]);let r=new Float64Array(e+1);for(let s=2;s<e-1;s++){let c=i[s+1],l=i[s-1];if(Math.abs(c)<Gt&&Math.abs(l)<Gt){let d=o[s],a=o[s+1],u=o[s-1];r[s]=((a-d)*n[s-1]+(d-u)*n[s])/(a-u)}else r[s]=(c*n[s-1]+l*n[s])/(c+l)}return r[0]=U(o,t,0,0,1,2),r[1]=U(o,t,1,0,1,2),r[e-1]=U(o,t,e-1,e-2,e-1,e),r[e]=U(o,t,e,e-2,e-1,e),ne(o,t,r)}function U(o,t,e,n,i,r){let s=t[n],c=t[i],l=t[r],d=o[e]-o[n],a=o[i]-o[n],u=o[r]-o[n],b=(l-s-u/a*(c-s))/(u*u-a*u),m=(c-s-b*a*a)/a;return 2*b*d+m}function ne(o,t,e){if(o.length!=t.length||o.length!=e.length)throw new Error("Dimension mismatch");if(o.length<2)throw new Error("Not enough points.");let n=o.length-1,i=new Array(n);for(let r=0;r<n;r++){let s=o[r+1]-o[r],c=s*s,l=t[r],d=t[r+1],a=e[r],u=e[r+1],b=new Float64Array(4);b[0]=l,b[1]=e[r],b[2]=(3*(d-l)/s-2*a-u)/s,b[3]=(2*(l-d)/s+a+u)/c,i[r]=H(b)}return i}function ct(o,t){let e=At(o,t),n=Float64Array.from(o);return i=>W(n,e,i)}function At(o,t){if(o.length!=t.length)throw new Error("Dimension mismatch.");if(o.length<3)throw new Error("Number of points is too small.");F(o);let e=o.length-1,n=new Float64Array(e);for(let a=0;a<e;a++)n[a]=o[a+1]-o[a];let i=new Float64Array(e),r=new Float64Array(e+1);i[0]=0,r[0]=0;for(let a=1;a<e;a++){let u=2*(o[a+1]-o[a-1])-n[a-1]*i[a-1];i[a]=n[a]/u,r[a]=(3*(t[a+1]*n[a-1]-t[a]*(o[a+1]-o[a-1])+t[a-1]*n[a])/(n[a-1]*n[a])-n[a-1]*r[a-1])/u}let s=new Float64Array(e),c=new Float64Array(e+1),l=new Float64Array(e);r[e]=0,c[e]=0;for(let a=e-1;a>=0;a--){let u=n[a],b=t[a+1]-t[a];c[a]=r[a]-i[a]*c[a+1],s[a]=b/u-u*(c[a+1]+2*c[a])/3,l[a]=(c[a+1]-c[a])/(3*u)}let d=new Array(e);for(let a=0;a<e;a++){let u=new Float64Array(4);u[0]=t[a],u[1]=s[a],u[2]=c[a],u[3]=l[a],d[a]=H(u)}return d}function lt(o,t){let e=Pt(o,t),n=Float64Array.from(o);return i=>W(n,e,i)}function Pt(o,t){if(o.length!=t.length)throw new Error("Dimension mismatch.");if(o.length<2)throw new Error("Number of points is too small.");F(o);let e=o.length-1,n=new Array(e);for(let i=0;i<e;i++){let r=o[i+1]-o[i],c=(t[i+1]-t[i])/r,l=new Float64Array(2);l[0]=t[i],l[1]=c,n[i]=H(l)}return n}function ut(o,t){let e=Float64Array.from(o),n=Float64Array.from(t),i=e.length;if(i!=n.length)throw new Error("Dimension mismatch for xVals and yVals.");return i==0?function(r){return NaN}:i==1?function(r){return n[0]}:(F(e),function(r){let s=st(e,r);if(s>=0)return n[s];if(s=-s-1,s==0)return n[0];if(s>=i)return n[i-1];let c=r-e[s-1],l=e[s]-e[s-1];return c+c<l?n[s-1]:n[s]})}function dt(o){let{interpolationMethod:t="akima",minXDistance:e=ie(o.xVals),diagInfo:n}=o,i=re(o),r=oe(o.xVals,i,e),s=Et(o.xVals,r),c=Et(i,r);return n&&(n.fitYVals=i,n.knotFilter=r,n.knotXVals=s,n.knotYVals=c),V(t,s,c)}function oe(o,t,e){let n=o.length,i=Array(n),r=-1/0;for(let s=0;s<n;s++){let c=o[s],l=t[s];c-r>=e&&!isNaN(l)?(i[s]=!0,r=c):i[s]=!1}return i}function Et(o,t){let e=o.length,n=new Float64Array(e),i=0;for(let r=0;r<e;r++)t[r]&&(n[i++]=o[r]);return n.subarray(0,i)}function ie(o){let t=o.length;if(t==0)return NaN;let e=o[t-1]-o[0];return e==0?1:e/100}function re(o){let{xVals:t,yVals:e,weights:n,bandwidthFraction:i=.3,robustnessIters:r=2,accuracy:s=1e-12,outlierDistanceFactor:c=6,diagInfo:l}=o;St(t),rt(e),n&&rt(n);let d=t.length;if(e.length!=d||n&&n.length!=d)throw new Error("Dimension mismatch.");if(l&&(l.robustnessIters=0,l.secondLastMedianResidual=void 0,l.lastMedianResidual=void 0,l.robustnessWeights=void 0),d<=2)return Float64Array.from(e);let a;for(let u=0;u<=r;u++){let b;if(u>0){let C=he(a,e),v=Mt(C);if(v<s){l&&(l.lastMedianResidual=v);break}let x=v*c;b=ue(C,x),l&&(l.robustnessIters=u,l.secondLastMedianResidual=v,l.robustnessWeights=b)}let m=de(n,b);a=se(t,e,m,i,s,u)}return a}function se(o,t,e,n,i,r){let s=o.length,c=e?pe(e):s;if(c<2)throw new Error(`Not enough relevant points in iteration ${r}.`);let l=Math.max(2,Math.min(c,Math.round(c*n))),d=ce(e,l,s),a=new Float64Array(s);for(let u=0;u<s;u++){let b=o[u];le(d,b,o,e),a[u]=ae(o,t,e,b,d.iLeft,d.iRight,i)}return a}function ae(o,t,e,n,i,r,s){let c=Math.max(n-o[i],o[r]-n)*1.001;if(c<0)throw new Error("Inconsistent bandwidth parameters.");c==0&&(c=1);let l=0,d=0,a=0,u=0,b=0;for(let P=i;P<=r;++P){let Y=o[P],N=t[P],f=Math.abs(Y-n),et=e?e[P]:1,R=ge(f/c),K=et*R,O=Y*K;l+=K,d+=O,a+=Y*O,u+=N*K,b+=N*O}if(l<1e-12)return NaN;let m=d/l,C=u/l,v=b/l,k=a/l-m*m,G;return Math.abs(k)<Math.pow(s,2)?G=0:G=(v-m*C)/k,C+G*n-G*m}function ce(o,t,e){let n=Q(o,0);if(n>=e)throw new Error("Initial bandwidth start point not found.");let i=n;for(let r=0;r<t-1;r++)if(i=Q(o,i+1),i>=e)throw new Error("Initial bandwidth end point not found.");return{iLeft:n,iRight:i}}function le(o,t,e,n){let i=e.length;for(;;){let r=Q(n,o.iRight+1);if(r>=i||e[r]-t>=t-e[o.iLeft])return;o.iLeft=Q(n,o.iLeft+1),o.iRight=r}}function ue(o,t){let e=o.length,n=new Float64Array(e);for(let i=0;i<e;i++)n[i]=be(o[i]/t);return n}function de(o,t){if(!o||!t)return o??t;let e=o.length,n=new Float64Array(e);for(let i=0;i<e;i++)n[i]=o[i]*t[i];return n}function Q(o,t){if(!o)return t;let e=o.length,n=t;for(;n<e&&o[n]==0;)n++;return n}function pe(o){let t=0;for(let e=0;e<o.length;e++)o[e]!=0&&t++;return t}function he(o,t){let e=o.length,n=new Float64Array(e);for(let i=0;i<e;i++)n[i]=Math.abs(o[i]-t[i]);return n}function ge(o){let t=Math.abs(o);if(t>=1)return 0;let e=1-t*t*t;return e*e*e}function be(o){let t=Math.abs(o);if(t>=1)return 0;let e=1-t*t;return e*e}function me(o,t,e){switch(o){case"akima":return at(t,e);case"cubic":return ct(t,e);case"linear":return lt(t,e);case"nearestNeighbor":return ut(t,e);case"loess":return dt({xVals:t,yVals:e});default:throw new Error(`Unknown interpolation method "${o}".`)}}function V(o,t,e){let n=t.length,i=o;if(n<5&&i=="akima"&&(i="cubic"),n<3&&i=="cubic"&&(i="linear"),n<2){let r=n==1?e[0]:0;return s=>r}return me(i,t,e)}var pt=o=>o?o/-100:0,Ot=({interpolationMethod:o,points:t})=>({interpolationMethod:o,points:t});function fe(o){let t=!!o?.asyncPath,e=o?.topSpacing||0,n=o?.bottomSpacing||0,i=z({config:o.top,top:!0,spacing:e}),r=z({config:t?o.bottom:o.top,top:!1,spacing:n}),s=Ot(o.top),c=Ot(o.bottom),l=o?.nesting||0,d=!!o?.reverseStacking,a={nesting:pt(l),reverseStacking:l?d:!1,raw:{top:i?.clipPath,bottom:r?.clipPath},height:{top:i?.padding,bottom:r?.padding}};return{asyncPath:t,nesting:l,reverseStacking:d,topConfig:s,bottomConfig:c,css:a,topSpacing:e,bottomSpacing:n}}function z({config:o,top:t,spacing:e=0,containerWidth:n=null}){let i=o?.interpolationMethod,r=o?.points;if(!i||!r||r.length<2)return null;let s=r.length<3&&i!=="nearestNeighbor"?"linear":i;return ye({points:r,method:s,top:t,containerWidth:n,spacing:e})}var Ce=Promise.resolve(),Bt=o=>o.reduce((t,{y:e})=>t<e?e:t,0),ve=o=>o.reduce((t,{y:e})=>t<e?t:e,1/0);function xe(o){let t=Bt(o);return o.map(({x:e,y:n})=>({x:e,y:Math.abs(n-t)}))}function Ie(o){let t=ve(o);return o.map(({x:e,y:n})=>({x:e,y:n-t})).reverse()}function we({points:o,unit:t,multiplier:e,top:n=!1}){let i=n?"":"calc(100% - ",r=n?"":")";return o.map(({x:s,y:c})=>`${s}% ${i}${c*e}${t}${r}`).join(",")}function ye({points:o,method:t,top:e,containerWidth:n=null,numberOfPoints:i=100,spacing:r}){let s=n?"px":"vw",c=n?Math.round(n/100):1;if(t==="linear")return Lt({points:o,unit:s,multiplier:c,top:e,spacing:r});t==="nearestNeighbor"&&(i=1e4);let l=o.length,d=o[0].x,a=o[l-1].x,u=(a-d)/i,b=[],m=gt({points:o,method:t});for(let C=d;C<=a;C+=u){let v=m(C);b.push({x:C,y:v})}return Lt({points:b,unit:s,multiplier:c,top:e,spacing:r})}function ke(o){let t,e=o.length-1;return o.filter(({y:n},i)=>{if(i===0||i===e)return t=n,!0;let r=o[i+1]?.y;return t==n&&r==n?!1:(t=n,!0)})}function Lt({points:o,top:t,multiplier:e,unit:n,spacing:i}){let r=ke(t?xe(o):Ie(o)),s=(Bt(r)+i)*e,c=n=="vw"?1e3:1;return{clipPath:we({points:r,unit:n,top:t,multiplier:e}),padding:Math.round(s*c)/c+n}}function Ft(o){Ce.then(o)}var ht=o=>JSON.parse(JSON.stringify(o));function gt({points:o,method:t}){let e=o.length,n=new Float64Array(e),i=new Float64Array(e);for(let r=0;r<e;r++)n[r]=o[r].x,i[r]=o[r].y;return V(t,n,i)}var y=_(It(),1);var p=_(It(),1);var Wt=_($t(),1),S=_(te(),1);import Ge from"/_Resources/Static/Packages/Carbon.Editor.Styling/TextInput.js";var E=class o{static clone(t){return{x:t.x,y:t.y}}static computeDistance(t,e){let n=t.x-e.x,i=t.y-e.y;return Math.sqrt(n*n+i*i)}static computeCenter(t,e){return{x:(t.x+e.x)/2,y:(t.y+e.y)/2}}static mapPointIndex(t,e,n){if(n==null)return;let i=t[n];return o.findPoint(e,i)}static findPoint(t,e){if(!e)return;let n=t.indexOf(e);return n>=0?n:void 0}static makeXValsStrictMonotonic(t){for(let e=1;e<t.length;e++)if(t[e].x<=t[e-1].x){let n=t[e-1].x+1e-6;t[e]={x:n,y:t[e].y}}}static encodeCoordinateList(t){let e="";for(let n of t)e.length>0&&(e+=", "),e+="["+Jt(n.x)+", "+Jt(n.y)+"]";return e}static decodeCoordinateList(t){let e=JSON.parse("["+t+"]"),n=Array(e.length);for(let i=0;i<e.length;i++){let r=e[i];if(!Array.isArray(r)||r.length!=2||typeof r[0]!="number"||typeof r[1]!="number")throw new Error("Invalid syntax in element "+i+".");n[i]={x:r[0],y:r[1]}}return n}};function Jt(o){let t=String(o);return t.length>10&&(t=o.toPrecision(6)),t}var mt=class{constructor(t){g(this,"wctx");g(this,"ctx");g(this,"newCanvasWidth");g(this,"newCanvasHeight");this.wctx=t;let e=t.canvas.getContext("2d");if(!e)throw new Error("Canvas 2D context not available.");e.scale(t.ratio,t.ratio),this.ctx=e}clearCanvas(){let t=this.wctx,e=this.ctx;e.save();let n=t.getWidth(),i=t.getHeight();e.fillStyle=t.eState.background,e.fillRect(0,0,n,i),e.restore()}drawKnot(t){let e=this.wctx,n=this.ctx,i=e.eState.knots[t],r=e.mapLogicalToCanvasCoordinates(i);n.save(),n.beginPath();let s=t==e.iState.selectedKnotNdx&&e.iState.knotDragging,c=t==e.iState.selectedKnotNdx,l=t==e.iState.potentialKnotNdx,d=s||c||l,a=(d?5:4)*e.ratio;n.arc(r.x,r.y,a,0,2*Math.PI),n.lineWidth=(d?3:2)*e.ratio,n.strokeStyle=s||l?e.eState.activeKnotColor:c?e.eState.selectedKnotColor:e.eState.defaultKnotColor,n.stroke(),n.restore(),e.fireEvent("hasSelectedKnot",!!e.iState.selectedKnotNdx)}drawKnots(){let t=this.wctx.eState.knots;for(let e=0;e<t.length;e++)this.drawKnot(e)}drawGridLine(t,e,n,i){let r=this.wctx,s=this.ctx;s.save(),s.fillStyle=r.eState[i?"centerLineColor":"lineColor"],s.fillRect(n?e:0,n?0:e,n?1:r.getWidth(),n?r.getHeight():1),s.restore()}calcGridLine(t,e,n,i=!1){let r=this.wctx,s=t*e,c=n?r.mapLogicalToCanvasXCoordinate(s):r.mapLogicalToCanvasYCoordinate(s);if(!i&&(n?c>r.getWidth():c<0))return null;let l=i||t==r.eState.rangeValues[n?"xMax":"yMax"]/2;return this.drawGridLine(t,c,n,l),l}drawXYGrid(t){let n=this.wctx.getGridParms(t);if(!n)return;let i=n.pos,r=!1,s=0;for(;;){let c=this.calcGridLine(i,n.space,t);if(c===null||(c===!0&&(r=!0),i+=n.span,s++>100))break}r||this.calcGridLine((i-1)/2,n.space,t,!0)}drawGrid(){this.drawXYGrid(!0),this.drawXYGrid(!1)}drawFunctionCurve(t,e,n){let i=this.wctx,r=this.ctx;r.save(),r.beginPath();let s=Math.max(0,Math.ceil(i.mapLogicalToCanvasXCoordinate(e))),c=Math.min(i.getWidth(),Math.floor(i.mapLogicalToCanvasXCoordinate(n)));for(let l=s;l<=c;l++){let d=i.mapCanvasToLogicalXCoordinate(l),a=t(d),u=Math.max(-1e6,Math.min(1e6,i.mapLogicalToCanvasYCoordinate(a)));r.lineTo(l,u)}r.strokeStyle=i.eState.curveColor,r.lineWidth=i.ratio*2,r.stroke(),r.restore()}drawFunctionCurveFromKnots(){let t=this.wctx,e=t.eState.knots;if(e.length<2)return;let n=e[0].x,i=e[e.length-1].x,r=t.createInterpolationFunction();this.drawFunctionCurve(r,n,i)}paint(){let t=this.wctx;!this.newCanvasWidth||!this.newCanvasHeight||((this.newCanvasWidth!=t.getWidth()||this.newCanvasHeight!=t.getHeight())&&(t.canvas.width=this.newCanvasWidth,t.canvas.height=this.newCanvasHeight),this.clearCanvas(),t.eState.gridEnabled&&this.drawGrid(),this.drawKnots(),this.drawFunctionCurveFromKnots())}resize(t,e){let n=this.wctx;this.newCanvasWidth==t&&this.newCanvasHeight==e||(this.newCanvasWidth=t*n.ratio,this.newCanvasHeight=e*n.ratio,n.requestRefresh())}},ft=class{constructor(t){g(this,"wctx");g(this,"pointers");g(this,"dragCount");g(this,"lastTouchTime");g(this,"pointerDownEventListener",t=>{if(!(t.altKey||t.ctrlKey||t.metaKey||t.shiftKey||t.pointerType=="mouse"&&t.button!=0)&&!this.isPointerInResizeHandle(t)){if(this.trackPointer(t),(t.pointerType=="touch"||t.pointerType=="pen")&&this.pointers.size==1){if(this.lastTouchTime>0&&performance.now()-this.lastTouchTime<=300){this.lastTouchTime=0,this.processDoubleClickTouch(),t.preventDefault();return}this.lastTouchTime=performance.now()}this.switchMode(),t.preventDefault()}});g(this,"pointerUpEventListener",t=>{this.pointers.has(t.pointerId)&&(this.releasePointer(t.pointerId),this.switchMode(),t.preventDefault())});g(this,"pointerMoveEventListener",t=>{if(!this.pointers.has(t.pointerId)){this.updatePotentialKnot(t);return}this.trackPointer(t),this.pointers.size==1&&this.drag(),t.preventDefault()});g(this,"dblClickEventListener",t=>{if(t.altKey||t.ctrlKey||t.metaKey||t.shiftKey||t.button!=0)return;let e=this.getCanvasCoordinatesFromEvent(t);this.createKnot(e),t.preventDefault()});this.wctx=t,this.pointers=new Map,t.canvas.addEventListener("pointerdown",this.pointerDownEventListener),t.canvas.addEventListener("pointerup",this.pointerUpEventListener),t.canvas.addEventListener("pointercancel",this.pointerUpEventListener),t.canvas.addEventListener("pointermove",this.pointerMoveEventListener),t.canvas.addEventListener("dblclick",this.dblClickEventListener)}dispose(){let t=this.wctx;t.canvas.removeEventListener("pointerdown",this.pointerDownEventListener),t.canvas.removeEventListener("pointerup",this.pointerUpEventListener),t.canvas.removeEventListener("pointercancel",this.pointerUpEventListener),t.canvas.removeEventListener("pointermove",this.pointerMoveEventListener),t.canvas.removeEventListener("dblclick",this.dblClickEventListener),this.releaseAllPointers()}processEscKey(){this.abortDragging()}switchMode(){let t=this.wctx;this.stopDragging(),this.pointers.size==1&&(this.startDragging(),t.canvas.focus())}trackPointer(t){let e=this.wctx,n=t.pointerId;this.pointers.has(n)||e.canvas.setPointerCapture(n),this.pointers.set(n,t)}releasePointer(t){let e=this.wctx;this.pointers.delete(t),e.canvas.releasePointerCapture(t)}releaseAllPointers(){for(;this.pointers.size>0;){let t=this.pointers.keys().next().value;this.releasePointer(t)}}startDragging(){let t=this.wctx,e=this.getCanvasCoordinates(),n=this.pointers.values().next().value.pointerType,i=this.findNearKnot(e,n);t.iState.selectedKnotNdx=i,t.iState.knotDragging=i!=null,this.dragCount=0,t.iState.potentialKnotNdx=void 0,t.requestRefresh()}abortDragging(){let t=this.wctx;t.iState.knotDragging&&this.dragCount>0&&(t.undo(),t.fireChangeEvent()),this.stopDragging(),t.requestRefresh()}stopDragging(){let t=this.wctx;t.iState.knotDragging&&t.requestRefresh(),t.iState.knotDragging=!1}drag(){let t=this.wctx,e=this.getCanvasCoordinates();if(t.iState.knotDragging&&t.iState.selectedKnotNdx!=null){this.dragCount++==0&&t.pushUndoHistoryState();let n=t.mapCanvasToLogicalCoordinates(e),i=this.snapToGrid(n);t.moveKnot(t.iState.selectedKnotNdx,i),t.requestRefresh(),t.fireChangeEvent()}}processDoubleClickTouch(){let t=this.getCanvasCoordinates();this.createKnot(t)}createKnot(t){let e=this.wctx;e.pushUndoHistoryState();let n=e.mapCanvasToLogicalCoordinates(t),i=e.addKnot(n);e.iState.selectedKnotNdx=i,e.iState.potentialKnotNdx=i,e.iState.knotDragging=!1,e.requestRefresh(),e.fireChangeEvent()}updatePotentialKnot(t){let e=this.wctx,n=this.getCanvasCoordinatesFromEvent(t),i=this.findNearKnot(n,t.pointerType);e.iState.potentialKnotNdx!=i&&(e.iState.potentialKnotNdx=i,e.requestRefresh())}findNearKnot(t,e){let i=this.wctx.findNearestKnot(t),r=e=="touch"?30:15;return i&&i.distance<=r?i.knotNdx:void 0}snapToGrid(t){let e=this.wctx;return!e.eState.gridEnabled||!e.eState.snapToGridEnabled?t:{x:this.snapToGrid2(t.x,!0),y:this.snapToGrid2(t.y,!1)}}snapToGrid2(t,e){let n=this.wctx,i=5*n.ratio,r=n.getGridParms(e);if(!r)return t;let s=r.space*r.span,c=Math.round(t/s)*s;return Math.abs(t-c)*n.getZoomFactor(e)>i?t:c}getCanvasCoordinates(){if(this.pointers.size<1)throw new Error("No active pointers.");let t=this.pointers.values().next().value;return this.getCanvasCoordinatesFromEvent(t)}getCanvasCoordinatesFromEvent(t){return this.wctx.mapViewportToCanvasCoordinates({x:t.clientX,y:t.clientY})}isPointerInResizeHandle(t){let n=this.wctx.canvas.parentNode;if(!(n instanceof HTMLElement)||getComputedStyle(n).resize!="both")return!1;let i=n.getBoundingClientRect(),r=i.right-t.clientX,s=i.bottom-t.clientY,c=18;return r>=0&&r<c&&s>=0&&s<c}},Ct=class{constructor(t){g(this,"wctx");g(this,"keyDownEventListener",t=>{let e=Se(t);this.processKeyDown(e)&&t.preventDefault()});this.wctx=t,t.canvas.addEventListener("keydown",this.keyDownEventListener)}dispose(){this.wctx.canvas.removeEventListener("keydown",this.keyDownEventListener)}processKeyDown(t){let e=this.wctx;switch(t){case"Backspace":case"Delete":return e.action("deletePoint");case"Ctrl+z":case"Alt+Backspace":return e.action("undo");case"Ctrl+y":case"Ctrl+Z":return e.action("redo");case"Escape":return e.pointerController.processEscKey(),!0;default:return!1}}};function Se(o){return(o.altKey?"Alt+":"")+(o.ctrlKey?"Ctrl+":"")+o.key}var vt=class{constructor(t,e){g(this,"widget");g(this,"plotter");g(this,"pointerController");g(this,"kbController");g(this,"canvas");g(this,"canvasStyle");g(this,"eventTarget");g(this,"isConnected");g(this,"animationFramePending");g(this,"resizeObserver");g(this,"ratio");g(this,"eState");g(this,"initialEState");g(this,"iState");g(this,"hState");g(this,"animationFrameHandler",()=>{this.animationFramePending=!1,this.isConnected&&this.refresh()});g(this,"resizeObserverCallback",t=>{let e=t[0].contentBoxSize[0],n=e.inlineSize,i=e.blockSize;this.plotter.resize(n,i)});this.ratio=window.devicePixelRatio||1,this.widget=e,this.canvas=t,this.canvasStyle=getComputedStyle(t),this.eventTarget=new EventTarget,this.isConnected=!1,this.animationFramePending=!1,this.resizeObserver=new ResizeObserver(this.resizeObserverCallback),this.setEditorState({})}getHeight(t=!1){return this.canvas.height*(t?this.ratio:1)}getWidth(t=!1){return this.canvas.width*(t?this.ratio:1)}setConnected(t){t!=this.isConnected&&(t?(this.plotter=new mt(this),this.pointerController=new ft(this),this.kbController=new Ct(this),this.resizeObserver.observe(this.canvas)):(this.pointerController.dispose(),this.kbController.dispose(),this.resizeObserver.unobserve(this.canvas)),this.isConnected=t,this.requestRefresh())}setEditorState(t){this.eState=bt(t),this.initialEState=bt(t),this.resetInteractionState(),this.resetHistoryState(),this.requestRefresh()}getEditorState(){return bt(this.eState)}resetInteractionState(){this.iState={selectedKnotNdx:void 0,potentialKnotNdx:void 0,knotDragging:!1}}reset(){return this.setEditorState(this.initialEState),!0}resetHistoryState(){this.hState={undoStack:[],undoStackPos:0}}pushUndoHistoryState(){let t=this.hState;t.undoStack.length=t.undoStackPos,t.undoStack.push(this.eState.knots.slice()),t.undoStackPos=t.undoStack.length}canRedo(){let t=this.hState;return!(t.undoStackPos>=t.undoStack.length-1)}canUndo(){return this.hState.undoStackPos>0}canDeleteKnot(){return this.iState.selectedKnotNdx!=null}undo(){if(!this.canUndo())return!1;let t=this.hState;return t.undoStackPos==t.undoStack.length&&t.undoStack.push(this.eState.knots.slice()),t.undoStackPos--,this.eState.knots=t.undoStack[t.undoStackPos].slice(),this.resetInteractionState(),!0}redo(){if(!this.canRedo())return!1;let t=this.hState;return t.undoStackPos++,this.eState.knots=t.undoStack[t.undoStackPos].slice(),this.resetInteractionState(),!0}action(t){switch(t){case"deletePoint":return this.canDeleteKnot()&&(this.iState.knotDragging=!1,this.pushUndoHistoryState(),this.deleteKnot(this.iState.selectedKnotNdx),this.requestRefresh(),this.fireChangeEvent()),!0;case"undo":return this.undo()&&(this.requestRefresh(),this.fireChangeEvent()),!0;case"redo":return this.redo()&&(this.requestRefresh(),this.fireChangeEvent()),!0;case"reset":return this.reset(),this.requestRefresh(),this.fireChangeEvent(),!0;case"fireChangeEvent":return this.fireChangeEvent(),!0;default:return!1}}mapLogicalToCanvasXCoordinate(t){return(t-this.eState.xMin)*this.getWidth()/(this.eState.xMax-this.eState.xMin)}mapLogicalToCanvasYCoordinate(t){return this.getHeight()-(t-this.eState.yMin)*this.getHeight()/(this.eState.yMax-this.eState.yMin)}mapLogicalToCanvasCoordinates(t){return{x:this.mapLogicalToCanvasXCoordinate(t.x),y:this.mapLogicalToCanvasYCoordinate(t.y)}}mapCanvasToLogicalXCoordinate(t){return this.eState.xMin+t*(this.eState.xMax-this.eState.xMin)/this.getWidth()}mapCanvasToLogicalYCoordinate(t){return this.eState.yMin+(this.getHeight()-t)*(this.eState.yMax-this.eState.yMin)/this.getHeight()}mapCanvasToLogicalCoordinates(t){return{x:this.mapCanvasToLogicalXCoordinate(t.x),y:this.mapCanvasToLogicalYCoordinate(t.y)}}mapViewportToCanvasCoordinates(t){let e=this.canvasStyle,n=this.canvas.getBoundingClientRect(),i=x(e.paddingLeft),r=x(e.paddingRight),s=x(e.paddingTop),c=x(e.paddingBottom),l=x(e.borderLeftWidth),d=x(e.borderTopWidth),a=this.canvas.clientWidth-i-r,u=this.canvas.clientHeight-s-c,b=t.x-n.left-l-i,m=t.y-n.top-d-s,C=b/a*this.getWidth(),v=m/u*this.getHeight();return{x:C,y:v};function x(k){return k?parseFloat(k):0}}getZoomFactor(t){let e=this.eState;return t?this.getWidth()/(e.xMax-e.xMin):this.getHeight()/(e.yMax-e.yMin)}deleteKnot(t){let e=t==0,n=t==this.eState.knots.length-1;if(e||n)return;let i=ht(this.eState.knots),r=i.slice();i.splice(t,1),this.eState.knots=i,this.fixUpKnotIndexes(r)}moveKnot(t,e){let{rangeValues:n,knots:i}=this.eState,r=t==0,s=t==i.length-1,c=.1,l=n.xMin,d=n.xMax,a=l+c,u=d-c,b=n.yMin,m=n.yMax,C=b+c,v=m-c;r?e.x=l:s?e.x=d:e.x=Math.min(Math.max(e.x,a),u),e.y=Math.min(Math.max(e.y,C),v);let x=ht(this.eState.knots);x[t]=e,this.eState.knots=x,this.revampKnots()}addKnot(t){let e=E.clone(t);this.eState.knots=[...this.eState.knots,e],this.revampKnots();let n=E.findPoint(this.eState.knots,e);if(n==null)throw new Error("Program logic error.");return n}replaceKnots(t){this.eState.knots=t,this.resetInteractionState(),this.revampKnots()}revampKnots(){this.sortKnots(),E.makeXValsStrictMonotonic(this.eState.knots)}sortKnots(){let t=this.eState.knots.slice();this.eState.knots.sort(function(e,n){return e.x!=n.x?e.x-n.x:e.y-n.y}),this.fixUpKnotIndexes(t)}fixUpKnotIndexes(t){this.iState.selectedKnotNdx=E.mapPointIndex(t,this.eState.knots,this.iState.selectedKnotNdx),this.iState.potentialKnotNdx=E.mapPointIndex(t,this.eState.knots,this.iState.potentialKnotNdx),this.iState.knotDragging=this.iState.knotDragging&&this.iState.selectedKnotNdx!=null}findNearestKnot(t){let e=this.eState.knots,n,i;for(let r=0;r<e.length;r++){let s=e[r],c=this.mapLogicalToCanvasCoordinates(s),l=E.computeDistance(c,t);(n==null||l<n)&&(i=r,n=l)}return i!=null?{knotNdx:i,distance:n}:void 0}getKnotCoordinateString(){return E.encodeCoordinateList(this.eState.knots)}async setKnotCoordinateString(t){let e;try{e=E.decodeCoordinateList(t)}catch(n){throw new Error("Knot coordinates could not be decoded. "+n)}this.pushUndoHistoryState(),this.replaceKnots(e),this.requestRefresh(),this.fireChangeEvent()}getGridParms(t){let e=t?66:50,n=t?this.eState.xMin:this.eState.yMin,i=e/this.getZoomFactor(t),r=Math.ceil(Math.log(i/5)/Math.LN10);if((n==0?-99:Math.log(Math.abs(n))/Math.LN10)-r>10)return;let c=Math.pow(10,r),l=i/c,d=l>2.001?5:l>1.001?2:1,a=Math.ceil(n/c),u=d*Math.ceil(a/d);return{space:c,span:d,pos:u,decPow:r}}createInterpolationFunction(){return gt({points:this.eState.knots,method:this.eState.interpolationMethod})}requestRefresh(){this.animationFramePending||!this.isConnected||(requestAnimationFrame(this.animationFrameHandler),this.animationFramePending=!0)}refresh(){this.plotter.paint(),this.updateCanvasCursorStyle()}updateCanvasCursorStyle(){let{knotDragging:t,potentialKnotNdx:e}=this.iState,n=t?"grabbing":e?"grab":"auto";this.canvas.style.cursor=n}fireChangeEvent(){let{interpolationMethod:t,knots:e}=this.eState,n=E.encodeCoordinateList(e),i=e.length;this.fireEvent("change",{knotsLength:i,interpolationMethod:t,knots:e,coordinateString:n})}fireEvent(t,e){let n=new CustomEvent(t,{detail:e});Ft(()=>{this.eventTarget.dispatchEvent(n)})}};function bt(o){return{knots:(o.knots??[]).slice(),xMin:o.xMin??0,xMax:o.xMax??10,yMin:o.yMin??-2,yMax:o.yMax??2,relevantXMin:o.relevantXMin,relevantXMax:o.relevantXMax,gridEnabled:o.gridEnabled??!0,snapToGridEnabled:o.snapToGridEnabled??!0,rangeValues:o.rangeValues??{xMin:0,xMax:10,yMin:-2,yMax:2},interpolationMethod:o.interpolationMethod??"akima",focusShield:o.focusShield??!1,curveColor:o.curveColor??"#00ADEE",defaultKnotColor:o.defaultKnotColor??"#ff8700",selectedKnotColor:o.selectedKnotColor??"#ff460d",activeKnotColor:o.activeKnotColor??"#fda23d",lineColor:o.lineColor??"#323232",centerLineColor:o.centerLineColor??"#555",background:o.background??"#222222"}}var j=class{constructor(t,e=!0){g(this,"wctx");this.wctx=new vt(t,this),e&&this.setConnected(!0)}setEventTarget(t){this.wctx.eventTarget=t}setConnected(t){this.wctx.setConnected(t)}addEventListener(t,e){this.wctx.eventTarget.addEventListener(t,e)}removeEventListener(t,e){this.wctx.eventTarget.removeEventListener(t,e)}getEditorState(){return this.wctx.getEditorState()}setEditorState(t){this.wctx.setEditorState(t)}getFunction(){return this.wctx.createInterpolationFunction()}getKnotCoordinateString(){return this.wctx.getKnotCoordinateString()}setKnotCoordinateString(t){return this.wctx.setKnotCoordinateString(t)}canUndo(){return this.wctx.canUndo()}canRedo(){return this.wctx.canRedo()}action(t){return this.wctx.action(t)}};var Xe=100,Ht=50,M={xMin:0,xMax:Xe,yMin:0,yMax:Ht},$=Ht/20,Yt=2,Nt=100,tt=o=>Math.min(Math.max(o,Yt),Nt);function Ae({top:o,onCommit:t,state:e,interpolationMethods:n,labels:i,showGrid:r,snapToGrid:s}){let c=(0,p.useMemo)(()=>wt(),[]),l=n.map(h=>({value:h,label:i[h]})),d=h=>n.some(I=>I==h),a=[{x:M.xMin,y:M.yMax/2},{x:M.xMax/2,y:M.yMax/2+2},{x:M.xMax,y:M.yMax/2}],u={knots:e.points?e.points:a,xMin:M.xMin-$,xMax:M.xMax+$,yMin:M.yMin-$,yMax:M.yMax+$,rangeValues:M,gridEnabled:!0,snapToGridEnabled:!0,interpolationMethod:e.interpolationMethod||"cubic"},b={width:(u.xMax-u.xMin)*10,height:(u.yMax-u.yMin)*10},[m,C]=(0,p.useState)(null),[v,x]=(0,p.useState)(null),[k,G]=(0,p.useState)(u.interpolationMethod),[P,Y]=(0,p.useState)(u.interpolationMethod),N=(0,p.useRef)(null),[f,et]=(0,p.useState)(null),[R,K]=(0,p.useState)(null),[O]=yt(R,250),[nt,Z]=(0,p.useState)(null),[Zt,Dt]=(0,p.useState)(!1),[Tt,qt]=(0,p.useState)(!1),[zt,_t]=(0,p.useState)(!1),[Ut,Qt]=(0,p.useState)(!1);(0,p.useEffect)(()=>{K(tt(nt))},[nt]),(0,p.useEffect)(()=>{let h=new j(N.current);h.setEditorState(u);let I=h.getEditorState();Z(tt(I.knots.length));let X=h.getKnotCoordinateString(),A=I.interpolationMethod;return x(X),C(X),G(A),Y(A),h.addEventListener("change",({detail:L})=>{let{knotsLength:ot,coordinateString:D,knots:J,interpolationMethod:T}=L;Z(ot),C(D),!(!f&&v===D&&T===P)&&t({interpolationMethod:T,points:J})}),h.addEventListener("hasSelectedKnot",({detail:L})=>{Qt(!!L)}),et(h),e.points||t({interpolationMethod:A,points:a}),()=>{h.setConnected(!1)}},[]),(0,p.useMemo)(()=>{_t(v!==m),f&&(Dt(f.canUndo()),qt(f.canRedo()))},[m]),(0,p.useMemo)(()=>{if(!f)return;let h=f.getEditorState();h.gridEnabled=r,f.setEditorState(h)},[r]),(0,p.useMemo)(()=>{if(!f)return;let h=f.getEditorState();h.snapToGridEnabled=s&&r,f.setEditorState(h)},[s]),(0,p.useMemo)(()=>{if(!f)return;let h=f.getEditorState();h.interpolationMethod=k,f.setEditorState(h),B("fireChangeEvent")},[k]),(0,p.useMemo)(()=>{if(!f)return;let h=f.getEditorState(),I=h.knots,X=I.length;if(O===X||!X)return;let A=I[0].x,L=I[X-1].x,ot=f.getFunction(),D=Array(O);for(let J=0;J<O;J++){let T=A+(L-A)/(O-1)*J,jt=ot(T);D[J]={x:T,y:jt}}h.knots=D,f.setEditorState(h),B("fireChangeEvent")},[O]);function B(h){f.action(h)}async function Vt(){try{let h=await navigator.clipboard.readText();try{let[I,X]=h.split("||");if(!d(I)){alert(i.interpolationMethodError),console.error(`${I} is not a valid interpolation method`);return}try{f.setKnotCoordinateString(X),G(I),B("fireChangeEvent")}catch(A){alert(i.coordinatesError),console.error(A)}}catch(I){alert(i.parseConfigError),console.error(I)}}catch(h){alert(i.clipboardError),console.error(h)}}function xt(h=!0){let I=JSON.parse(`[${m}]`),X;h?X=I.map(([A,L])=>[A,Math.abs(L-M.yMax)]).reverse():X=I.map(([A,L])=>[Math.abs(A-M.xMax),L]).reverse(),f.setKnotCoordinateString(JSON.stringify(X).slice(1).slice(0,-1)),B("fireChangeEvent")}let[Le,Be]=(0,p.useState)(!1);return p.default.createElement(p.default.Fragment,null,p.default.createElement("div",{className:q(w.curveOutput,o?w.curveOutputTop:w.curveOutputBottom)},p.default.createElement("canvas",{ref:N,width:b.width,height:b.height,tabindex:"-1"})),f&&p.default.createElement("div",{className:q(w.curveControls,o?w.curveControlsTop:w.curveControlsBottom)},n.length>1&&p.default.createElement("div",null,p.default.createElement(it,{label:i.interpolationmethod,options:l,value:k,onChange:G})),p.default.createElement("div",null,p.default.createElement(S.Label,{htmlFor:`${c}_knots`},i.numberOfPoints),p.default.createElement("div",{className:w.numberOfPoints},p.default.createElement(S.Button,{onClick:()=>Z(tt(R-1))},"-"),p.default.createElement(Ge,{id:`${c}_knots`,type:"number",min:Yt,max:Nt,value:nt,onChange:Z,textAlign:"center"}),p.default.createElement(S.Button,{onClick:()=>Z(tt(R+1))},"+"))),p.default.createElement("div",{className:w.iconButtons},p.default.createElement(S.IconButton,{style:"neutral",icon:"copy",title:i.copyConfig,onClick:()=>{navigator.clipboard.writeText(`${k}||${m}`)}}),p.default.createElement(S.IconButton,{style:"neutral",icon:"paste",title:i.pasteConfig,onClick:Vt}),p.default.createElement(S.IconButton,{iconProps:{className:w.rotate90},style:"neutral",icon:"exchange-alt",title:i.flipVertically,onClick:()=>xt(!0)}),p.default.createElement(S.IconButton,{style:"neutral",icon:"exchange-alt",title:i.flipHorizontally,onClick:()=>xt(!1)}),p.default.createElement(S.IconButton,{disabled:!Zt,style:"neutral",hoverStyle:"warn",icon:"undo",title:i.undo,onClick:()=>B("undo")}),p.default.createElement(S.IconButton,{disabled:!Tt,style:"neutral",hoverStyle:"warn",icon:"redo",title:i.redo,onClick:()=>B("redo")}),p.default.createElement(S.IconButton,{disabled:!Ut,style:"neutral",hoverStyle:"error",icon:"trash",title:i.deletePoint,onClick:()=>B("deletePoint")}),p.default.createElement(S.IconButton,{disabled:!zt,style:"neutral",hoverStyle:"error",icon:"times",title:i.reset,onClick:()=>B("reset")}))))}var Pe=["akima","clipboardError","coordinatesError","copyConfig","cubic","deletePoint","flipHorizontally","flipVertically","interpolationmethod","interpolationMethodError","linear","loess","nearestNeighbor","numberOfPoints","parseConfigError","pasteConfig","redo","reset","undo"],Ee=(0,Wt.neos)(o=>{let t=o.get("i18n"),e={};return Pe.forEach(n=>{e[n]=t.translate(`Litefyr.Style:NodeTypes.Mixin.Visuals.ClipPath:editor.${n}`)}),{labels:e}}),Oe=Ee(Ae);var Rt={curveControlsTop:"Ji6k2q_curveControlsTop",bottomControls:"Ji6k2q_bottomControls",curveOutputTop:"Ji6k2q_curveOutputTop",bottomOutput:"Ji6k2q_bottomOutput",secondary:"Ji6k2q_secondary",topControls:"Ji6k2q_topControls",globalControls:"Ji6k2q_globalControls",curveOutputBottom:"Ji6k2q_curveOutputBottom",curveControls:"Ji6k2q_curveControls",numberOfPoints:"Ji6k2q_numberOfPoints",clipPathOutput:"Ji6k2q_clipPathOutput",topOutput:"Ji6k2q_topOutput",iconButtons:"Ji6k2q_iconButtons",output:"Ji6k2q_output",curveControlsBottom:"Ji6k2q_curveControlsBottom",chessboard:"Ji6k2q_chessboard",previewOutput:"Ji6k2q_previewOutput",topClipPath:"Ji6k2q_topClipPath",reverseStacking:"Ji6k2q_reverseStacking",bottomClipPath:"Ji6k2q_bottomClipPath",curveOutput:"Ji6k2q_curveOutput",rotate90:"Ji6k2q_rotate90",primaryWrapper:"Ji6k2q_primaryWrapper"};var w={...kt,...Rt};function Kt({state:o,label:t,topColor:e,bottomColor:n,asyncPath:i,nesting:r,reverseStacking:s,topSpacing:c=0,bottomSpacing:l=0}){let d=o?.topConfig,a=o?.bottomConfig,[u,b]=(0,y.useState)(0),[m,C]=(0,y.useState)(null),v=(0,y.useRef)(),x=0;function k(){v.current&&v.current.offsetWidth?b(v.current.offsetWidth):x<1e3&&(x++,setTimeout(k,10))}return(0,y.useEffect)(()=>(k(),window.addEventListener("resize",k),()=>{window.removeEventListener("resize",k)}),[]),(0,y.useMemo)(()=>{if(!u){C(null);return}let G=z({config:d,top:!0,containerWidth:u,spacing:c}),P=z({config:i?a:d,top:!1,containerWidth:u,spacing:l});if(!G||!P){C(null);return}C({clipPath:`polygon(${G.clipPath}, ${P.clipPath})`,"--padding-top":G.padding,"--padding-bottom":P.padding})},[u,d,a,i,c,l]),y.default.createElement("div",{ref:v,className:w.clipPathOutput,style:{"--nesting":pt(r)}},m&&y.default.createElement(y.default.Fragment,null,y.default.createElement("div",{className:q(w.topClipPath,r&&s&&w.reverseStacking),style:{backgroundColor:e,...m}},t&&y.default.createElement("h1",{className:w.chessboard},t)),y.default.createElement("div",{className:w.bottomClipPath,style:{backgroundColor:n,...m}})))}export{fe as a,Kt as b,Oe as c,w as d};
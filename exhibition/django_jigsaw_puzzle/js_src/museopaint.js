function rgb2hsl(r,g,b) {
  let v=Math.max(r,g,b), c=v-Math.min(r,g,b), f=(1-Math.abs(v+v-c-1)); 
  let h= c && ((v==r) ? (g-b)/c : ((v==g) ? 2+(b-r)/c : 4+(r-g)/c)); 
  return [60*(h<0?h+6:h), f ? c/f : 0, (v+v-c)/2];
}

function hsl2rgb(h,s,l) 
{
   let a=s*Math.min(l,1-l);
   let f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);
   return [f(0),f(8),f(4)];
}

// Adjust the hue by a certain degree
function adjustHue(r, g, b, degrees) { // 
    let [h, s, l] = rgb2hsl(r, g, b);
    console.log(h, s, l);
    h = (h + degrees) % 360; // Adjust hue and keep it in range [0, 360]
    console.log(h, s, l);
    return hsl2rgb(h, s, l);
}

function dist(a, b) {
    if (!a[0] || !a[1] || !b[0] || !b[1]) {
	return 0;
    }
    const dx = a[0]-b[0];
    const dy = a[1]-b[1];
    return Math.sqrt(dx*dx + dy*dy);
}

function drawDot(gl, p,
		 pos, vertsLen,
		 color, radius, opacity) {
    const [x, y] = pos;
    const [r, g, b] = color;

    const colorLoc = gl.getUniformLocation(p, "color");
    gl.uniform4f(colorLoc, r, g, b, opacity);
    const dotRadiusLoc = gl.getUniformLocation(p, "dotRadius");
    gl.uniform1f(dotRadiusLoc, radius);
    const dotCenterLoc = gl.getUniformLocation(p, "dotCenter");
    gl.uniform2f(dotCenterLoc, x, y);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertsLen / 3);
}

function drawDotsOnLine(gl, p,
			posLast, pos, vertsLen, minDist,
			color, radius, opacity) {
    const [xFrom, yFrom] = posLast;
    const [xTo, yTo] = pos;

    const d = dist(posLast, pos);
    const direction = [(xTo-xFrom)/d, (yTo-yFrom)/d];
    let dPainted = 0;
    let posNew = [xFrom, yFrom];
    let posNewPrev = [null, null];
    while (dPainted < d - minDist) {
	posNew = [posNew[0] + direction[0] * minDist,
		  posNew[1] + direction[1] * minDist];
	dPainted += dist(posNew, posNewPrev);
	drawDot(gl, p, posNew, vertsLen, color, radius, opacity);
	posNewPrev = posNew;
    }
}

// Vertex data for a circle
function generateCircleVertices(numSegments) {
    const verts = [];
    // Center vertex (fully opaque)
    verts.push(0.0, 0.0, 1.0);
    for (let i = 0; i <= numSegments; i++) {
        const angle = (i / numSegments) * Math.PI * 2;
        verts.push(Math.cos(angle), Math.sin(angle), 0.0);
    }
    return verts;
}


function initGl(canvas, dotResolution, dotThreshold, dotRadius, dotOpacity, dotColor) {
    // The drawing
    const gl = canvas.getContext("webgl", {
	alpha: false,
	premultipliedAlpha: false, // important for precision!!
	preserveDrawingBuffer: true, // So the buffer is not deleted on every blit
    });

    // Shaders
    const vs = `
attribute vec2 pos;
attribute float alpha;

uniform vec2 resolution;
uniform vec2 dotCenter;
uniform float dotRadius;

varying float vAlpha; // To be passed to frag shader

void main() {
  vec2 normalizedPos = ((pos * dotRadius + dotCenter) / resolution) * 2.0 - 1.0;
  normalizedPos.y *= -1.0;
  gl_Position = vec4(normalizedPos, 0, 1);
  vAlpha = alpha;
}`;

    const fs = `
precision mediump float;
uniform vec4 color;
varying float vAlpha; // Interpolated alpha from vertex shader
void main() {
  gl_FragColor = vec4(color.rgb, color.a * vAlpha);
}`;

    // Create and compile shaders
    const p = gl.createProgram();
    [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, i) => {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, [vs, fs][i]);
	gl.compileShader(shader);
	gl.attachShader(p, shader);
    });
    gl.linkProgram(p);
    gl.useProgram(p);

    // Create a buffer for the circle's vertices
    const verts = generateCircleVertices(dotResolution);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Pass resolution to shader
    const resLoc = gl.getUniformLocation(p, "resolution");
    gl.uniform2f(resLoc, canvas.width, canvas.height);

    // Pass dot center to shader
    const dotCenterLoc = gl.getUniformLocation(p, "dotCenter");
    gl.uniform2f(dotCenterLoc, canvas.width/2.0, canvas.height/2.0);

    // Pass dot radius to shader
    const dotRadiusLoc = gl.getUniformLocation(p, "dotRadius");
    gl.uniform1f(dotRadiusLoc, dotRadius);

    // Pass color
    const colorLoc = gl.getUniformLocation(p, "color");
    gl.uniform4f(colorLoc, dotColor[0], dotColor[1], dotColor[2], dotOpacity);

    // Set up the position attribute
    const posLoc = gl.getAttribLocation(p, "pos");
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 3 * 4, 0);
    gl.enableVertexAttribArray(posLoc);

    const alphaLoc = gl.getAttribLocation(p, "alpha");
    gl.vertexAttribPointer(alphaLoc, 1, gl.FLOAT, false, 3 * 4, 2 * 4);
    gl.enableVertexAttribArray(alphaLoc);
    
    // Enable blending for alpha blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Standard 

    // gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE_MINUS_DST_ALPHA, gl.ONE);
    // gl.blendEquation(gl.FUNC_ADD);

    // gl.blendFunc(gl.SRC_COLOR, gl.ONE_MINUS_SRC_COLOR);
    // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    // gl.blendEquation(gl.FUNC_ADD);

    // Set up WebGL viewport and clear color
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return [gl, p, verts.length];
}

function initEventListeners(canvas, gl, p, vertsLen,
			    mouseDown, posLast, drawnLast, traceDist,
			    dotThreshold, dotRadius, dotColor, dotOpacity) {
    canvas.addEventListener('mousedown', (ev) => {
	mouseDown = true;
	posLast = [ev.clientX, ev.clientY];
    });

    canvas.addEventListener('mouseup', (ev) => {
	// Single clicks
	if (!drawnLast[0]) {
	    const pos = [ev.clientX, ev.clientY];
	    for (let i = 0; i < 1; ++i) {
		drawDot(gl, p, pos, vertsLen, dotColor, dotRadius, dotOpacity);
	    }
	}

	mouseDown = false;
	drawnLast = [null, null];
    });

    canvas.addEventListener('mousemove', (ev) => {
	if (mouseDown) {
	    const pos = [ev.clientX, ev.clientY];
	    const [x, y] = pos;
	    const d = dist(pos, posLast);

	    traceDist += d;

	    if (traceDist >= dotThreshold) {
		drawDotsOnLine(gl, p,
			       drawnLast, pos, vertsLen,
			       dotThreshold,
			       dotColor, dotRadius, dotOpacity);
		traceDist = 0;
		drawnLast = pos;
	    }
	    posLast = pos;
	}
    });

    canvas.addEventListener('wheel', (ev) => {
	const shift = ev.getModifierState("Shift");
	const alt = ev.getModifierState("Alt");
	if (alt && shift) {
	    let [r, g, b] = dotColor;
	    console.log(r, g, b);
	    dotColor = adjustHue(r, g, b, ev.deltaY/10.0);
	    console.log(dotColor);
	} else if (shift) {
	    dotOpacity += -ev.deltaY/100000.0
	    if (dotOpacity < 0) {
		dotOpacity = 0;
	    }
	    if (dotOpacity >= 1) {
		dotOpacity = 1;
	    }
	    console.log("dotOpacity", dotOpacity);
	} else {
	    dotRadius += -ev.deltaY/100;
	    dotRadius = Math.round(dotRadius);
	    if (dotRadius < 1) {
		dotRadius = 1;
	    }
	    console.log("dotRadius", dotRadius);
	}
    });

    canvas.addEventListener('mouseenter', (ev) => {
	if (mouseDown) {
	    drawnLast = [ev.clientX, ev.clientY];
	}
    });
}

export default function museopaint() {
    // DOM
    const rootEl = document.getElementById("game");
    rootEl.style.width = "100vw";
    rootEl.style.height = "100vh";

    const gizmosHtml = `
<div style="position: absolute; top: 0, left: 0; width:200px; height: 100%; background: rgba(255, 255, 255, 0); pointer-events: none; z-index: 1;">
  <span>Hello</span>
  <input type="color" id="colorPicker" style="pointer-events: auto;">
</div>
`;
    // rootEl.innerHtml = gizmosHtml;
    // console.log(rootEl.innerHtml);
    
    const canvas = document.createElement('canvas');
    // canvas.style = "position: absolute; top: 0, left: 0; z-index: 0;"

    canvas.width = rootEl.clientWidth;
    canvas.height = rootEl.clientHeight;
    rootEl.appendChild(canvas);

    // Config
    const dotThreshold = 3;
    let dotRadius = 20;
    let dotOpacity = 0.6;
    let dotColor = [1, 0, 0];
    const dotResolution = 64;

    const [gl, p, vertsLen] = initGl(canvas,
				     dotResolution, dotThreshold, dotRadius, dotOpacity, dotColor);

    // Click handling
    let mouseDown = false;
    let posLast = [null, null];
    let drawnLast = [null, null];
    let traceDist = 0;

    initEventListeners(canvas, gl, p, vertsLen,
		       mouseDown, posLast, drawnLast, traceDist,
		       dotThreshold, dotRadius, dotColor, dotOpacity)
}

function dist(a, b) {
    if (!a[0] || !a[1] || !b[0] || !b[1]) {
	return 0;
    }
    const dx = a[0]-b[0];
    const dy = a[1]-b[1];
    return Math.sqrt(dx*dx + dy*dy);
}

export default function museopaint() {
    // DOM
    const rootEl = document.getElementById("game");
    rootEl.style.width = "100vw";
    rootEl.style.height = "100vh";

    const canvas = document.createElement('canvas');

    canvas.width = rootEl.clientWidth;
    canvas.height = rootEl.clientHeight;
    rootEl.appendChild(canvas);

    // Config
    const dotThreshold = 2;
    let dotRadius = 10;
    let dotOpacity = 0.01;
    let dotColor = [0, 20, 255];


    // The drawing
    const gl = canvas.getContext("webgl", {
	alpha: true,
	premultipliedAlpha: false, // important for precision!!
	preserveDrawingBuffer: true,
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
  vec2 normalizedPos = ((pos*dotRadius + dotCenter) / resolution) * 2.0 - 1.0;
  normalizedPos.y *= -1.0;
  gl_Position = vec4(normalizedPos, 0, 1);
  vAlpha = alpha;
}
`;
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

    // Vertex data for a circle
    function generateCircleVertices(numSegments = 32) {
	const verts = [];
	// Center vertex (fully opaque)
	verts.push(0.0, 0.0, 1.0);
	for (let i = 0; i <= numSegments; i++) {
            const angle = (i / numSegments) * Math.PI * 2;
	    console.log(i, numSegments, angle);
            verts.push(Math.cos(angle), Math.sin(angle), 0.0);
	}
	return verts;
    }

    // Create a buffer for the circle's vertices
    const verts = generateCircleVertices(128);
    console.log(verts);
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
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // Standard alpha blending

    // Set up WebGL viewport and clear color
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Click handling
    let mouseDown = false;
    let posLast = [null, null];
    let drawnLast = [null, null];
    let traceDist = 0;

    canvas.addEventListener('mousedown', (ev) => {
	mouseDown = true;
	posLast = [ev.clientX, ev.clientY];
    });

    canvas.addEventListener('mouseup', (ev) => {
	// Single clicks
	if (!drawnLast[0]) {
	    const pos = [ev.clientX, ev.clientY];
	    for (let i = 0; i < 11; ++i) {
		drawDot(pos, dotColor, dotRadius, dotOpacity);
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
		drawDotsOnLine(drawnLast, pos, dotThreshold,
			       dotColor, dotRadius, dotOpacity);
		traceDist = 0;
		drawnLast = pos;
	    }
	    posLast = pos;
	}
    });

    canvas.addEventListener('wheel', (ev) => {
	const shift = ev.getModifierState("Shift")

	if (!shift) {
	    dotRadius += -ev.deltaY/100;
	    dotRadius = Math.round(dotRadius);
	    if (dotRadius < 1) {
		dotRadius = 1;
	    }
	    console.log("dotRadius", dotRadius);
	} else {
	    dotOpacity += -ev.deltaY/100000.0
	    if (dotOpacity < 0) {
		dotOpacity = 0;
	    }
	    if (dotOpacity >= 1) {
		dotOpacity = 1;
	    }
	    console.log("dotOpacity", dotOpacity);
	}
	
    });

    canvas.addEventListener('mouseenter', (ev) => {
	if (mouseDown) {
	    drawnLast = [ev.clientX, ev.clientY];
	}
    });

    function drawDot(pos, color, radius, opacity) {
	const [x, y] = pos;
	const [r, g, b] = color;

	gl.uniform4f(colorLoc, r, g, b, opacity); // Red with alpha 0.5
	// gl.clear(gl.COLOR_BUFFER_BIT);
	gl.uniform1f(dotRadiusLoc, dotRadius);
	gl.uniform2f(dotCenterLoc, x, y);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, verts.length / 3);
	// const grd = gl.createRadialGradient(x, y, 0, x, y, radius, opacity);
	// grd.addColorStop(0, `rgb(${r} ${g} ${b} / ${opacity/100}%)`);
	// // grd.addColorStop(0.3, `rgba(${r} ${g} ${b} / 0.5%)`);
	// grd.addColorStop(1, `rgb(${r} ${g} ${b} / 0%)`);
	// gl.fillStyle = grd;
	
	// let c = `rgba(${r} ${g} ${b} / ${opacity/255.0}%)`;
	// onscreenCtx.fillStyle = c;
	// console.log(c);
	// onscreenCtx.globalCompositeOperation = 'source-over';
	// onscreenCtx.imageSmoothingEnabled = true;
	// onscreenCtx.imageSmoothingQuality = 'high';
	// onscreenCtx.globalAlpha = opacity/100;
	
	// gl.beginPath();
	// gl.arc(x, y, radius, 0, 2*Math.PI, 0);
	// gl.closePath();
	// gl.fill();

	// const w = 2*radius - 1; // Always odd size
	// const h = 2*radius - 1;
	// const imageData = onscreenCtx.getImageData(x-radius, y-radius, w, h);
	// for (let ix = 0; ix < w; ix++) {
	//     for (let iy = 0; iy < h; iy++) {
	// 	const i = (ix + iy * w) * 4;
	// 	const d = dist([radius, radius], [ix+1, iy+1]);
	// 	const alpha = (0.9*radius - d)/radius;
	// 	console.log( imageData.data[i]);
	// 	imageData.data[i] = Math.floor( (1.0-alpha) * imageData.data[i] + alpha * r);
	// 	imageData.data[i + 1] = Math.floor( (1.0-alpha) * imageData.data[i + 1] + alpha * g);
	// 	imageData.data[i + 2] = Math.floor( (1.0-alpha) * imageData.data[i + 2] + alpha * b);
	// 	imageData.data[i + 3] = 255;
	//     }
	// }
	// onscreenCtx.putImageData(imageData, x-radius, y-radius);


	
	// Blit to on screen canvas
	// offscreenCanvas.convertToBlob().then(blob => {
	//     createImageBitmap(blob).then(bitmap => {
	// 	onscreenCtx.drawImage(bitmap, 0, 0);
	//     });
	// });
    }

    function drawDotsOnLine(posLast, pos, minDist,
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
	    drawDot(posNew, color, radius, opacity);
	    posNewPrev = posNew;
	}
	
    }
}

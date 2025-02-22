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
    h = (h + degrees) % 360; // Adjust hue and keep it in range [0, 360]
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

function cubicSplineInterpolate(points, maxDist) {
    // Helper to calculate distance between two points
    const distance = (p1, p2) => Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);

    // Catmull-Rom spline interpolation
    const interpolate = (p0, p1, p2, p3, t) => {
        const t2 = t * t;
        const t3 = t2 * t;

        return [
            0.5 * ((2 * p1[0]) +
                   (-p0[0] + p2[0]) * t +
                   (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
                   (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
            0.5 * ((2 * p1[1]) +
                   (-p0[1] + p2[1]) * t +
                   (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
                   (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
        ];
    };

    // Result array for interpolated points
    const result = [];
    if (points.length === 0) {
	return result;
    }

    // Loop through all segments
    for (let i = 0; i < points.length - 1; i++) {
        // Get 4 control points: p0, p1, p2, p3
        const p0 = points[i - 1 < 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1 >= points.length ? points.length - 1 : i + 1];
        const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];

        // Add the current point to the result
        if (result.length === 0) result.push(p1);

        // Interpolate between p1 and p2
        let t = 0;
        let prev = p1;

        while (t < 1) {
            t += 0.01; // Step size for parameter t
            const pt = interpolate(p0, p1, p2, p3, t);

            // Check distance to previous point
            if (dist(prev, pt) >= maxDist) {
                result.push(pt);
                prev = pt;
            }
        }
    }

    // Add the last point
    result.push(points[points.length - 1]);

    return result;
}


function renderStroke(gl, strokeFramebuffer, strokeShader, drawTool, drawState) {
    const [r, g, b] = drawTool.color;

    const colorLoc = gl.getUniformLocation(strokeShader, "color");
    const dotRadiusLoc = gl.getUniformLocation(strokeShader, "dotRadius");
    const dotCenterLoc = gl.getUniformLocation(strokeShader, "dotCenter");

    gl.bindFramebuffer(gl.FRAMEBUFFER, strokeFramebuffer.fbo);

    gl.useProgram(strokeShader);

    // Enable blending for alpha blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // Standard 

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform4f(colorLoc, r, g, b, drawTool.flow);
    gl.uniform1f(dotRadiusLoc, drawTool.radius);

    gl.bindVertexArray(drawTool.vao);

    const interpolatedCoords = cubicSplineInterpolate(drawState.strokeCoords, drawTool.spacing);

    for (const [x, y] of interpolatedCoords) {
	gl.uniform2f(dotCenterLoc, x, y);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, drawTool.numSegments+2 );
    }
}

// Render a texture from a FB to another FB
function renderFramebuffer(gl,
			   srcTexture, dstFramebufferFbo,
			   quadShader, quadVao,
			   gammaCorrect) {
    // Render default framebuffer (canvas)
    gl.bindFramebuffer(gl.FRAMEBUFFER, dstFramebufferFbo);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // Standard 

    gl.useProgram(quadShader);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, srcTexture);

    gl.uniform1i(gl.getUniformLocation(quadShader, "uTexture"), 0);
    gl.uniform1i(gl.getUniformLocation(quadShader, "gammaCorrect"), gammaCorrect);

    gl.bindVertexArray(quadVao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function finalizeStroke(gl, strokeFramebuffer, paintingFramebuffer, quadShader, quadVao) {
    console.log("Finalize stroke");

    // Blend stroke to painting
    renderFramebuffer(gl, strokeFramebuffer.texture, paintingFramebuffer.fbo,
		      quadShader, quadVao, false);
}

// Vertex data for a circle
function generateCircleVertices(numSegments) {
    const verts = [];
    // Center vertex (fully opaque)
    verts.push(0.0, 0.0); //, 1.0);
    for (let i = 0; i <= numSegments; i++) {
        const angle = (i / numSegments) * Math.PI * 2;
	// Outside vertices (fully opaque)
        verts.push(Math.cos(angle), Math.sin(angle)); //, 1.0);
    }
    return verts;
}

function generateDrawTool(gl, shader, numSegments) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vertices = generateCircleVertices(numSegments)
    console.log(vertices);
    // Create a VBO (Vertex Buffer Object)
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Enable position attribute (location 0)
    const posLoc = gl.getAttribLocation(shader, 'pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, (2 + 0) * Float32Array.BYTES_PER_ELEMENT, 0);

    // Enable alpha attribute (location 1)
    // const alphaLoc = gl.getAttribLocation(shaderProgram, 'alpha');
    // gl.enableVertexAttribArray(alphaLoc);
    // gl.vertexAttribPointer(alphaLoc, 1, gl.FLOAT, false, (2 + 1) * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);

    // Unbind VAO
    gl.bindVertexArray(null);
    
    return [vao, vertices.length];
}

function generateQuad(gl) {
    // Create a VAO (Vertex Array Object) for the quad
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Define a fullscreen quad (two triangles)
    const vertices = new Float32Array([
        -1, -1,  0, 0,  // Bottom-left  (X, Y, U, V)
         1, -1,  1, 0,  // Bottom-right
        -1,  1,  0, 1,  // Top-left
         1,  1,  1, 1   // Top-right
    ]);

    // Create a VBO (Vertex Buffer Object)
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Enable position attribute (location 0)
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);

    // Enable texture coordinate attribute (location 1)
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);

    // Unbind VAO
    gl.bindVertexArray(null);
    
    return vao;
}

function createFramebuffer(gl, w, h) {
    let fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return { fbo, texture };
}

function createProgram(gl, vs, fs) {
    const p = gl.createProgram();
    [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, i) => {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, [vs, fs][i]);
	gl.compileShader(shader);
	gl.attachShader(p, shader);
    });
    gl.linkProgram(p);
    gl.useProgram(p);
    return p;
}

function initGl(canvas, drawTool) {
    // The drawing
    const gl = canvas.getContext("webgl2", {
	alpha: false, // nothing behind the canvas to shine through
	premultipliedAlpha: false, // important for precision!!
	preserveDrawingBuffer: false,
    });

    // Shaders
    const strokeVs = `
precision highp float;
attribute vec2 pos;
// attribute vec2 alpha;

uniform vec2 resolution;
uniform vec2 dotCenter;
uniform float dotRadius;

void main() {
  vec2 normalizedPos = ((pos * dotRadius + dotCenter) / resolution) * 2.0 - 1.0;
  normalizedPos.y *= -1.0;
  gl_Position = vec4(normalizedPos, 0.1, 1.0);
}`;

    const strokeFs = `
precision highp float;
uniform vec4 color;
uniform vec2 resolution;
uniform vec2 dotCenter;
uniform float dotRadius;

void main() {
  vec2 fragCoordXy = gl_FragCoord.xy;
  fragCoordXy.y = (-1.0 * (fragCoordXy.y - resolution.y/2.0)) + resolution.y/2.0;
  float distNorm = distance(fragCoordXy, dotCenter) / dotRadius;
  float opacity; // = max(1.0 - distNorm, 0.0);
  // float f = sin((opacity - 0.5)*(3.1416));
  //float f = opacity;
  float f;
  float cutoff = 0.7;
  if (distNorm < cutoff) {
      opacity = 1.0;
  } else {
      float k = 1.0/(cutoff - 1.0);
      float c = -k;
      opacity = clamp(distNorm * k + c, 0.0, 1.0);
  }
  float alpha = color.a * opacity;
  // if (alpha < 0.04) discard;
  gl_FragColor = vec4(color.rgb * alpha, alpha);
}`;
    const strokeShader = createProgram(gl, strokeVs, strokeFs);

    // Pass resolution to shader
    const resLoc = gl.getUniformLocation(strokeShader, "resolution");
    gl.uniform2f(resLoc, canvas.width, canvas.height);

    const quadVs = `#version 300 es
precision highp float;

layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aTexCoord;

out vec2 vTexCoord;
void main() {
    vTexCoord = aTexCoord;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}`;
    const quadFs = `#version 300 es
precision highp float;

// Texture sampler
uniform sampler2D uTexture;
uniform bool gammaCorrect;

// Input from vertex shader
in vec2 vTexCoord;

// Output color
out vec4 fragColor;

vec4 linearToSRGB(vec4 color) {
    return vec4(mix(12.92 * color.xyz, 
                    1.055 * pow(color.xyz, vec3(1.0 / 2.4)) - 0.055, 
                    step(0.0031308, color.xyz)),
                color.w);
}

vec4 fromLinear(vec4 linearRGB)
{
    bvec3 cutoff = lessThan(linearRGB.rgb, vec3(0.0031308));
    vec3 higher = vec3(1.055)*pow(linearRGB.rgb, vec3(1.0/2.4)) - vec3(0.055);
    vec3 lower = linearRGB.rgb * vec3(12.92);

    return vec4(mix(higher, lower, cutoff), linearRGB.a);
}

void main() {
    // Sample the texture at the given UV coordinate
    vec4 tNonPremul = texture(uTexture, vTexCoord);
    // vec4 t = vec4(tNonPremul.xyz * tNonPremul.w, tNonPremul.w);
    //vec4 t = vec4(tNonPremul.xyz * tNonPremul.w, 1.0);
    if (gammaCorrect) {
        fragColor = linearToSRGB(tNonPremul);
    } else {
        fragColor = tNonPremul;
    }
}`;
    const quadShader = createProgram(gl, quadVs, quadFs);
    // Set up WebGL viewport and clear color
    gl.viewport(0, 0, canvas.width, canvas.height);

    const [ drawToolVao, vertsLen ] = generateDrawTool(gl, strokeShader, drawTool.numSegments);
    const quadVao = generateQuad(gl);

    const strokeFramebuffer = createFramebuffer(gl, canvas.width, canvas.height);
    const paintingFramebuffer = createFramebuffer(gl, canvas.width, canvas.height);

    drawTool.vertsLen = vertsLen;
    drawTool.vao = drawToolVao;
    
    return [gl,
	    quadShader, quadVao,
	    strokeFramebuffer, strokeShader,
	    paintingFramebuffer];
}

function initEventListeners(canvas, gl,
			    strokeShader,
			    strokeFramebuffer,
			    paintingFramebuffer,
			    quadShader, quadVao,
			    drawState, drawTool) {
    function drawStart(ev) {
	ev.preventDefault();

	let x, y;
	if (ev.type === 'touchstart') {
	    console.log('touchstart');
	    const ts = ev.changedTouches;
	    if (ts.length > 0) {
		const touch = ts.item(0);
		drawState.touchEventId = touch.identifier;
		[x, y] = [touch.cientX, touch.clientY];
	    }
	} else {
	    [x, y] = [ev.clientX, ev.clientY];
	}

	drawState.mouseDown = true;
	drawState.posLast = [ev.clientX, ev.clientY];
    }
    canvas.addEventListener('mousedown', drawStart);
    canvas.addEventListener('touchstart', drawStart);


    function toolMove(ev) {
	ev.preventDefault();

	let x, y;
	if (ev.type === 'touchmove' && drawState.touchEventId !== null && ev.changedTouches.item(drawState.touchEventId)) {
	    console.log("touchmove");
	    const touch = ev.changedTouches.item(drawState.touchEventId);
	    [x, y] = [touch.clientX, touch.clientY];
	} else {
	    [x, y] = [ev.clientX, ev.clientY];
	}

	if (drawState.mouseDown) {
	    const pos = [x, y];
 	    const d = dist(pos, drawState.posLast);

	    drawState.traceDist += d;

	    if (drawState.traceDist >= drawTool.spacing) {
		drawState.strokeCoords.push(pos);

		drawState.traceDist = 0;
		drawState.drawnLast = pos;
	    }

	    drawState.posLast = pos;
	}
    }
    canvas.addEventListener('mousemove', toolMove);
    canvas.addEventListener('touchmove', toolMove);


    function drawEnd(ev) {
	ev.preventDefault();

	// This touchend is not for the touch tracked
	if (ev.type === 'touchend' ) {
	    console.log("touchend");
	    if (drawState.touchEventId !== null && ev.changedTouches.item(drawState.touchEventId)) {
		drawState.touchEventId = null;
	    } else {
		return;
	    }
	}

	// Single clicks
	if (!drawState.drawnLast[0]) {
	    const pos = [ev.clientX, ev.clientY];
	    for (let i = 0; i < 1; ++i) {
		//drawDot(gl, strokeShader, pos, vertsLen, dotColor, dotRadius, dotFlow);
	    }
	}
	finalizeStroke(gl, strokeFramebuffer, paintingFramebuffer, quadShader, quadVao);

	drawState.strokeCoords = [];
	drawState.mouseDown = false;
	drawState.drawnLast = [null, null];
    }
    canvas.addEventListener('mouseup', drawEnd);
    canvas.addEventListener('touchend', drawEnd);
    canvas.addEventListener('touchcancel', drawEnd);

    // canvas.addEventListener('wheel', (ev) => {
    // 	const shift = ev.getModifierState("Shift");
    // 	const alt = ev.getModifierState("Alt");
    // 	if (alt && shift) {
    // 	    let [r, g, b] = drawTool.color;
    // 	    drawTool.color = adjustHue(r, g, b, ev.deltaY/10.0);
    // 	    console.log("drawTool.color", drawTool.color);
    // 	} else if (shift) {
    // 	    drawTool.flow += -ev.deltaY/10000.0
    // 	    if (drawTool.flow < 0) {
    // 		drawTool.flow = 0;
    // 	    }
    // 	    if (drawTool.flow >= 1) {
    // 		drawTool.flow = 1;
    // 	    }
    // 	    console.log("drawTool.flow", drawTool.flow);
    // 	} else {
    // 	    drawTool.radius += -ev.deltaY/100;
    // 	    drawTool.radius = Math.round(drawTool.radius);
    // 	    if (drawTool.radius < 1) {
    // 		drawTool.radius = 1;
    // 	    }
    // 	    console.log("drawTool.radius", drawTool.radius);
    // 	}
    // });

    canvas.addEventListener('mouseenter', (ev) => {
	if (drawState.mouseDown) {
	    drawState.drawnLast = [ev.clientX, ev.clientY];
	}
    });
}

function hex2rgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [parseInt(result[1], 16) / 256, parseInt(result[2], 16) / 256, parseInt(result[3], 16) / 256];
}

export default function museopaint() {
    // DOM
    const rootEl = document.getElementById('game');
    rootEl.style.width = "100vw";
    rootEl.style.height = "100vh";

    const gizmosHtml = `
<div style="" class="gizmos">
  <input type="color" id="colorPicker" class="colorPicker" value="#00aaaa">
  <button id="sizeSmall" class="sizeButton" style="background-image: url(/static/django_jigsaw_puzzle/images/button-small.svg)"></button>
  <button id="sizeMedium" class="sizeButton" style="background-image: url(/static/django_jigsaw_puzzle/images/button-medium.svg)"></button>
  <button id="sizeLarge" class="sizeButton" style="background-image: url(/static/django_jigsaw_puzzle/images/button-large.svg)"></button>
  <button id="clear" class="sizeButton" style="background-image: url(/static/django_jigsaw_puzzle/images/button-clear.svg)"></button>
</div>
`;
    rootEl.innerHTML = gizmosHtml;

    const colorPicker = document.getElementById('colorPicker');
    const buttonSizeSmall = document.getElementById('sizeSmall');
    const buttonSizeMedium = document.getElementById('sizeMedium');
    const buttonSizeLarge = document.getElementById('sizeLarge');
    const buttonClear = document.getElementById('clear');
    const canvas = document.createElement('canvas');
    // canvas.style = "position: absolute; top: 0, left: 0; z-index: 0;"

    canvas.width = rootEl.clientWidth;
    canvas.height = rootEl.clientHeight;
    rootEl.appendChild(canvas);

    // Config
    let drawTool = {
	color: undefined,
	flow: 0.8,
	radius: 5,
	spacing: 1,
	numSegments: 16,
	vertsLen: null,
	vao: null,
    }

    colorPicker.addEventListener('input', (ev) => {
	drawTool.color = hex2rgb(ev.target.value);
    });
    window.addEventListener('load', (ev) => {
	drawTool.color = hex2rgb(colorPicker.value);
    });
    

    buttonSizeSmall.addEventListener('click', (ev) => {
	drawTool.radius = 2;
    });

    buttonSizeMedium.addEventListener('click', (ev) => {
	drawTool.radius = 6;
    });

    buttonSizeLarge.addEventListener('click', (ev) => {
	drawTool.radius = 20;
    });


    const [gl,
	   quadShader, quadVao,
	   strokeFramebuffer, strokeShader,
	   paintingFramebuffer,
	   drawToolVao, vertsLen] = initGl(canvas, drawTool);

    
    // Click handling
    let drawState = {
	mouseDown: false,
	posLast: [null, null],
	drawnLast: [null, null],
	traceDist: 0,
	strokeCoords: [],
	touchEventId: null,
    };


    buttonClear.addEventListener('click', (ev) => {
	gl.bindFramebuffer(gl.FRAMEBUFFER, strokeFramebuffer.fbo);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.bindFramebuffer(gl.FRAMEBUFFER, paintingFramebuffer.fbo);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
    });


    initEventListeners(canvas, gl,
		       strokeShader,
		       strokeFramebuffer,
		       paintingFramebuffer,
		       quadShader, quadVao,
		       drawState, drawTool);


    function render() {
	// Clear BG
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	if (drawState.mouseDown) {
	    console.log("Render mouse down");
            // Render accumulated stroke to intermediary
            // framebuffer. This buffer is re-rendered on every frame
            // although it could be done incrementally.
            renderStroke(gl, strokeFramebuffer, strokeShader, drawTool, drawState);
	}

        // Draw painting on default framebuffer
        renderFramebuffer(gl,
			  paintingFramebuffer.texture, null,
			  quadShader, quadVao, true);

	if (drawState.mouseDown) {
            // Overlay stroke framebuffer onto default framebuffer so people see what's happening
            renderFramebuffer(gl,
			      strokeFramebuffer.texture, null,
			      quadShader, quadVao, true);
	}

	requestAnimationFrame(render);
    }

    // Init render loop
    render();
    requestAnimationFrame(render);
}

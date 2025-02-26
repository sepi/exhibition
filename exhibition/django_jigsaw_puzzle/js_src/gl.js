import { dist } from './common.js';

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

export function renderStroke(gl, width, height,
			     strokeFramebuffer, strokeShader,
			     drawTool, strokeCoords) {
    const [r, g, b] = drawTool.color;

    const resLoc = gl.getUniformLocation(strokeShader, "resolution");
    const colorLoc = gl.getUniformLocation(strokeShader, "color");
    const dotRadiusLoc = gl.getUniformLocation(strokeShader, "dotRadius");
    const dotCenterLoc = gl.getUniformLocation(strokeShader, "dotCenter");

    gl.bindFramebuffer(gl.FRAMEBUFFER, strokeFramebuffer.fbo);
    gl.viewport(0, 0, width, height);

    gl.useProgram(strokeShader);

    // Enable blending for alpha blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // Standard 

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Pass resolution to shader
    gl.uniform2f(resLoc, width, height);
    gl.uniform4f(colorLoc, r, g, b, drawTool.flow);
    gl.uniform1f(dotRadiusLoc, drawTool.radius);

    gl.bindVertexArray(drawTool.vao);

    for (const [x, y] of strokeCoords) {
	gl.uniform2f(dotCenterLoc, x, y);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, drawTool.numSegments+2 );
    }
}

// Render a texture from a FB to another FB
export function renderFramebuffer(gl, width, height,
				  srcTexture, dstFramebufferFbo,
				  quadShader, quadVao,
				  gammaCorrect) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, dstFramebufferFbo);
    gl.viewport(0, 0, width, height);

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

export function clearToDrawToolColor(gl, drawState, drawTool) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, drawState.strokeFramebuffer.fbo);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindFramebuffer(gl.FRAMEBUFFER, drawState.paintingFramebuffer.fbo);
    gl.clearColor(drawTool.color[0], drawTool.color[1], drawTool.color[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function generateDrawTool(gl, shader, numSegments) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vertices = generateCircleVertices(numSegments)

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

export function recreateFramebuffer(gl, fb, w, h) {
    const newFb = createFramebuffer(gl, w, h);

    // TODO: copy old texture to new

    gl.deleteFramebuffer(fb.fbo);
    return newFb;
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

export function initGl(canvas, drawTool) {
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

vec4 toLinear(vec4 srgbColor) {
  vec3 rgb = srgbColor.rgb;
  vec3 linearRGB = mix(rgb / 12.92, pow((rgb + 0.055) / 1.055, vec3(2.4)), step(0.04045, rgb));
  return vec4(srgbColor.rgb, srgbColor.a);
}


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
  vec4 colorLinear = toLinear(color);
  //vec4 colorLinear = color;
  float alpha = colorLinear.a * opacity;
  gl_FragColor = vec4(colorLinear.rgb * alpha, alpha);
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
    // // Set up WebGL viewport and clear color
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

import { renderStroke, renderFramebuffer, recreateFramebuffer,
	 clearToDrawToolColor, clearToColor, initGl } from './gl.js';
import { dist, getCSRFToken, linearToSRGB } from './common.js';

let clear;
export let drawTool;
export let drawState;

function rgb2hsl(r,g,b) {
  let v=Math.max(r,g,b), c=v-Math.min(r,g,b), f=(1-Math.abs(v+v-c-1)); 
  let h= c && ((v==r) ? (g-b)/c : ((v==g) ? 2+(b-r)/c : 4+(r-g)/c)); 
  return [60*(h<0?h+6:h), f ? c/f : 0, (v+v-c)/2];
}

export
function hslToRgb(h, s, l){
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r, g, b];
}

function hsl2rgb(h,s,l) {
   let a=s*Math.min(l,1-l);
   let f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);
   return [f(0),f(8),f(4)];
}

// Adjust the hue by a certain degree
export
function adjustHue(color, degrees) {
    const [r, g, b] = color;
    let [h, s, l] = rgb2hsl(r, g, b);
    h = (h + degrees) % 360; // Adjust hue and keep it in range [0, 360]
    return hsl2rgb(h, s, l);
}

export
function adjustLightness(color, dl) {
    const [r, g, b] = color;
    let [h, s, l] = rgb2hsl(r, g, b);
    l += dl;
    return hsl2rgb(h, s, Math.max(Math.min(l, 1.0), 0.0));
}

function adjustSaturation(color, ds) {
    const [r, g, b] = color;
    let [h, s, l] = rgb2hsl(r, g, b);
    s += ds;
    return hsl2rgb(h, s, Math.max(Math.min(l, 1.0), 0.0));
}

function hex2rgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [parseInt(result[1], 16) / 256, parseInt(result[2], 16) / 256, parseInt(result[3], 16) / 256];
}

export
function cubicSplineInterpolate(points, maxDist) {
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

        for (let t = 0.0; t < 1.0; t += 0.01) {
            const pt = interpolate(p0, p1, p2, p3, t);

            // Check distance to previous point
            if (t === 0.0 || dist(prev, pt) >= maxDist) {
                result.push(pt);
                prev = pt;
            }
        }
    }

    // Add the last point
    result.push(points[points.length - 1]);

    return result;
}

function finalizeStroke(gl, canvas, drawState, quadShader, quadVao) {
    // Blend stroke to painting
    renderFramebuffer(gl, canvas.width, canvas.height,
		      drawState.strokeFramebuffer.texture, drawState.paintingFramebuffer.fbo,
		      quadShader, quadVao, false);
}

function findTouchWithId(touchList, id) {
    for (let t of touchList) {
	if (t.identifier === id) {
	    return t;
	}
    }
    return null;
}
    
function touchOffset(ev, touchId) {
    var rect = ev.target.getBoundingClientRect();
    const touch = findTouchWithId(ev.changedTouches, touchId);
    return [touch.clientX - rect.left,
	    touch.clientY - rect.top];
}

function showModal(title, body, actions) {
    const modalTitle = document.querySelector("#modal .modal-title");
    modalTitle.innerHTML = title
    const modalBody = document.querySelector("#modal .modal-body");
    modalBody.innerHTML = body;

    const modalFooter = document.querySelector("#modal .modal-footer");
    modalFooter.innerHTML = '';
    for (let action of actions) {
	const [label, fun] = action;
	let button;
	button = document.createElement('button');
	if (fun === 'close') {
	    // Only close. This always happens
	} else {
	    button.addEventListener('click', fun);
	}
	button.setAttribute('data-bs-dismiss', 'modal');
	button.className = 'btn btn-secondary';
	button.innerHTML = label;
	modalFooter.appendChild(button);
    }
    
    const modal = new bootstrap.Modal('#modal');
    modal.show();
}

function saveCanvasToServer(blob) {
    const csrfToken = getCSRFToken();

    const formData = new FormData();
    const dateTime = (new Date()).toISOString();
    formData.append('file', blob, `${dateTime}.png`);
    
    fetch('/games/image_upload', {
	method: 'POST',
	headers: {
	    'X-CSRFToken': csrfToken
	},
	body: formData
    }).then(response => response.json())
	.then(data => {
	    const l = window.location;
	    const url = `${l.protocol}//${l.host}${data.original_image}`;
	    showModal("Scan this QR-Code to take home your work!",
		      data.qr_code_svg,
		      [['Done', 'close']]);
	})
	.catch(error => {
	    console.error('Error:', error);
	});
}

function initEventListeners(canvas, gl,
			    strokeShader,
			    quadShader, quadVao,
			    drawState, drawTool) {
    function drawStart(ev) {
	ev.preventDefault();

	let x, y;
	if (ev.type === 'touchstart') {
	    const ts = ev.changedTouches;
	    // FIXME: Actually record multiple touches starting
	    if (ts.length > 0) {
		const touch = ts.item(0);
		drawState.touchEventId = touch.identifier;
		[x, y] = touchOffset(ev, touch.identifier);
	    }
	} else { // Click
	    [x, y] = [ev.offsetX, ev.offsetY];
	}

	drawState.painting = true;
	drawState.strokeCoords.push([x, y]);
    }
    canvas.addEventListener('mousedown', drawStart);
    canvas.addEventListener('touchstart', drawStart);
    canvas.addEventListener('mouseenter', (ev) => {
	if (drawState.paintings) {
	    drawStart();
	}
    });

    function toolMove(ev) {
	ev.preventDefault();
	
	let x, y;
	if (ev.type === 'touchmove' && drawState.touchEventId !== null) {
	    const touch = findTouchWithId(ev.changedTouches, drawState.touchEventId);
	    if (touch) {
		[x, y] = touchOffset(ev, touch.identifier);
	    }
	} else {
	    [x, y] = [ev.offsetX, ev.offsetY];
	}

	if (drawState.painting) {
	    const pos = [x, y];
	    drawState.strokeCoords.push(pos);
	}
    }
    canvas.addEventListener('mousemove', toolMove);
    canvas.addEventListener('touchmove', toolMove);


    function drawEnd(ev, leave=false) {
	ev.preventDefault();

	console.log("drawend");

	// This touchend is not for the touch tracked
	if (ev.type === 'touchend' ) {
	    if (drawState.touchEventId !== null && ev.changedTouches.item(drawState.touchEventId)) {
		drawState.touchEventId = null;
	    } else {
		return;
	    }
	}
	
	finalizeStroke(gl, canvas, drawState, quadShader, quadVao);

	drawState.strokeCoords = [];
	if (!leave) {
	    drawState.painting = false;
	}
    }
    canvas.addEventListener('mouseup', drawEnd);
    // Also record mouseup events when user releases outside of canvas
    window.addEventListener('mouseup', (ev) => {
	drawState.painting = false;
    });
    canvas.addEventListener('touchend', drawEnd);
    canvas.addEventListener('touchcancel', drawEnd);
    canvas.addEventListener('mouseleave', (ev) => {
	drawEnd(ev, true);
    });
}

function resizeCanvas(canvas, width, height, canvasBorderWidth) {
    canvas.width = width;
    canvas.height = height;
    canvas.style.border = `solid ${canvasBorderWidth}px #eee`;
}

export function init(canvas) {
    const initialColor = [0, 0, 0];
    const initialRadii = [4, 8, 22, 34];

    const canvasBorderWidth = 56;

    const drawWidth = window.innerWidth - 2 * canvasBorderWidth;
    const drawHeight = window.innerHeight - 2 * canvasBorderWidth;
    resizeCanvas(canvas, drawWidth, drawHeight, canvasBorderWidth);
    
    // Config
    drawTool = {
	color: initialColor,
	radius: initialRadii[0],
	flow: 0.8,
	spacing: 1,
	numSegments: 16,
	vertsLen: null,
	vao: null,
    }

    const [gl,
	   quadShader, quadVao,
	   strokeFramebuffer, strokeShader,
	   paintingFramebuffer,
	   drawToolVao, vertsLen] = initGl(canvas, drawTool);

    // Click handling
    drawState = {
	painting: false,
	traceDist: 0,
	strokeCoords: [],
	touchEventId: null,
	paintingFramebuffer: paintingFramebuffer,
	strokeFramebuffer: strokeFramebuffer,
	saveCanvas: false,
	// clearCanvas: false,
    };

    // deal with resizing by changing canvas size and re-creating framebuffers
    window.addEventListener('resize', (ev) => {
	const drawWidth = window.innerWidth - 2 * canvasBorderWidth;
	const drawHeight = window.innerHeight - 2 * canvasBorderWidth;
	resizeCanvas(canvas, drawWidth, drawHeight, canvasBorderWidth);
	drawState.strokeFramebuffer = recreateFramebuffer(gl, drawState.strokeFramebuffer, drawWidth, drawHeight);
	drawState.paintingFramebuffer = recreateFramebuffer(gl, drawState.paintingFramebuffer, drawWidth, drawHeight);
    });

    // buttonClear.addEventListener('click', (ev) => {
    // 	clear = () =>  clearToColor(gl, drawState, [255, 255, 255]);
    // 	showModal("Clear page", "Do you really want to clear and loose your work?",
    // 		  [
    // 		      ["Yes", clear],
    // 		      ["No", "close"],
    // 		  ])
    // });

    // buttonSave.addEventListener('click', (ev) => {
    // 	drawState.saveCanvas = true;
    // });

    function render(reqAnimationFrame) {
	gl.viewport(0, 0, canvas.width, canvas.height);
	
	// Clear BG
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	if (drawState.painting) {
            // Render accumulated stroke to intermediary
            // framebuffer. This buffer is re-rendered on every frame
            // although it could be done incrementally.
	    let coords = [];
	    if (drawState.strokeCoords.length === 1) { // single click or tap
		for (let i = 0; i < 10; ++i) {
		    coords.push(drawState.strokeCoords[0]);
		}
	    } else {
		coords = cubicSplineInterpolate(drawState.strokeCoords, drawTool.spacing);
	    }
            renderStroke(gl, canvas.width, canvas.height,
			 drawState.strokeFramebuffer, strokeShader, drawTool, coords);
	}

        // Draw painting on default framebuffer
        renderFramebuffer(gl, canvas.width, canvas.height,
			  drawState.paintingFramebuffer.texture, null,
			  quadShader, quadVao, true);

	if (drawState.saveCanvas) {
	    // This must happen in same event as rendering due to GL double buffering
	    canvas.toBlob(saveCanvasToServer);
	    drawState.saveCanvas = false;
	}

	if (drawState.painting) {
            // Overlay stroke framebuffer onto default framebuffer so people see what's happening
            renderFramebuffer(gl, canvas.width, canvas.height,
			      drawState.strokeFramebuffer.texture, null,
			      quadShader, quadVao, true);
	}

	if (reqAnimationFrame) {
	    requestAnimationFrame(() => render(true));
	}
    }

    initEventListeners(canvas, gl,
		       strokeShader,
		       quadShader, quadVao,
		       drawState, drawTool);

    // Init render loop
    requestAnimationFrame(() => render(true));
}

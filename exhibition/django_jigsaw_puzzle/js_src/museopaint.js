import { renderStroke, renderFramebuffer, initGl } from './gl.js' 
import { dist } from './common.js';

function cubicSplineInterpolate(points, maxDist) {
    // Helper to calculate distance between two points
    // const distance = (p1, p2) => Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);

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

function hex2rgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [parseInt(result[1], 16) / 256, parseInt(result[2], 16) / 256, parseInt(result[3], 16) / 256];
}

function finalizeStroke(gl, strokeFramebuffer, paintingFramebuffer, quadShader, quadVao) {
    // Blend stroke to painting
    renderFramebuffer(gl, strokeFramebuffer.texture, paintingFramebuffer.fbo,
		      quadShader, quadVao, false);
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
	drawState.strokeCoords.push([x, y]);
    }
    canvas.addEventListener('mousedown', drawStart);
    canvas.addEventListener('touchstart', drawStart);

    
    function toolMove(ev) {
	ev.preventDefault();
	let x, y;
	if (ev.type === 'touchmove' && drawState.touchEventId !== null && ev.changedTouches.item(drawState.touchEventId)) {
	    const touch = ev.changedTouches.item(drawState.touchEventId);
	    [x, y] = [touch.clientX, touch.clientY];
	} else {
	    [x, y] = [ev.clientX, ev.clientY];
	}

	if (drawState.mouseDown) {
	    const pos = [x, y];
	    drawState.strokeCoords.push(pos);
	}
    }
    canvas.addEventListener('mousemove', toolMove);
    canvas.addEventListener('touchmove', toolMove);


    function drawEnd(ev) {
	ev.preventDefault();

	// This touchend is not for the touch tracked
	if (ev.type === 'touchend' ) {
	    if (drawState.touchEventId !== null && ev.changedTouches.item(drawState.touchEventId)) {
		drawState.touchEventId = null;
	    } else {
		return;
	    }
	}
	
	finalizeStroke(gl, strokeFramebuffer, paintingFramebuffer, quadShader, quadVao);

	drawState.strokeCoords = [];
	drawState.mouseDown = false;
    }
    canvas.addEventListener('mouseup', drawEnd);
    canvas.addEventListener('touchend', drawEnd);
    canvas.addEventListener('touchcancel', drawEnd);


    canvas.addEventListener('mouseenter', (ev) => {
	if (drawState.mouseDown) {
	    // drawState.drawnLast = [ev.clientX, ev.clientY];
	}
    });
}

function addColorButton(parent, color, setColor) {
    const button = document.createElement('button');
    button.id = `button${color}`;
    button.style = `background-color: ${color};`;
    button.className = 'color-button';

    button.addEventListener('click', (ev) => {
	ev.preventDefault();
	setColor(hex2rgb(color));
    });

    parent.appendChild(button);

    return button;
}

export default function museopaint() {
    // DOM
    const rootEl = document.getElementById('game');
    rootEl.style.width = "100vw";
    rootEl.style.height = "100vh";

    const gizmosHtml = `
<div class="gizmos-left gizmos">
  <input type="color" id="colorPicker" class="color-picker" value="#00aaaa">

  <button id="buttonClear" class="size-button" style="background-image: url(/static/django_jigsaw_puzzle/images/button-clear.svg)"></button>
  <button id="buttonSizeSmall" class="size-button" style="background-image: url(/static/django_jigsaw_puzzle/images/button-small.svg)"></button>
  <button id="buttonSizeMedium" class="size-button" style="background-image: url(/static/django_jigsaw_puzzle/images/button-medium.svg)"></button>
  <button id="buttonSizeLarge" class="size-button" style="background-image: url(/static/django_jigsaw_puzzle/images/button-large.svg)"></button>
</div>

<div id="colorGizmos" class="gizmos-bottom gizmos">
</div>
`;
    rootEl.innerHTML = gizmosHtml;

    const canvas = document.createElement('canvas');

    const colorPicker = document.getElementById('colorPicker');

    const buttonSizeSmall = document.getElementById('buttonSizeSmall');
    const buttonSizeMedium = document.getElementById('buttonSizeMedium');
    const buttonSizeLarge = document.getElementById('buttonSizeLarge');


    const buttonClear = document.getElementById('buttonClear');

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

    const colorGizmos = document.getElementById('colorGizmos');
    const colorButtons = {};
    function setColor(color) {
	drawTool.color = color;
    }
    for (let color of ["#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF"]) {
	colorButtons[color] = addColorButton(colorGizmos, color, setColor);
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

    function render(reqAnimationFrame) {
	// Clear BG
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	if (drawState.mouseDown) {
            // Render accumulated stroke to intermediary
            // framebuffer. This buffer is re-rendered on every frame
            // although it could be done incrementally.
	    let coords = [];
	    if (drawState.strokeCoords.length === 1) { // single click or tap
		for (let i = 0; i < 5; ++i) {
		    coords.push(drawState.strokeCoords[0]);
		}
	    } else {
		coords = cubicSplineInterpolate(drawState.strokeCoords, drawTool.spacing);
	    }
            renderStroke(gl, strokeFramebuffer, strokeShader, drawTool, coords);
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

	if (reqAnimationFrame) {
	    requestAnimationFrame(() => render(true));
	}
    }

    initEventListeners(canvas, gl,
		       strokeShader,
		       strokeFramebuffer,
		       paintingFramebuffer,
		       quadShader, quadVao,
		       drawState, drawTool);

    // Init render loop
    requestAnimationFrame(() => render(true));
}

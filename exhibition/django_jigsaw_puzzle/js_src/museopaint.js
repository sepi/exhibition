import { renderStroke, renderFramebuffer, recreateFramebuffer, clearToDrawToolColor, initGl } from './gl.js' 
import { dist, getCSRFToken } from './common.js';

function rgb2hsl(r,g,b) {
  let v=Math.max(r,g,b), c=v-Math.min(r,g,b), f=(1-Math.abs(v+v-c-1)); 
  let h= c && ((v==r) ? (g-b)/c : ((v==g) ? 2+(b-r)/c : 4+(r-g)/c)); 
  return [60*(h<0?h+6:h), f ? c/f : 0, (v+v-c)/2];
}

function hsl2rgb(h,s,l) {
   let a=s*Math.min(l,1-l);
   let f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);
   return [f(0),f(8),f(4)];
}

// Adjust the hue by a certain degree
function adjustHue(color, degrees) {
    const [r, g, b] = color;
    let [h, s, l] = rgb2hsl(r, g, b);
    h = (h + degrees) % 360; // Adjust hue and keep it in range [0, 360]
    return hsl2rgb(h, s, l);
}

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


function initEventListeners(canvas, gl,
			    strokeShader,
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
		[x, y] = [touch.offsetX, touch.offsetY];
	    }
	} else {
	    [x, y] = [ev.offsetX, ev.offsetY];
	}

	drawState.mouseDown = true;
	drawState.strokeCoords.push([x, y]);
    }
    canvas.addEventListener('mousedown', drawStart);
    canvas.addEventListener('touchstart', drawStart);
    canvas.addEventListener('mouseenter', (ev) => {
	if (drawState.mouseDowns) {
	    drawStart();
	}
    });
    
    function toolMove(ev) {
	ev.preventDefault();
	let x, y;
	if (ev.type === 'touchmove' && drawState.touchEventId !== null && ev.changedTouches.item(drawState.touchEventId)) {
	    const touch = ev.changedTouches.item(drawState.touchEventId);
	    [x, y] = [touch.offsetX, touch.offsetY];
	} else {
	    [x, y] = [ev.offsetX, ev.offsetY];
	}

	if (drawState.mouseDown) {
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
	    drawState.mouseDown = false;
	}
    }
    canvas.addEventListener('mouseup', drawEnd);
    window.addEventListener('mouseup', (ev) => {
	drawState.mouseDown = false;
    });
    canvas.addEventListener('touchend', drawEnd);
    canvas.addEventListener('touchcancel', drawEnd);
    canvas.addEventListener('mouseleave', (ev) => {
	drawEnd(ev, true);
    });
}

function addColorButton(parent, color, setColor, checked = False) {
    const button = document.createElement('input');
    button.name = 'color';
    button.type = 'radio';
    button.id = `button${color[0]}${color[1]}${color[2]}`;
    button.style = `background-color: rgb(${color[0]*255}, ${color[1]*255}, ${color[2]*255});`;
    button.className = 'color-button';
    if (checked) {
	button.checked = 'checked';
    }

    button.addEventListener('click', (ev) => {
	// ev.preventDefault();
	setColor(color);
    });

    parent.appendChild(button);

    return button;
}

function gridLayout(el, rows, cols) {
    el.style = `grid-template-rows: repeat(${rows}, 1fr); grid-template-columns: repeat(${cols}, auto);`;
}

function resizeCanvas(canvas, width, height, canvasBorderWidth) {
    canvas.width = width;
    canvas.height = height;
    canvas.style.margin = `${canvasBorderWidth}px`;
}

export default function museopaint(rootEl) {
    // DOM
    rootEl.style.width = "100vw";
    rootEl.style.height = "100vh";
    rootEl.style.backgroundColor = "#eee";

    const gizmosHtml = `
<div class="gizmos-left gizmos">
  <button id="buttonSave" style="background-image: url(/static/django_jigsaw_puzzle/images/button-save.svg)"></button>
  <button id="buttonClear" style="background-image: url(/static/django_jigsaw_puzzle/images/button-clear.svg)"></button>
  <input type="radio" name="size" class="size-button" data-radius="4" style="background-image: url(/static/django_jigsaw_puzzle/images/button-small.svg)" checked></input>
  <input type="radio" name="size" class="size-button" data-radius="12" style="background-image: url(/static/django_jigsaw_puzzle/images/button-medium.svg)"></input>
  <input type="radio" name="size" class="size-button" data-radius="22" style="background-image: url(/static/django_jigsaw_puzzle/images/button-large.svg)"></input>
  <input type="radio" name="size" class="size-button" data-radius="42" style="background-image: url(/static/django_jigsaw_puzzle/images/button-xlarge.svg)"></input>
</div>

<div id="gizmosBottom" class="gizmos-bottom gizmos">
</div>
`;
    rootEl.innerHTML = gizmosHtml;

    const canvas = document.createElement('canvas');

    const initialColor = [0, 0, 0];
    const initialRadii = [4, 8, 22, 34];

    let i = 0;
    for (let button of document.querySelectorAll('.size-button')) {
	const r = button.dataset.radius;
	button.addEventListener('click', (ev) => {
	    drawTool.radius = r;
	});
	++i;
    }

    const buttonClear = document.getElementById('buttonClear');
    const buttonSave = document.getElementById('buttonSave');

    const canvasBorderWidth = 58;
    
    rootEl.appendChild(canvas);


    const drawWidth = rootEl.clientWidth - 2 * canvasBorderWidth;
    const drawHeight = rootEl.clientHeight - 2 * canvasBorderWidth; 
    resizeCanvas(canvas, drawWidth, drawHeight, canvasBorderWidth);

    
    // Config
    let drawTool = {
	color: initialColor,
	radius: initialRadii[0],
	flow: 0.8,
	spacing: 1,
	numSegments: 16,
	vertsLen: null,
	vao: null,
    }

    const gizmosBottom = document.getElementById('gizmosBottom');
    const colorButtons = {};
    function setColor(color) {
	drawTool.color = color;
    }

    colorButtons['gray0'] = addColorButton(gizmosBottom, [0, 0, 0], setColor, true);
    colorButtons['gray1'] = addColorButton(gizmosBottom, [0.25, 0.25, 0.25], setColor, false);
    colorButtons['gray2'] = addColorButton(gizmosBottom, [0.5, 0.5, 0.5], setColor, false);
    colorButtons['gray3'] = addColorButton(gizmosBottom, [0.75, 0.75, 0.75], setColor, false);
    colorButtons['gray4'] = addColorButton(gizmosBottom, [1, 1, 1], setColor, false);

    function div255(x) { return [x[0]/255.0, x[1]/255.0, x[2]/255.0]; }
    colorButtons['skin0'] = addColorButton(gizmosBottom, div255([77, 42, 15]), setColor, false);
    colorButtons['skin1'] = addColorButton(gizmosBottom, div255([141, 85, 36]), setColor, false);
    colorButtons['skin3'] = addColorButton(gizmosBottom, div255([224,172,105]), setColor, false);
    colorButtons['skin5'] = addColorButton(gizmosBottom, div255([255,219,172]), setColor, false);

    const hueCount = 10;
    const lightnessCount = 3;
    for (let lightnessIdx = 0; lightnessIdx < lightnessCount; ++lightnessIdx) {
	let color = [1, 0, 0];
	color = adjustLightness(color, -0.15*lightnessIdx);
	// color = adjustSaturation(color, -0.25*lightnessIdx);
	for (let hueIdx = 0; hueIdx < hueCount; ++hueIdx) {
	    colorButtons[color] = addColorButton(gizmosBottom, color, setColor, false);
	    color =  adjustHue(color, 265/hueCount);
	}
    }
    gridLayout(gizmosBottom, 1, hueCount*lightnessCount + 5 + 4);

    const gizmosLeft = document.querySelector('.gizmos-left');
    gridLayout(gizmosLeft, gizmosLeft.children.length + 1, 1);


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
	paintingFramebuffer: paintingFramebuffer,
	strokeFramebuffer: strokeFramebuffer,
	saveCanvas: false,
    };



    // deal with resizing by changing canvas size and re-creating framebuffers
    window.addEventListener('resize', (ev) => {
	const drawWidth = rootEl.clientWidth - 2 * canvasBorderWidth;
	const drawHeight = rootEl.clientHeight - 2 * canvasBorderWidth; 
	resizeCanvas(canvas, drawWidth, drawHeight, canvasBorderWidth);
	drawState.strokeFramebuffer = recreateFramebuffer(gl, drawState.strokeFramebuffer, drawWidth, drawHeight);
	drawState.paintingFramebuffer = recreateFramebuffer(gl, drawState.paintingFramebuffer, drawWidth, drawHeight);
	clearToDrawToolColor(gl, drawState, drawTool);
    });


    buttonClear.addEventListener('click', (ev) => {
	const clear = confirm("Really clear to selected color? You will lose your work!");
	if (clear) {
	    clearToDrawToolColor(gl, drawState, drawTool);
	}
    });

    buttonSave.addEventListener('click', (ev) => {
	drawState.saveCanvas = true;
    });

    function render(reqAnimationFrame) {
	gl.viewport(0, 0, canvas.width, canvas.height);
	
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
            renderStroke(gl, canvas.width, canvas.height,
			 drawState.strokeFramebuffer, strokeShader, drawTool, coords);
	}

        // Draw painting on default framebuffer
        renderFramebuffer(gl, canvas.width, canvas.height,
			  drawState.paintingFramebuffer.texture, null,
			  quadShader, quadVao, true);

	if (drawState.saveCanvas) {
	    canvas.toBlob((blob) => {
		const csrfToken = getCSRFToken();
		console.log("Got me a blob", blob, csrfToken);

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
		      // console.log('Success:', url, data);
		      const modalTitle = document.querySelector("#modal .modal-title");
		      modalTitle.innerHTML = "Scan this QR-Code to take home your work!"
		      const modalBody = document.querySelector("#modal .modal-body");
		      modalBody.innerHTML = data.qr_code_svg;
		      // modalBody.innerHTML += `<a href="${url}">Link</a>`;
		      const modal = new bootstrap.Modal('#modal');

		      modal.show();
		  })
		  .catch(error => {
			console.error('Error:', error);
		  });
	    });

	    // we're done here.
	    drawState.saveCanvas = false;
	}

	if (drawState.mouseDown) {
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

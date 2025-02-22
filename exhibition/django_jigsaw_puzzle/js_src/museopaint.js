import { renderStroke, renderFramebuffer, initGl } from './gl.js' 
import { dist } from './common.js';

function hex2rgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [parseInt(result[1], 16) / 256, parseInt(result[2], 16) / 256, parseInt(result[3], 16) / 256];
}

function finalizeStroke(gl, strokeFramebuffer, paintingFramebuffer, quadShader, quadVao) {
    console.log("Finalize stroke");

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
	drawState.strokeCoords.push([x, y]);
	// drawState.posLast = [x, y];
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
 	    // const d = dist(pos, drawState.posLast);

	    // drawState.traceDist += d;

	    // if (drawState.traceDist >= drawTool.spacing) {
		drawState.strokeCoords.push(pos);

		// drawState.traceDist = 0;
		// drawState.drawnLast = pos;
	    // }

	    // drawState.posLast = pos;
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
	// if (!drawState.drawnLast[0]) {
	//     const pos = [ev.clientX, ev.clientY];
	//     for (let i = 0; i < 1; ++i) {
	//         drawDot(gl, strokeShader, pos, vertsLen, dotColor, dotRadius, dotFlow);
	//     }
	// }
	finalizeStroke(gl, strokeFramebuffer, paintingFramebuffer, quadShader, quadVao);

	drawState.strokeCoords = [];
	drawState.mouseDown = false;
	// drawState.drawnLast = [null, null];
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
	// posLast: [null, null],
	// drawnLast: [null, null],
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
    // render();
    requestAnimationFrame(() => render(true));
}

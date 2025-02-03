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

    // The drawing
    const ctx = canvas.getContext('2d', { colorSpace: "display-p3" });


    // Config
    const dotThreshold = 0.1;
    let dotRadius = 30;
    let dotOpacity = 2;
    let dotColor = [0, 20, 255];


    // ctx.fillStyle =  'rgba(255 165 0 / 15%)';

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
	    for (let i = 0; i < 20; ++i) {
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
	    if (dotRadius < 1) {
		dotRadius = 1;
	    }
	} else {
	    dotOpacity += -ev.deltaY/500;
	    if (dotOpacity < 0) {
		dotOpacity = 0;
	    }
	    if (dotOpacity >= 100) {
		dotOpacity = 100;
	    }
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

	// const grd = ctx.createRadialGradient(x, y, 0, x, y, radius/5, opacity);
	// grd.addColorStop(0, `rgba(${r} ${g} ${b} / 100%)`);
	// grd.addColorStop(1, `rgba(${r} ${g} ${b} / 0%)`);
	// ctx.fillStyle = grd;
	ctx.fillStyle = `rgba(${r} ${g} ${b} / ${opacity}%)`;
	// ctx.globalAlpha = opacity/100;
	
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2*Math.PI, 0);
	ctx.closePath();
	ctx.fill();
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

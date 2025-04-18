import React from 'react';
import { useState, useEffect, useRef } from 'react';

import { ModalDialog } from './ModalDialog';
import { useTimeout } from './useTimeout';

import { renderStroke, renderFramebuffer, initGl } from './gl.js';
import { hslToRgb, adjustLightness, adjustHue,
	 init, drawTool, drawState, uiFunctions } from './museopaint';

function GizmosLeft({radii,
		     saveClick,
		     clearClick,
		     radiusClick}) {
    const rows = 7;
    const cols = 1;
    return (
	<div className="gizmos-left gizmos"
	     style={{gridTemplateRows: `repeat(${rows}, 1fr)`,
		     gridTemplateColumns: `repeat(${cols}, auto)`}}>
	    <button id="buttonSave"
		    style={{backgroundImage: "url(/static/django_jigsaw_puzzle/images/button-save.svg)"}}
		    onClick={saveClick}>
	    </button>
	    <button id="buttonClear"
		    style={{backgroundImage: "url(/static/django_jigsaw_puzzle/images/button-clear.svg)"}}
	    	    onClick={clearClick}>
	    </button>
	    <input type="radio"
		   name="size"
		   className="size-button"
		   style={{backgroundImage: "url(/static/django_jigsaw_puzzle/images/button-small.svg)"}}
		   defaultChecked
	    	   onClick={(ev) => radiusClick(radii[0])}>
	    </input>
	    <input type="radio"
		   name="size"
		   className="size-button"
		   style={{backgroundImage: "url(/static/django_jigsaw_puzzle/images/button-medium.svg)"}}
	    	   onClick={(ev) => radiusClick(radii[1])}>
	    </input>
	    <input type="radio"
		   name="size"
		   className="size-button"
		   style={{backgroundImage: "url(/static/django_jigsaw_puzzle/images/button-large.svg)"}}
	    	   onClick={(ev) => radiusClick(radii[2])}>
	    </input>
	    <input type="radio"
		   name="size"
		   className="size-button"
		   style={{backgroundImage: "url(/static/django_jigsaw_puzzle/images/button-xlarge.svg)"}}
	    	   onClick={(ev) => radiusClick(radii[3])}>
	    </input>
	</div>
    );
}

function ColorButtons({set, colors}) {
   return colors.map(c => {
	const [r, g, b] = c;
	return (
	    <input type="radio"
		   name="color"
		   key={`${r}${g}${b}`}
		   className="color-button"
		   style={{backgroundColor: `rgb(${r*255}, ${g*255}, ${b*255})`}}
		   onClick={(ev) => set([r, g, b])} />
	);
    });
}

function GrayColorButtons({count, set}) {
    const colors = [];
    for (let i = 0; i < count; ++i) {
	const v = i / (count-1);
	colors.push([v, v, v]);
    }
    return <ColorButtons set={set}
			 colors={colors}/>;
}
		      
function SkinColorButtons({count, set}) {
    const colors = [];

    const darkColor = [15/360.0, 0.50, 0.04];
    const midColor = [15/360.0, 0.56, 0.40];
    const lightColor = [25/360.0, 0.73, 0.85];
    if (count === 2) {
	colors.push(hslToRgb(...darkColor));
	colors.push(hslToRgb(...lightColor));
    } else if (count === 3) {
	colors.push(hslToRgb(...darkColor));
	colors.push(hslToRgb(...midColor));
	colors.push(hslToRgb(...lightColor));
    } else {
	const c = Math.floor((count - 3) / 2);
	for (let i = 0; i < c + 2; i++) {
            const ratio = i / ((c + 2) - 1);
            const h = darkColor[0] * (1-ratio) + midColor[0] * ratio;
            const s = darkColor[1] * (1-ratio) + midColor[1] * ratio;
            const l = darkColor[2] * (1-ratio) + midColor[2] * ratio;
	    colors.push(hslToRgb(h, s, l));
	}
	for (let i = 1; i < c + 1; i++) {
            const ratio = i / ((c + 1) - 1);
            const h = midColor[0] * (1-ratio) + lightColor[0] * ratio;
            const s = midColor[1] * (1-ratio) + lightColor[1] * ratio;
            const l = midColor[2] * (1-ratio) + lightColor[2] * ratio;
	    colors.push(hslToRgb(h, s, l));
	}
    }

    return <ColorButtons set={set}
			 colors={colors}/>;    
}

function ColorColorButtons({hueCount, lightnessCount, set}) {
    const colors = [];

    for (let lightnessIdx = 0; lightnessIdx < lightnessCount; ++lightnessIdx) {
	let linearColor = [1, 0, 0];
	linearColor = adjustLightness(linearColor, -0.20*lightnessIdx);
	let hueIncrement = (360-30) / hueCount;
	for (let hueIdx = 0; hueIdx < hueCount; ++hueIdx) {
	    colors.push(linearColor);
	    linearColor =  adjustHue(linearColor, hueIncrement);
	}
    }

    return <ColorButtons set={set}
			 colors={colors}/>;    
}


function GizmosBottom({setColor,
		       grayCount,
		       skinCount,
		       hueCount,
		       lightnessCount}) {
    const rows = 1;
    const cols = hueCount * lightnessCount + 5 + 5;
    return (
	<div id="gizmosBottom"
	     className="gizmos-bottom gizmos"
	     style={{gridTemplateRows: `repeat(${rows}, 1fr)`,
		     gridTemplateColumns: `repeat(${cols}, auto)`}}>
	    <GrayColorButtons count={grayCount}
			      set={setColor} />
	    <SkinColorButtons count={skinCount}
			      set={setColor} />
	    <ColorColorButtons hueCount={hueCount}
			       lightnessCount={lightnessCount}
			       set={setColor} />
	</div>
    );
}

export
function PaintGame({firstTimeout, secondTimeout}) {
    const canvasRef = useRef(null);

    const [ showModal, setShowModal ] = useState();
    const [ modalTitle, setModalTitle ] = useState();
    const [ modalRawBody, setModalRawBody ] = useState();
    const [ modalActions, setModalActions ] = useState([]);

    const setRadius = (radius) => {
	drawTool.radius = radius
    }
    const setColor = (c) => {
	drawTool.color = c;
    };
    const save = () => {
	drawState.saveCanvas = true;
    }
    const clearCanvas = () => {
	drawState.clearCanvas = true;
    }
    
    // Once on load
    useEffect(() => {
	init(canvasRef.current);

	// Allows non-react code to show the react modal
	uiFunctions.showModal = (title, body) => {
	    setModalTitle(title);
	    setModalRawBody(body);
	    setModalActions([{
		type: 'close',
		caption: "Close",
	    }]);
	    setShowModal(true);
	}
    }, []);

    const [resetTimeout, showTimeoutModal] = useTimeout((resetTimeout) => {
	setModalTitle("No activity");
	setModalRawBody("You have not painted for a while. Do you want to continue? If you don't react your painting will be deleted soon.");
	setModalActions([
	    {
		type: 'callback',
		caption: "Continue painting",
		callback: () => {
		    resetTimeout();
		}
	    }]);
    }, clearCanvas, firstTimeout, secondTimeout);

    useEffect(() => {
	uiFunctions.updateLastAction = resetTimeout
    }, [resetTimeout]);
    
    useEffect(() => {
	setShowModal(showTimeoutModal);
    }, [showTimeoutModal]);
    
    return (
	<>
	    <ModalDialog
		show={showModal}
		setShow={setShowModal}
		title={modalTitle}
		rawBody={modalRawBody}
		actions={modalActions}
	    />
	    <GizmosLeft
		radii={[4, 12, 22, 42]}
		saveClick={save}
		clearClick={clearCanvas}
		radiusClick={setRadius} />
	    <GizmosBottom
		setColor={setColor}
		grayCount={4}
		skinCount={7}
		hueCount={11}
		lightnessCount={3}
	    />
	    <canvas ref={canvasRef} />
	</>
    );
}

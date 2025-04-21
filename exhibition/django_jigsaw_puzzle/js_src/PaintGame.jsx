import React from 'react';
import { useState, useEffect, useRef } from 'react';

import { ModalDialog } from './ModalDialog';
import { useTimeout } from './useTimeout';
import { GrayColorButtons, SkinColorButtons, ColorColorButtons } from './Colors';

import { renderStroke, renderFramebuffer, initGl } from './gl.js';
import { hslToRgb, adjustLightness, adjustHue,
	 init, drawTool, drawState, uiFunctions } from './museopaint';
import { SRGBtoLinear } from './common';

function GizmosLeft({allowTakeHome,
		     radii,
		     saveClick,
		     clearClick,
		     radiusClick}) {
    const rows = 7;
    const cols = 1;
    return (
	<div className="gizmos-left gizmos"
	     style={{gridTemplateRows: `repeat(${rows}, 1fr)`,
		     gridTemplateColumns: `repeat(${cols}, auto)`}}>
	    { allowTakeHome &&
	      <button id="buttonSave"
		      style={{backgroundImage: "url(/static/django_jigsaw_puzzle/images/button-save.svg)"}}
		      onClick={saveClick}>
	      </button>
	    }
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
			      set={setColor}
			      selectedIndex={0} />
	    <SkinColorButtons count={skinCount}
			      set={setColor} />
	    <ColorColorButtons hueCount={hueCount}
			       lightnessCount={lightnessCount}
			       set={setColor}/>
	</div>
    );
}

function generateSessionId() {
    return self.crypto.randomUUID();
}

export
function PaintGame({allowTakeHome,
		    idleFirstSeconds, idleSecondSeconds,
		    colorCountGray, colorCountSkin,
		    colorCountHue, colorCountBrightness }) {
    const canvasRef = useRef(null);

    allowTakeHome = allowTakeHome === "True"; // Python -> JS
    idleFirstSeconds = parseInt(idleFirstSeconds);
    idleSecondSeconds = parseInt(idleSecondSeconds);
    colorCountGray = parseInt(colorCountGray);
    colorCountSkin = parseInt(colorCountSkin);
    colorCountHue = parseInt(colorCountHue);
    colorCountBrightness = parseInt(colorCountBrightness);

    const [ sessionId, setSessionId ] = useState();

    const [ showModal, setShowModal ] = useState(false);
    const [ modalTitle, setModalTitle ] = useState();
    const [ modalRawBody, setModalRawBody ] = useState();
    const [ modalActions, setModalActions ] = useState([]);

    const [ showClearModal, setShowClearModal ] = useState(false);

    const setRadius = (radius) => {
	drawTool.radius = radius
    }
    const setColor = (c) => {
	drawTool.color = SRGBtoLinear(c);
    };
    const save = () => {
	drawState.saveCanvas = true;
    }
    const setNewSessionId = () => {
	const sid = generateSessionId();
	drawState.sessionId = sid;
	setSessionId(sid);
    }
    const clearCanvasNoAsk = () => {
	drawState.clearCanvas = true;
	setNewSessionId();
	setShowClearModal(false);
    }
    const clearCanvas = () => {
	setModalTitle("Clear your painting?");
	setModalRawBody("Do you really want to delete all your painting and start again?");
	setModalActions([
	    {
		type: 'close',
		caption: "No, continue!"
	    },
	    {
		type: 'callback',
		caption: "Yes, delete!",
		callback: clearCanvasNoAsk,
	    }]);
	setShowClearModal(true);
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

	setNewSessionId();
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
    }, clearCanvasNoAsk, idleFirstSeconds, idleSecondSeconds);

    useEffect(() => {
	uiFunctions.updateLastAction = resetTimeout
    }, [resetTimeout]);

    // Combine timeout and clear modal state to determine if modal is visible.
    useEffect(() => {
	setShowModal(showTimeoutModal || showClearModal);
    }, [showTimeoutModal, showClearModal]);
    
    return (
	<>
	    <ModalDialog
		show={showModal}
		setShow={() => {
		    setShowClearModal(false);
		    setShowModal(false);
		}}
		title={modalTitle}
		rawBody={modalRawBody}
		actions={modalActions}
	    />
	    <GizmosLeft
		allowTakeHome={allowTakeHome}
		radii={[4, 12, 22, 42]}
		saveClick={save}
		clearClick={clearCanvas}
		radiusClick={setRadius} />
	    <GizmosBottom
		setColor={setColor}
		grayCount={colorCountGray}
		skinCount={colorCountSkin}
		hueCount={colorCountHue}
		lightnessCount={colorCountBrightness}
	    />
	    <canvas ref={canvasRef} />
	</>
    );
}

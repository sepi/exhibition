import React from 'react';
import { useEffect } from 'react';

import { puzzle } from 'jigsaw-puzzle';

async function initPuzzle(id, imageUrl, rows, cols, onComplete, initialZoom) {
    const p = puzzle({
	element: id,
	image: imageUrl,
	pieces: { x: rows, y: cols },
	attraction: 5,   // distance to snap pieces
	aligned: true,   // don't overlap pieces on start
	zoom: initialZoom,       // initial zoom of context
	beforeInit: (canvas) => {},
	onInit: (state) => {
	    // state.ui.ctx.imageSmoothingEnabled = false;
	},
	onChange: (state) => {},
	onComplete: onComplete,
    })
    p.then((p2) => p2.centralize()); // make sure the canvas does not keep its panning state
    return p;
}

export function Puzzle({imageUrl, rows, cols, onComplete, initialZoom}) {
    useEffect(() => {
	(async () => {
	    if (!window.pzleInitialied) {
		window.pzleInitialied = true;
		window.pzle = await initPuzzle('#puzzle', imageUrl, rows, cols, onComplete, initialZoom);
	    }
	})();
    }, []);

    return (
	<>
	    <div id="puzzle"
		 style={{height: "calc( 100vh - 48px - 5px - 20px)",
			 width: "100vw"}}/>
	</>
    );
}

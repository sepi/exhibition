import React from 'react';
import ReactDOM from 'react-dom/client';

import JigsawPuzzleApp from './JigsawPuzzleApp';
import MemoryGameApp from './MemoryGameApp';

import museopaint from './museopaint';

const rootEl = document.getElementById('game');
const root = ReactDOM.createRoot(rootEl);
const mode = rootEl.dataset.mode;
if (mode !== 'PAINT_GAME') {
    root.render(
	<React.StrictMode>
	    { mode === 'JIGSAW_PUZZLE' && 
	      <JigsawPuzzleApp { ...rootEl.dataset } />
	    }
	    { mode === 'MEMORY_GAME' &&
	      <MemoryGameApp { ...rootEl.dataset } />
	    }
	</React.StrictMode>
    );
} else if (mode === 'PAINT_GAME') {
    document.addEventListener('DOMContentLoaded', () => {
	museopaint();
    });
} else {
    alert("Unknown game type. Please report bug to the programmer!");
}

import React from 'react';
import ReactDOM from 'react-dom/client';

import JigsawPuzzleApp from './JigsawPuzzleApp';
import MemoryGameApp from './MemoryGameApp';
import PaintGameApp from './PaintGameApp';

const rootEl = document.getElementById('game');
const root = ReactDOM.createRoot(rootEl);
const mode = rootEl.dataset.mode;
root.render(
    <React.StrictMode>
        { mode === 'JIGSAW_PUZZLE' && 
          <JigsawPuzzleApp { ...rootEl.dataset } />
        }
        { mode === 'MEMORY_GAME' &&
          <MemoryGameApp { ...rootEl.dataset } />
        }
        { mode === 'PAINT_GAME' &&
          <PaintGameApp firstTimeout={2*60}
			secondTimeout={3*60} { ...rootEl.dataset } />
        }
    </React.StrictMode>
);

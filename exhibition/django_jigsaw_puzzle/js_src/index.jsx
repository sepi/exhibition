import React from 'react';
import ReactDOM from 'react-dom/client';

import JigsawPuzzleApp from './JigsawPuzzleApp';
import MemoryGameApp from './MemoryGameApp';
import PaintGameApp from './PaintGameApp';
import QuizGameApp from './QuizGameApp';

const rootEl = document.getElementById('game');
const mode = rootEl.dataset.mode;
ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
        { mode === 'JIGSAW_PUZZLE' && 
          <JigsawPuzzleApp { ...rootEl.dataset } />
        }
        { mode === 'MEMORY_GAME' &&
          <MemoryGameApp { ...rootEl.dataset } />
        }
        { mode === 'PAINT_GAME' &&
          <PaintGameApp { ...rootEl.dataset } />
        }
        { mode === 'QUIZ_GAME' &&
          <QuizGameApp { ...rootEl.dataset } />
        }
    </React.StrictMode>
);

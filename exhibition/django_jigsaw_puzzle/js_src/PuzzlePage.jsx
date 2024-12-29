import React from 'react';
import { useState, useEffect } from 'react';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { Puzzle } from './Puzzle.jsx';

let lastAction = undefined;
let puzzleStart = undefined;

export function PuzzlePage({puzzleImageUrl,
			    puzzlePieces,
			    showSuccess,
			    onComplete,
			    navigateToSelectScreen,
			    initialZoom,
			    idleFirstSeconds,
			    idleSecondSeconds}) {
    const [timeoutWarn, setTimeoutWarn] = useState(false);
    const [runningSinceForMessage, setRunningSinceForMessage] = useState();

    const getShowSuccess = () => showSuccess;
    
    useEffect(() => {
	lastAction = new Date();
	puzzleStart = new Date();
	const interval = setInterval(() => {
	    const now = new Date();
	    const runningSince = now - puzzleStart;
	    if (!getShowSuccess()) { // Halt timers when done!
		const idleSince = now - lastAction;
		if (idleSince > idleSecondSeconds * 1000) {
		    navigateToSelectScreen();
		} else if (idleSince > idleFirstSeconds * 1000) {
		    setTimeoutWarn(true);
		}
		
		if (!runningSinceForMessage) {
		    setRunningSinceForMessage(runningSince);
		}
	    }
	}, 1000);

	return () => {
	    clearInterval(interval);
	}
    }, [showSuccess]);

    const setLastActionNow = () => {
	setTimeoutWarn(false);
	lastAction = new Date();
    }

    const runningSinceS = runningSinceForMessage / 1000;
    const runningSinceStr =
	  `${Math.floor(runningSinceS / 60)} minutes and ${ Math.floor(runningSinceS) % 60} seconds`;
    return (puzzleImageUrl && puzzlePieces ?
	    (<>
		 <Snackbar open={timeoutWarn} onClose={setLastActionNow}>
		     <Alert onClose={setLastActionNow}
			    severity="warning">
			 You didn't play for some time now. Close this message or move a piece to continue your game!
		     </Alert>
		 </Snackbar>
		 <Snackbar open={showSuccess} onClose={navigateToSelectScreen}>
		   <Alert severity="success"
			  variant="filled">
		       {`Success, you completed the puzzle in ${runningSinceStr}. Go back to try another one`}
		   </Alert>
		 </Snackbar>
		 <Puzzle imageUrl={puzzleImageUrl}
			 pieces={puzzlePieces}
			 onComplete={onComplete}
			 initialZoom={initialZoom}/>
	     </>) : null
	   );
}

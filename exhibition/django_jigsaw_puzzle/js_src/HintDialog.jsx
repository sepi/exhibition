import React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

export function HintDialog({showHint, setShowHint, puzzleImageUrl}) {
    return (
	<Dialog open={showHint}
		onClose={() => setShowHint(false)} >
	    <DialogContent>
		<img src={puzzleImageUrl}
		     style={{height: "70vh"}}/>
		<DialogContentText id="alert-dialog-description">
		</DialogContentText>
	    </DialogContent>
	</Dialog>
    );
}

import React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

export function HintDialog({showHint, setShowHint, imageUrl}) {
    return (
	<Dialog open={showHint}
		onClose={() => setShowHint(false)}
		fullWidth={true}
		>
	    <img src={imageUrl}
		 style={{ maxWidth: "100%", maxHeight: "calc(100vh - 64px)" }}
		 />
	</Dialog>
    );
}

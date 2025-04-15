import React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

export function SaveDialog({show, setShow, dialogTitle}) {
    return (
	<Dialog
	    open={show}
	    onClose={() => setShow(false)}
	    aria-labelledby="alert-dialog-title"
	    aria-describedby="alert-dialog-description" >
	    <DialogTitle id="alert-dialog-title">
		{dialogTitle}
	    </DialogTitle>
	    <DialogContent>
		<DialogContentText id="alert-dialog-description">
		    Hello
		</DialogContentText>
	    </DialogContent>
	    <DialogActions> 
		<Button onClick={() => setShow(false)}>Ok</Button>
	    </DialogActions>
	</Dialog>
    );
}

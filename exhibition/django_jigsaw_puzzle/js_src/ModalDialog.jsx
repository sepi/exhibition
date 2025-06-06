import React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

export function ModalDialog({show, setShow, actions,
			     title, rawBody, body}) {
    const actionButtons = actions.map(a => {
	if (a.type === 'close') {
	    return <Button key={a.caption} onClick={() => setShow(false)}>{ a.caption }</Button>;
	} else if (a.type === 'callback') {
	    return <Button key={a.caption} onClick={a.callback}>{ a.caption }</Button>;
	} else {
	    return <Button key={a.caption}>{ a.caption }</Button>;
	}
    });
    return (
	<Dialog
	    open={show}
	    onClose={() => setShow(false)}
	    aria-labelledby="alert-dialog-title"
	    aria-describedby="alert-dialog-description" >
	    <DialogTitle id="alert-dialog-title">
		{ title }
	    </DialogTitle>
	    <DialogContent>
		{ rawBody && 
		  <DialogContentText id="alert-dialog-description"
				   dangerouslySetInnerHTML={{ __html: rawBody }}>
		  </DialogContentText> }
		{ body && 
		  <DialogContentText id="alert-dialog-description">
		      { body }
		  </DialogContentText> }
	    </DialogContent>
	    <DialogActions>
		{ actionButtons }
	    </DialogActions>
	</Dialog>
    );
}

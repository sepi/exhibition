import React from 'react';
import { useState, useEffect } from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';

export function Appbar({title, logoUrl, onBack, onShowInfo, setShowHint}) {
    return (
	<AppBar position="sticky" sx={{top: 0, left: 0}} >
	    <Toolbar variant="dense"
		     sx={{backgroundColor: '#dfb431', color: '#333'}}>
		{ logoUrl &&
		  <img src={logoUrl}
		       alt="Logo"
		       height={38} />
		}
		<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
		    {title}
		</Typography>

		<IconButton
		    size="large"
		    edge="start"
		    color="inherit"
		    aria-label="back"
		    sx={{ mr: 1 }}
		    onClick={onShowInfo} >
		    <InfoIcon/>
		</IconButton>

		{ onBack &&
		  <IconButton
		      size="large"
		      edge="start"
		      color="inherit"
		      aria-label="back"
		      sx={{ mr: 1 }}
		      onClick={setShowHint} >
		      <QuestionMarkIcon />
		  </IconButton>
		}
		
		{/* { onBack && */} 
		{/*   <IconButton */} 
		{/*       size="large" */} 
		{/*       edge="start" */} 
		{/*       color="inherit" */} 
		{/*       aria-label="back" */} 
		{/*       sx={{ mr: 1 }} */} 
		{/*       onClick={puzzleCenter} > */} 
		{/*       <CenterFocusStrongIcon/> */} 
		{/*   </IconButton> */} 
		{/* } */} 

		{ onBack && 
		  <IconButton
		      size="large"
		      edge="start"
		      color="inherit"
		      aria-label="back"
		      sx={{ mr: 1 }}
		      onClick={onBack} >
		      <ArrowBackIcon/>
		  </IconButton>
		}
	    </Toolbar>
	</AppBar>
    );
}

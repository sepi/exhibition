import React from 'react';
import { useState, useEffect } from 'react';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { Appbar } from './Appbar.jsx';
import { WelcomeScreen } from './WelcomeScreen.jsx';
import { PaintGame } from './PaintGame.jsx';
import { DifficultySelector } from './DifficultySelector.jsx';

export default
function PaintGameApp({}) {
    const [screen, setScreen] = useState('game');
    
    useEffect(() => {
    }, []);

    return (
	<div className="App">
	    { screen === 'game' && 
	      <PaintGame />
	    }
	</div>
    );
}


import React from 'react';
import { useState, useEffect } from 'react';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { Appbar } from './Appbar.jsx';
import { WelcomeScreen } from './WelcomeScreen.jsx';
import { MemoryGame } from './MemoryGame.jsx';
import { DifficultySelector } from './DifficultySelector.jsx';
import { CopyrightNotice } from './CopyrightNotice.jsx';

import { fetchImagePaths, fetchGameData } from './api.js';

export default
function QuizGameApp({title, }) {
    // Load puzzle data (difficulty levels, name and images) from API
    useEffect(() => {
	const get = async ()=> {
	    // const game = await fetchGameData(gameUrl);
	    // setDifficultyLevels(game.difficulty_levels);
	    // const images_ = await fetchImagePaths(game.image_set_url+'?thumbnail_alias=memory_game');
	    // setImages(images_);
	}

	get();
    }, []);

    return (
	<div className="App">
	    <Appbar title={title}
		    logoUrl={false}
		    onBack={false}
		    onShowInfo={false}
		    setShowHint={false}
		    navbarBackgroundColor={"white"} />
	    <Snackbar open={null} onClose={null}>
		<Alert severity="success"
		       variant="filled">
		    {`Success, you completed the game in ${1} turns! Tap back to try another one.`}
		</Alert>
	    </Snackbar>
	    { screen === 'game' && 
	      <div>yay</div>
	    }
	</div>
    );
}

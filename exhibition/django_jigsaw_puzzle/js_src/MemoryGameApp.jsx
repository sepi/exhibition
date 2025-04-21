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

function chooseAndRemoveRandomEl(a) {
    const randIdx = Math.floor(Math.random()*a.length);
    const randEl = a[randIdx];
    if (randEl['removed'] === 1) {
	a.splice(randIdx, 1);
    } else {
	a[randIdx]['removed'] = 1;
    }
    return randEl;
}

export default
function MemoryGameApp({gameUrl,
			title,
			logoUrl,
			copyrightNotice,
			navbarBackgroundColor,
			cardBackImageUrl,
			cardHiddenImageUrl,
			aspectRatio,
			cardFrontBackgroundColor,
			cardWidth}) {
    const [ screen, setScreen ] = useState('select_difficulty');
    const [ images, setImages ] = useState();
    const [ randomImages, setRandomImages ] = useState([]);
    const [ difficultyLevels, setDifficultyLevels ] = useState([]);
    const [ pieces, setPieces ] = useState([undefined, undefined]);
    const [ showSuccess, setShowSuccess ] = useState(false);
    const [ flips, setFlips ] = useState();

    const onWin = (flips) => {
	setFlips(flips);
	setShowSuccess(true);
    }

    const hideSuccess = () => {
	setShowSuccess(false);
    };

    // Load puzzle data (difficulty levels, name and images) from API
    useEffect(() => {
	const get = async ()=> {
	    const game = await fetchGameData(gameUrl);
	    setDifficultyLevels(game.difficulty_levels);
	    const images_ = await fetchImagePaths(game.image_set_url+'?thumbnail_alias=memory_game');
	    setImages(images_);
	}

	get();
    }, []);

    function genRandImages() {
	const [rows, cols] = pieces;
	let randImgs = Array(rows).fill(0).map(x => Array(cols).fill(0));
	// Work only with the images needed
	const images_trimmed = images.slice(0, rows*cols/2);

	// Undo the effect of previous invocations of chooseAndRemoveRandomEl
	for (let img of images) {
	    img['removed'] = false;
	}
	
	[...Array(rows).keys()].map((row) =>
	    [...Array(cols).keys()].map((col) => {
		const img = chooseAndRemoveRandomEl(images_trimmed)['memory_game'];
		randImgs[row][col] = img;
	    })
	);
	
	setRandomImages(randImgs);
    }
    
    // Once images were fetched, assign images to cards
    useEffect(() => {
	if (!pieces[0] || !images) return;
	
	genRandImages();
    }, [images, pieces]);

    const selectDifficulty = () => setScreen('select_difficulty');
    const startGame = (level) => {
	setPieces([level.rows, level.columns]);
	setScreen('game');
    };

    const navigateToSelectScreen = () => {
	setScreen('select_difficulty');
	// setShowSucces(false);
	// window.pzleInitialied = false;
	//FIXME: should re-shuffle images
	genRandImages();
    };
    
    let back = null;
    if (screen === 'game') {
	back = navigateToSelectScreen;
    }
    
    return (
	<div className="App">
	    <Appbar title={title}
		    logoUrl={logoUrl}
		    onBack={back}
		    onShowInfo={false}
		    setShowHint={false}
		    navbarBackgroundColor={navbarBackgroundColor} />
	    <Snackbar open={showSuccess} onClose={hideSuccess}>
		<Alert severity="success"
		       variant="filled">
		    {`Success, you completed the game in ${flips} turns! Tap back to try another one.`}
		</Alert>
	    </Snackbar>
	    { screen === 'select_difficulty' &&
	      <DifficultySelector difficultyLevels={difficultyLevels}
				  onClick={startGame}/>
	    }
	    { screen === 'game' && 
	      <MemoryGame randomImages={randomImages}
			  pieces={pieces}
			  onWin={onWin}
			  cardHiddenImageUrl={cardHiddenImageUrl}
			  cardBackImageUrl={cardBackImageUrl}
			  aspectRatio={aspectRatio}
			  cardFrontBackgroundColor={cardFrontBackgroundColor}
			  cardWidth={cardWidth}
	      />
	    }
	    <CopyrightNotice notice={copyrightNotice} />
	</div>
    );
}

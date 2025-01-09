import React from 'react';
import { useState, useEffect } from 'react';

import { Appbar } from './Appbar.jsx';
import { WelcomeScreen } from './WelcomeScreen.jsx';
import { MemoryGame } from './MemoryGame.jsx';
import { DifficultySelector } from './DifficultySelector.jsx';

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
			navbarBackgroundColor}) {
    const [ screen, setScreen ] = useState('welcome');
    const [ images, setImages ] = useState();
    const [ randomImages, setRandomImages ] = useState([]);
    const [ difficultyLevels, setDifficultyLevels ] = useState([]);
    const [ pieces, setPieces ] = useState([undefined, undefined]);

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

    // Once images were fetched, assign images to cards
    useEffect(() => {
	if (!pieces[0] || !images) return;
	
	const [rows, cols] = pieces;
	let randImgs = Array(rows).fill(0).map(x => Array(cols).fill(0));
	// Work only with the images needed
	const images_trimmed = images.slice(0, rows*cols/2);
	[...Array(rows).keys()].map((row) =>
	    [...Array(cols).keys()].map((col) => {
		const img = chooseAndRemoveRandomEl(images_trimmed)['memory_game'];
		randImgs[row][col] = img;
	    })
	);
	
	setRandomImages(randImgs);
    }, [images, pieces]);

    const selectDifficulty = () => setScreen('select_difficulty');
    const startGame = (level) => {
	setPieces([level.rows, level.columns]);
	setScreen('game');
    };
    
    return (
	<div className="App">
	    <Appbar title={"Memory game"}
		    logoUrl={logoUrl}
		    onBack={() => true}
		    onShowInfo={() => true}
		    setShowHint={() => true}
		    navbarBackgroundColor={navbarBackgroundColor} />
	    { screen === 'welcome' &&
	      <WelcomeScreen next={selectDifficulty} />
	    }
	    { screen === 'select_difficulty' &&
	      <DifficultySelector difficultyLevels={difficultyLevels}
				  onClick={startGame}/>
	    }
	    { screen === 'game' && 
	      <MemoryGame randomImages={randomImages}
			  pieces={pieces}
			  onWin={(flips) => alert("Win in " + flips + " flips")}
	      />
	    }
	</div>
    );
}

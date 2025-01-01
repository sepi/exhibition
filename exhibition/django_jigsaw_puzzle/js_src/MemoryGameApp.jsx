import React from 'react';
import { useState, useEffect } from 'react';

import { Appbar } from './Appbar.jsx';
import { WelcomeScreen } from './WelcomeScreen.jsx';
import { MemoryGame } from './MemoryGame.jsx';
import { DifficultySelector } from './DifficultySelector.jsx';

import { fetchImagePaths, fetchJigsawPuzzle } from './api.js';

function chooseAndRemoveRandomEl(a) {
    const randIdx = Math.floor(Math.random()*a.length);
    const randEl = a[randIdx];
    if (randEl['removed'] === 1) {
	a.splice(randIdx, 1);
    } else {
	randEl['removed'] = 1;
    }
    return randEl;
}

export default
function MemoryGameApp({jigsawPuzzleUrl,
			title,
			logoUrl,
			copyrightNotice,
			navbarBackgroundColor}) {
    const [ screen, setScreen ] = useState('welcome');
    const [ images, setImages ] = useState();
    const [ randomImages, setRandomImages ] = useState([]);
    const [ difficultyLevels, setDifficultyLevels ] = useState([]);
    const [ pieces, setPieces ] = useState([undefined, undefined]);

    useEffect(() => {
	const get = async ()=> {
	    const jigsawPuzzle = await fetchJigsawPuzzle(jigsawPuzzleUrl);
	    setDifficultyLevels(jigsawPuzzle.difficulty_levels);
	    const images_ = await fetchImagePaths(jigsawPuzzle.image_set_url+'?thumbnail_alias=memory_game');

	    setImages(images_);
	}
	get();
    }, []);


    useEffect(() => {
	if (!pieces[0] || !images) return;
	
	const [rows, cols] = pieces;
	let randImgs = Array(rows).fill(0).map(x => Array(cols).fill(0));
	[...Array(rows).keys()].map((row) =>
	    [...Array(cols).keys()].map((col) => {
		// Work only with the images needed
		const images_trimmed = images.slice(0, rows*cols/2);
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
	      <MemoryGame jigsawPuzzleUrl={jigsawPuzzleUrl}
			  randomImages={randomImages}
			  pieces={pieces}
	      />
	    }
	</div>
    );
}
